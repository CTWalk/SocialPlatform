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
  selector: 'app-profile-mobile',
  standalone: true,
  imports: [CommonModule, AvComponent, MIconComponent, PillBtnComponent, PostCardComponent, SegComponent],
  styles: [`
    :host { display: block; background: #F3F1ED; min-height: 100%; }
    .profile-card {
      background: rgba(0,0,0,0.04); border-radius: 22px;
      padding: 24px 20px; display: flex; flex-direction: column;
      align-items: center; text-align: center;
    }
    .display-name { margin-top: 14px; font-size: 24px; font-weight: 700; letter-spacing: -0.3px; color: #1A1A1A; }
    .handle { font-size: 14px; color: #6E6E6E; margin-top: 2px; }
    .role-chip {
      margin-top: 8px; background: #E6E4DE; border-radius: 10px;
      padding: 2px 10px; font-size: 12px; font-weight: 600; color: #1A1A1A;
    }
    .bio { margin-top: 10px; font-size: 15px; color: #1A1A1A; line-height: 1.4; text-align: center; max-width: 280px; }
    .meta { margin-top: 18px; font-size: 14px; color: #6E6E6E; }
    .gear-overlay-backdrop {
      position: fixed; inset: 0; z-index: 100; background: rgba(0,0,0,0.3);
    }
    .menu-sheet {
      position: absolute; top: 100px; right: 16px;
      background: rgba(245,243,239,0.95); backdrop-filter: blur(30px);
      -webkit-backdrop-filter: blur(30px); border: 0.5px solid rgba(0,0,0,0.08);
      border-radius: 14px; width: 250px; overflow: hidden;
      box-shadow: 0 20px 50px rgba(0,0,0,0.18);
    }
    .menu-row {
      display: flex; align-items: center; padding: 13px 16px;
      font-size: 16px; color: #1A1A1A; cursor: pointer;
      border-top: 0.5px solid rgba(0,0,0,0.08);
    }
    .menu-row:first-child { border-top: none; }
  `],
  template: `
    <div data-testid="profile-page">

      <!-- Gear button -->
      <div style="padding:8px 16px 0;display:flex;justify-content:flex-end">
        <div (click)="showGearMenu = !showGearMenu"
          style="width:36px;height:36px;border-radius:50%;background:rgba(0,0,0,0.06);display:flex;align-items:center;justify-content:center;cursor:pointer"
          data-testid="profile-gear-btn">
          <m-icon name="gear" [size]="18"></m-icon>
        </div>
      </div>

      <!-- Profile card -->
      <div style="padding:8px 16px 0">
        <div class="profile-card">
          <av [name]="displayName()" [size]="110"></av>
          <div class="display-name">{{ displayName() }}</div>
          <div class="handle">&#64;{{ session.activeUser() }}</div>
          <div class="role-chip">{{ roleLabel() }}</div>
          <div style="margin-top:12px">
            <sp-pill-btn kind="default" (onClick)="showEditMenu = !showEditMenu">
              Edit Profile&nbsp;<m-icon name="chev-d" [size]="14" color="#1A1A1A"></m-icon>
            </sp-pill-btn>
          </div>
          <div *ngIf="userProfile.bio" class="bio">{{ userProfile.bio }}</div>
          <div class="meta">{{ joinedLabel() }}</div>
        </div>
      </div>

      <!-- Seg: Posts / Posts & Replies -->
      <div style="padding:14px 16px 6px">
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
          style="margin:0 16px;padding:48px 24px;text-align:center;color:#6E6E6E;background:rgba(0,0,0,0.03);border-radius:16px">
          <p style="font-size:16px;font-family:var(--serif);color:#1A1A1A;margin:0 0 6px">Nothing posted yet</p>
          <p style="font-size:13px;margin:0">Your posts will appear here once you start sharing.</p>
        </div>
      </div>
      <div *ngIf="activeTab === 'Posts & Replies'"
        style="margin:0 16px;padding:56px 24px;text-align:center;color:#6E6E6E;background:rgba(0,0,0,0.03);border-radius:16px">
        <p style="font-size:16px;font-family:var(--serif);color:#1A1A1A;margin:0 0 6px">No replies yet</p>
        <p style="font-size:13px;margin:0">Replies to others will appear here.</p>
      </div>

    </div>

    <!-- Gear action menu overlay -->
    <div *ngIf="showGearMenu" class="gear-overlay-backdrop" (click)="showGearMenu = false">
      <div class="menu-sheet" (click)="$event.stopPropagation()">
        <div class="menu-row" (click)="onGearAction('share')">
          <span style="flex:1">Share profile</span>
          <m-icon name="share" [size]="18"></m-icon>
        </div>
        <div class="menu-row" (click)="onGearAction('filters')">
          <span style="flex:1">Filters</span>
          <m-icon name="filter" [size]="18"></m-icon>
        </div>
        <div class="menu-row" (click)="gotoSettings()" data-testid="profile-gear-settings">
          <span style="flex:1">Settings</span>
          <m-icon name="gear" [size]="18"></m-icon>
        </div>
        <div class="menu-row" (click)="logout()" style="color:#C44545" data-testid="profile-gear-logout">
          <span style="flex:1">Sign out</span>
          <m-icon name="logout" [size]="18" color="#C44545"></m-icon>
        </div>
      </div>
    </div>

    <!-- Edit Profile dropdown -->
    <div *ngIf="showEditMenu"
      (click)="showEditMenu = false"
      style="position:fixed;inset:0;z-index:100;background:rgba(0,0,0,0.5)">
      <div (click)="$event.stopPropagation()"
        style="position:absolute;top:280px;left:50%;transform:translateX(-50%);background:rgba(245,243,239,0.95);backdrop-filter:blur(30px);-webkit-backdrop-filter:blur(30px);border:0.5px solid rgba(0,0,0,0.08);border-radius:14px;width:250px;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,0.18)">
        <div style="padding:8px 16px 6px;font-size:12px;font-weight:600;color:#6E6E6E">Edit Profile</div>
        <div *ngFor="let item of editMenuItems"
          (click)="gotoEdit(item.route)"
          style="display:flex;align-items:center;padding:13px 16px;font-size:16px;color:#1A1A1A;cursor:pointer;border-top:0.5px solid rgba(0,0,0,0.08)">
          <span style="flex:1">{{ item.label }}</span>
          <m-icon *ngIf="!item.glyph" [name]="item.icon" [size]="18"></m-icon>
          <span *ngIf="item.glyph" style="font-family:var(--serif);font-size:18px">{{ item.glyph }}</span>
        </div>
      </div>
    </div>
  `,
})
export class ProfileMobileComponent implements OnInit {
  readonly session = inject(SessionService);
  readonly api = inject(ApiService);
  readonly data = inject(SocialDataService);
  private readonly router = inject(Router);

