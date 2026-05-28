import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';
import { SocialDataService } from '../social-data.service';
import { SessionService } from '../session.service';
import {
  AvComponent,
  MIconComponent,
  PillBtnComponent,
  PostCardComponent,
  SegComponent,
  type Post,
} from '../design-system';

function formatRelativeTime(iso: string): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return Math.max(1, Math.floor(diff / 60000)) + 'm';
  if (h < 24) return h + 'h';
  return Math.floor(h / 24) + 'd';
}

@Component({
  selector: 'app-profile-desktop',
  standalone: true,
  imports: [CommonModule, AvComponent, MIconComponent, PillBtnComponent, PostCardComponent, SegComponent],
  styles: [`
    :host { display: block; background: #F3F1ED; min-height: 100%; }
    .desktop-column { max-width: 720px; margin: 0 auto; padding: 28px; }
    .profile-card {
      display: flex; align-items: flex-start; gap: 22px;
      background: rgba(255,255,255,0.6); backdrop-filter: blur(40px);
      -webkit-backdrop-filter: blur(40px); border-radius: 22px;
      padding: 24px; border: 0.5px solid rgba(0,0,0,0.06);
    }
    .profile-info { flex: 1; min-width: 0; }
    .display-name { font-size: 24px; font-weight: 700; letter-spacing: -0.3px; color: #1A1A1A; }
    .handle { font-size: 14px; color: #6E6E6E; margin-top: 2px; }
    .bio { margin-top: 8px; font-size: 15px; color: #1A1A1A; line-height: 1.4; }
    .stats-row { display: flex; gap: 16px; margin-top: 12px; font-size: 14px; color: #6E6E6E; }
    .stat-value { font-weight: 700; color: #1A1A1A; }
    .seg-row { display: flex; justify-content: center; margin: 18px 0 6px; }
    .menu-row {
      display: flex; align-items: center; padding: 13px 16px;
      font-size: 16px; color: #1A1A1A; cursor: pointer;
      border-top: 0.5px solid rgba(0,0,0,0.08);
    }
    .menu-row:first-child { border-top: none; }
  `],
  template: `
    <div data-testid="profile-page">
      <div class="desktop-column">

        <!-- Horizontal profile card -->
        <div class="profile-card">
          <av [name]="displayName()" [size]="120"></av>
          <div class="profile-info">
            <div class="display-name">{{ displayName() }}</div>
            <div class="handle">&#64;{{ session.activeUser() }}</div>
            <div *ngIf="userProfile.bio" class="bio">{{ userProfile.bio }}</div>
            <div class="stats-row">
              <span><span class="stat-value">{{ totalPosts }}</span> Posts</span>
              <span>·</span>
              <span><span class="stat-value">{{ joinedLabel() }}</span></span>
            </div>
          </div>
          <div>
            <sp-pill-btn kind="default" (onClick)="showEditMenu = !showEditMenu">
              Edit Profile
            </sp-pill-btn>
          </div>
        </div>

        <!-- Segmented control -->
        <div class="seg-row" style="width:360px;margin:18px auto 6px">
          <sp-seg
            [options]="['Posts', 'Posts & Replies']"
            [value]="activeTab"
            (onChange)="activeTab = $event">
          </sp-seg>
        </div>

        <!-- Posts list -->
        <div *ngIf="activeTab === 'Posts'" data-testid="profile-posts-card">
          <sp-post-card *ngFor="let post of mappedPosts()" [post]="post"></sp-post-card>
          <div *ngIf="!myPosts().length"
            style="padding:48px 24px;text-align:center;color:#6E6E6E;background:rgba(0,0,0,0.03);border-radius:16px">
            <p style="font-size:16px;font-family:var(--serif);color:#1A1A1A;margin:0 0 6px">Nothing posted yet</p>
            <p style="font-size:13px;margin:0">Your posts will appear here once you start sharing.</p>
          </div>
        </div>
        <div *ngIf="activeTab === 'Posts & Replies'"
          style="padding:56px 24px;text-align:center;color:#6E6E6E;background:rgba(0,0,0,0.03);border-radius:16px">
          <p style="font-size:16px;font-family:var(--serif);color:#1A1A1A;margin:0 0 6px">No replies yet</p>
          <p style="font-size:13px;margin:0">Replies to others will appear here.</p>
        </div>

      </div>
    </div>

    <!-- Edit Profile dropdown -->
    <div *ngIf="showEditMenu"
      (click)="showEditMenu = false"
      style="position:fixed;inset:0;z-index:100;background:rgba(0,0,0,0.4)">
      <div (click)="$event.stopPropagation()"
        style="position:absolute;top:200px;left:50%;transform:translateX(-50%);background:rgba(245,243,239,0.95);backdrop-filter:blur(30px);-webkit-backdrop-filter:blur(30px);border:0.5px solid rgba(0,0,0,0.08);border-radius:14px;width:250px;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,0.18)">
        <div style="padding:8px 16px 6px;font-size:12px;font-weight:600;color:#6E6E6E">Edit Profile</div>
        <div *ngFor="let item of editMenuItems"
          (click)="gotoEdit(item.route)"
          class="menu-row">
          <span style="flex:1">{{ item.label }}</span>
          <m-icon *ngIf="!item.glyph" [name]="item.icon" [size]="18"></m-icon>
          <span *ngIf="item.glyph" style="font-family:var(--serif);font-size:18px">{{ item.glyph }}</span>
        </div>
      </div>
    </div>
  `,
})
export class ProfileDesktopComponent implements OnInit {
  readonly session = inject(SessionService);
  readonly api = inject(ApiService);
  readonly data = inject(SocialDataService);
  private readonly router = inject(Router);

  activeTab = 'Posts';
  showEditMenu = false;

  readonly editMenuItems = [
    { icon: 'person', label: 'Edit Avatar', route: '/profile/edit/avatar', glyph: '' },
    { icon: 'image', label: 'Edit Header', route: '/profile/edit/header', glyph: '' },
    { icon: 'paint', label: 'Edit Details', route: '/profile/edit/details', glyph: 'Aa' },
    { icon: 'link', label: 'Edit Info and Links', route: '/profile/edit/links', glyph: '' },
  ];

  get userProfile() { return this.data.uiProfile(); }
  get totalPosts(): number { return this.myPosts().length; }

  myPosts() {
    return this.data.posts().filter((p) => p.author === this.session.activeUser());
  }

  mappedPosts(): Post[] {
    return this.myPosts().map((p) => ({
      id: p.id,
      author: this.displayName(),
      handle: '@' + p.author,
      time: formatRelativeTime(p.createdAt),
      body: p.content,
      replies: p.comments?.length ?? 0,
    }));
  }

  ngOnInit(): void {
    this.data.refreshWorkspace({ posts: true, profile: true, preferences: true, memberships: true }).subscribe();
  }

  displayName(): string {
    return (
      this.data.uiProfile().displayName ||
      this.session
        .activeUser()
        .split(/[.\s_-]+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
    );
  }

  joinedLabel(): string {
    // TODO(backend): wire to join date from profile endpoint when available
    const profile = this.data.userProfile();
    if (profile.updatedAt) {
      const d = new Date(profile.updatedAt);
      if (!isNaN(d.getTime())) {
        return 'Joined ' + d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      }
    }
    return 'Joined recently';
  }

  gotoEdit(route: string): void {
    this.showEditMenu = false;
    this.router.navigateByUrl(route);
  }
}
