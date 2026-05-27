import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SocialDataService } from '../social-data.service';
import { SessionService } from '../session.service';
import { boardLabel } from '../social-taxonomy';
import { AvComponent, MIconComponent, StateBlockComponent } from '../design-system';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, AvComponent, MIconComponent, StateBlockComponent],
  template: `
    <section class="page-stack" data-testid="activity-page">
      <header style="display:flex; align-items:center; justify-content:space-between; padding-bottom:14px; border-bottom:0.5px solid var(--line);">
        <h2 style="margin:0; font-family:var(--serif); font-size:22px; font-weight:400; letter-spacing:-0.4px;">Activity</h2>
        <div class="toolbar-actions">
          <span class="chip subtle">{{ notifications.length }} notifications</span>
          <span class="chip accent">{{ vm.pendingTasks.length }} pending</span>
        </div>
      </header>

      <state-block
        *ngIf="isLoading"
        mode="loading"
        title="Loading activity workspace"
        body="Collecting notifications, inbox updates, mentions, and moderation movement."
      ></state-block>

      <state-block
        *ngIf="!isLoading && loadError"
        mode="error"
        title="Could not load activity workspace"
        [body]="loadError"
      ></state-block>

      <section class="dashboard-grid" *ngIf="!isLoading && !loadError">
        <!-- ── Workspace feed ──────────────────────────────────── -->
        <article class="card panel-card">
          <div class="segmented" style="margin-bottom:4px;">
            <button *ngFor="let tab of tabs" type="button" [class.active]="activeTab === tab" (click)="activeTab = tab">
              {{ tab }}
            </button>
          </div>

          <!-- Notifications -->
          <div *ngIf="activeTab === 'Notifications'">
            <div *ngFor="let item of notifications" class="notif-row" [attr.data-testid]="'notification-item-' + item.id">
              <div class="notif-dot" [class.unread]="!item.read"></div>
              <div class="notif-body">
                <div class="notif-title">{{ item.title }}</div>
                <div class="notif-meta">{{ formatTime(item.createdAt) }}</div>
                <div class="notif-summary">{{ item.summary }}</div>
                <div class="row-actions top-gap" *ngIf="!item.read || item.actionable">
                  <button type="button" class="button secondary" *ngIf="!item.read" (click)="markNotificationRead(item.id)">Mark read</button>
                  <button type="button" class="button secondary" *ngIf="item.actionable" (click)="openNotification(item)">Open</button>
                </div>
              </div>
            </div>
            <div class="notif-empty" *ngIf="!notifications.length">
              <m-icon name="bell" [size]="28" color="var(--muted-soft)"></m-icon>
              <p>No notifications yet</p>
            </div>
          </div>

          <!-- Inbox -->
          <div *ngIf="activeTab === 'Inbox'">
            <div *ngFor="let item of vm.inboxItems" class="notif-row" [attr.data-testid]="'inbox-item-' + item.id">
              <m-icon name="envelope" [size]="16" color="var(--muted)"></m-icon>
              <div class="notif-body">
                <div class="notif-title">{{ item.title }}</div>
                <div class="notif-meta">#{{ item.boardSlug ? boardLabel(item.boardSlug) : 'workspace' }} · {{ formatTime(item.createdAt) }}</div>
                <div class="notif-summary">{{ item.summary }}</div>
                <div class="row-actions top-gap" *ngIf="item.actionable && item.postId">
                  <button type="button" class="button secondary" (click)="openInboxItem(item)">Open context</button>
                </div>
              </div>
            </div>
            <div class="notif-empty" *ngIf="!vm.inboxItems.length">
              <m-icon name="envelope" [size]="28" color="var(--muted-soft)"></m-icon>
              <p>Inbox is quiet</p>
            </div>
          </div>

          <!-- Mentions -->
          <div *ngIf="activeTab === 'Mentions'">
            <div *ngFor="let item of vm.mentions" class="notif-row" [attr.data-testid]="'mention-item-' + item.id">
              <av [name]="item.author" [size]="32"></av>
              <div class="notif-body">
                <div class="notif-title">{{ item.author }}</div>
                <div class="notif-meta">#{{ boardLabel(item.boardSlug) }} · {{ item.sourceType }} · {{ formatTime(item.createdAt) }}</div>
                <div class="notif-summary">{{ item.excerpt }}</div>
                <div class="row-actions top-gap">
                  <button type="button" class="button secondary" (click)="openMention(item)">Open thread</button>
                </div>
              </div>
            </div>
            <div class="notif-empty" *ngIf="!vm.mentions.length">
              <m-icon name="person" [size]="28" color="var(--muted-soft)"></m-icon>
              <p>No mentions yet</p>
            </div>
          </div>

          <!-- Timeline -->
          <div *ngIf="activeTab === 'Timeline'">
            <div *ngFor="let item of vm.timeline" class="notif-row" [attr.data-testid]="'activity-log-' + item.id">
              <av [name]="item.username || 'System'" [size]="32"></av>
              <div class="notif-body">
                <div class="notif-title">{{ item.title }}</div>
                <div class="notif-meta">{{ [item.username, item.role, formatTime(item.at)].filter(Boolean).join(' · ') }}</div>
                <div class="notif-summary">{{ item.summary }}</div>
                <div class="row-actions top-gap" *ngIf="item.postId">
                  <button type="button" class="button secondary" (click)="openTimelineItem(item)">Open related work</button>
                </div>
              </div>
            </div>
            <div class="notif-empty" *ngIf="!vm.timeline.length">
              <m-icon name="chart" [size]="28" color="var(--muted-soft)"></m-icon>
              <p>No timeline events yet</p>
            </div>
          </div>
        </article>

        <!-- ── Moderation sidebar ────────────────────────────── -->
        <article class="card panel-card">
          <div class="card-head">
            <h3>Moderation activity</h3>
            <span>{{ vm.pendingTasks.length }} open tasks</span>
          </div>
          <ul class="stack-list compact">
            <li *ngFor="let task of vm.moderationPreview" [attr.data-testid]="'activity-task-' + task.id">
              <div style="display:flex; align-items:center; gap:8px;">
                <m-icon name="shield" [size]="16" color="var(--muted)"></m-icon>
                <div>
                  <strong>{{ task.postId }}</strong>
                  <span>Layer {{ task.level }} · {{ task.reviewerRole }}</span>
                </div>
              </div>
              <small>{{ task.status }} · {{ task.note || 'Awaiting action' }}</small>
            </li>
          </ul>

          <div class="section-label" style="margin-top:8px;">Quick links</div>
          <div class="quick-links">
            <a routerLink="/boards" class="button secondary">Boards</a>
            <a routerLink="/discover" class="button secondary">Discover</a>
            <a *ngIf="session.canReviewPosts()" routerLink="/moderation/review" class="button secondary">Review queue</a>
            <a *ngIf="session.canModerateKeywords()" routerLink="/moderation/rules" class="button secondary">Rules</a>
            <a *ngIf="session.canManageUsers()" routerLink="/admin/users" class="button secondary">Users</a>
          </div>
        </article>
      </section>
    </section>
  `,
})
export class ActivityComponent implements OnInit {
  readonly data = inject(SocialDataService);
  readonly session = inject(SessionService);
  readonly boardLabel = boardLabel;
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly tabs = ['Notifications', 'Inbox', 'Mentions', 'Timeline'] as const;
  activeTab: (typeof this.tabs)[number] = 'Inbox';
  isLoading = true;
  loadError = '';
  get vm() { return this.data.activityViewModel(); }
  get notifications() { return this.data.notifications(); }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const requestedTab = params.get('tab');
      if (requestedTab && this.tabs.includes(requestedTab as (typeof this.tabs)[number])) {
        this.activeTab = requestedTab as (typeof this.tabs)[number];
      }
    });
    this.isLoading = true;
    this.loadError = '';
    this.data.loadActivityWorkspace().subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.loadError = 'Please retry after the activity services reconnect.';
      },
    });
  }

  formatTime(value: string): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(value));
  }

  openInboxItem(item: { kind: string; postId?: string | null; boardSlug?: string | null }): void {
    if (item.kind === 'review' && item.postId) {
      this.router.navigate(['/moderation/review'], { queryParams: { postId: item.postId } });
      return;
    }
    if (item.postId) {
      this.router.navigate(['/boards'], { queryParams: { board: item.boardSlug ?? 'all-company', postId: item.postId } });
    }
  }

  openMention(item: { postId: string; boardSlug: string }): void {
    this.router.navigate(['/boards'], { queryParams: { board: item.boardSlug, postId: item.postId } });
  }

  openNotification(item: { id: string; kind: string; postId?: string | null; boardSlug?: string | null; actionable: boolean; read: boolean }): void {
    const proceed = () => {
      if (item.kind === 'review') {
        this.activeTab = 'Inbox';
        return;
      }
      if (item.kind === 'mention') {
        this.activeTab = 'Mentions';
        return;
      }
      if (item.boardSlug) {
        this.router.navigate(['/boards'], { queryParams: { board: item.boardSlug, postId: item.postId ?? null } });
      }
    };

    if (!item.read) {
      this.data.markNotificationRead(item.id).subscribe(() => proceed());
      return;
    }
    proceed();
  }

  markNotificationRead(id: string): void {
    this.data.markNotificationRead(id).subscribe();
  }

  openTimelineItem(item: { postId?: string | null; boardSlug?: string | null; action: string }): void {
    if (!item.postId) return;
    if (['approve_post', 'reject_post'].includes(item.action) && this.session.canReviewPosts()) {
      this.router.navigate(['/moderation/review'], { queryParams: { postId: item.postId } });
      return;
    }
    this.router.navigate(['/boards'], { queryParams: { board: item.boardSlug ?? 'all-company', postId: item.postId } });
  }
}