  activeTab = 'Posts';
  showGearMenu = false;
  showEditMenu = false;

  readonly editMenuItems = [
    { icon: 'person', label: 'Edit Avatar', route: '/profile/edit/avatar', glyph: '' },
    { icon: 'image', label: 'Edit Header', route: '/profile/edit/header', glyph: '' },
    { icon: 'paint', label: 'Edit Details', route: '/profile/edit/details', glyph: 'Aa' },
    { icon: 'link', label: 'Edit Info and Links', route: '/profile/edit/links', glyph: '' },
  ];

  get userProfile() { return this.data.uiProfile(); }

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

  roleLabel(): string {
    const role = this.session.activeRole();
    if (role === 'Administrator') return 'Admin';
    if (role === 'Moderator') return 'Moderator';
    return 'Member';
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

  logout(): void {
    const sessionId = this.session.sessionId();
    this.session.logout();
    this.data.reset();
    if (sessionId) {
      this.api.logout(sessionId).subscribe({ complete: () => this.router.navigateByUrl('/') });
      return;
    }
    this.router.navigateByUrl('/');
  }

  gotoSettings(): void {
    this.showGearMenu = false;
    this.router.navigateByUrl('/settings');
  }

  gotoEdit(route: string): void {
    this.showEditMenu = false;
    this.router.navigateByUrl(route);
  }

  onGearAction(_action: string): void {
    this.showGearMenu = false;
    // TODO(backend): wire Share profile and Filters actions when endpoints available
  }
}
