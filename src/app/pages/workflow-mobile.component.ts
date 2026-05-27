import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SocialDataService } from '../social-data.service';
import { SessionService } from '../session.service';
import type { SocialPost } from '../social.models';
import { AvComponent, MIconComponent, SegComponent } from '../design-system';

function formatRelativeTime(iso: string): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return Math.max(1, Math.floor(diff / 60000)) + 'm';
  if (h < 24) return h + 'h';
  return Math.floor(h / 24) + 'd';
}

type ReviewCardItem = {
  id: number;
  postId: string;
  createdAt: string;
  author: string;
  content: string;
  riskLevel: SocialPost['riskLevel'];
  matchedKeywords?: string[];
};

@Component({
  selector: 'app-workflow-mobile',
  standalone: true,
  imports: [CommonModule, AvComponent, MIconComponent, SegComponent],
  styles: [`
    :host { display: block; background: #F3F1ED; min-height: 100%; }
    .rq-card { background: #fff; border-radius: 16px; overflow: hidden; cursor: pointer; }
    .action-btn {
      display: flex; align-items: center; justify-content: center;
      gap: 6px; flex: 1; padding: 10px; border-radius: 10px;
      font-size: 14px; font-weight: 600; cursor: pointer; border: none;
    }
    .action-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .flag-btn {
      width: 44px; height: 44px; border-radius: 10px;
      background: var(--mm-bg-chip); display: flex; align-items: center;
      justify-content: center; cursor: pointer; border: none; flex-shrink: 0;
    }
    .mobile-back-btn {
      display: flex; align-items: center; gap: 6px; background: none;
      border: none; cursor: pointer; padding: 10px 16px 4px;
      font-size: 15px; font-weight: 500; color: var(--mm-label); width: 100%;
    }
  `],
  template: `
    <ng-container *ngIf="!selectedPost">

      <!-- Header -->
      <div style="padding:8px 16px 0">
        <!-- Filter button top-right -->
        <div style="display:flex;align-items:center;justify-content:flex-end;min-height:38px">
          <div style="width:36px;height:36px;border-radius:50%;background:rgba(0,0,0,0.06);display:flex;align-items:center;justify-content:center;cursor:pointer"
            aria-label="Filter">
            <m-icon name="filter" [size]="18"></m-icon>
          </div>
        </div>

        <div style="font-weight:700;font-size:28px;letter-spacing:-0.5px;color:#1A1A1A;font-family:var(--serif)">
          Review queue
        </div>

        <div style="margin-top:6px;font-size:14px;color:var(--mm-label-secondary)">
          {{ pendingTasks.length }} pending · sorted by risk
        </div>

        <!-- Segmented control -->
        <div style="margin-top:12px;margin-bottom:4px">
          <mm-seg [options]="tabs" [value]="activeTab" (onChange)="setActiveTab($any($event))"></mm-seg>
        </div>
      </div>

      <!-- Queue cards -->
      <div style="padding:12px 16px 24px;display:flex;flex-direction:column;gap:12px">
        <ng-container *ngFor="let item of visibleTaskItems; trackBy: trackByTaskId">
          <div
            class="rq-card"
            [attr.data-testid]="'review-task-' + item.id"
            (click)="openTask(item.postId)">

            <div style="height:3px" [style.background]="riskColorsByLevel(item.riskLevel).fg"></div>
            <div style="padding:14px">
              <div style="font-size:15px;font-weight:600;color:var(--mm-label);margin-bottom:4px">{{ item.author }}</div>
              <div style="font-size:12px;color:var(--mm-label-secondary);margin-bottom:6px">
                {{ formatRelativeTime(item.createdAt) }} · {{ riskLabel(item.riskLevel) }}
              </div>
              <div style="font-size:15px;line-height:1.4;color:var(--mm-label);margin-bottom:6px">
                "{{ summarizeContent(item.content, 120) }}"
              </div>
              <div style="font-size:12px;color:var(--mm-label-secondary);margin-bottom:12px">
                {{ matchedKeywordsText(item.matchedKeywords) }} · {{ confidenceByLevel(item.riskLevel) | percent:'1.0-0' }}
              </div>

              <!-- Action row: Approve · Flag · Reject -->
              <div style="display:flex;gap:8px" (click)="$event.stopPropagation()">
                <button type="button" class="action-btn"
                  style="background:rgba(52,168,113,0.12);color:#34A871"
                  (click)="approve(item.postId)" [disabled]="!session.canReviewPosts()">
                  <m-icon name="check" [size]="16" color="#34A871"></m-icon> Approve
                </button>
                <button type="button" class="flag-btn" aria-label="Flag">
                  <m-icon name="flag" [size]="18"></m-icon>
                </button>
                <button type="button" class="action-btn"
                  style="background:rgba(224,66,107,0.12);color:#E0426B"
                  (click)="reject(item.postId)" [disabled]="!session.canReviewPosts()">
                  <m-icon name="close" [size]="16" color="#E0426B"></m-icon> Reject
                </button>
              </div>

            </div>
          </div>
        </ng-container>

        <div *ngIf="!pendingTasks.length"
          style="text-align:center;padding:40px 16px;color:var(--mm-label-secondary)">
          <m-icon name="check" [size]="28" color="var(--mm-reposted)"></m-icon>
          <p style="margin:8px 0 0;font-size:15px">Queue is clear</p>
        </div>
      </div>

    </ng-container>

    <!-- Detail view -->
    <div *ngIf="selectedPost as selected" data-testid="review-post-detail">
      <button type="button" class="mobile-back-btn" (click)="clearDetail()">
        <m-icon name="chev-l" [size]="20"></m-icon> Review queue
      </button>

      <div style="padding:12px 16px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;flex-wrap:wrap">
          <span style="font-size:12px;font-weight:600;padding:3px 10px;border-radius:12px"
            [style.background]="riskColorsByLevel(selected.riskLevel).tint"
            [style.color]="riskColorsByLevel(selected.riskLevel).fg">
            {{ selected.riskLevel }} risk
          </span>
          <span style="font-size:12px;color:var(--mm-label-secondary)">
            Auto-flagged · {{ formatRelativeTime(selected.createdAt) }}
          </span>
        </div>

        <div style="background:#fff;border-radius:14px;padding:18px;border:0.5px solid var(--mm-sep)">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
            <av [name]="selected.author" [size]="36"></av>
            <div style="flex:1;min-width:0">
              <div style="font-size:14px;font-weight:600;color:var(--mm-label)">{{ selected.author }}</div>
              <div style="font-size:12px;color:var(--mm-label-secondary)">
                Posted in /{{ selected.boardSlug }} · {{ formatRelativeTime(selected.createdAt) }}
              </div>
            </div>
          </div>
          <div style="font-size:15px;line-height:1.5;padding:14px 16px;background:var(--mm-bg-chip);border-radius:8px;border:0.5px solid var(--mm-sep)">
            "{{ selected.content }}"
          </div>

          <div *ngIf="(selected.comments || []).length" style="margin-top:16px">
            <div style="font-size:11px;font-weight:600;color:var(--mm-label-secondary);text-transform:uppercase;letter-spacing:0.3px;margin-bottom:8px">
              Discussion
            </div>
            <div style="display:flex;flex-direction:column;gap:8px">
              <div *ngFor="let comment of selected.comments"
                style="background:rgba(255,255,255,0.7);border:0.5px solid var(--mm-sep-faint);border-radius:10px;padding:10px 12px">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
                  <span style="font-size:13px;font-weight:600;color:var(--mm-label)">{{ comment.author }}</span>
                  <span style="font-size:12px;color:var(--mm-label-secondary)">{{ formatRelativeTime(comment.createdAt) }}</span>
                </div>
                <div style="font-size:14px;line-height:1.4;color:var(--mm-label)">{{ comment.comment }}</div>
              </div>
            </div>
          </div>

          <div style="display:flex;gap:8px;margin-top:16px">
            <button type="button" class="action-btn"
              style="flex:none;padding:10px 16px;background:rgba(52,168,113,0.12);color:#34A871"
              (click)="approve(selected.id)" [disabled]="!session.canReviewPosts()">
              <m-icon name="check" [size]="16" color="#34A871"></m-icon> Approve
            </button>
            <button type="button" class="flag-btn" aria-label="Flag">
              <m-icon name="flag" [size]="18"></m-icon>
            </button>
            <button type="button" class="action-btn"
              style="flex:none;padding:10px 16px;background:rgba(224,66,107,0.12);color:#E0426B"
              (click)="reject(selected.id)" [disabled]="!session.canReviewPosts()">
              <m-icon name="close" [size]="16" color="#E0426B"></m-icon> Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class WorkflowMobileComponent implements OnInit {
  readonly data = inject(SocialDataService);
  readonly session = inject(SessionService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly tabs = ['Pending', 'Flagged', 'Approved'] as const;
  activeTab: (typeof this.tabs)[number] = 'Pending';
  visibleTaskItems: ReviewCardItem[] = [];

  readonly formatRelativeTime = formatRelativeTime;

  get pendingTasks() {
    return this.data.reviewTasks().filter((task) => {
      if (this.activeTab === 'Pending') return task.status === 'Pending';
      if (this.activeTab === 'Approved') return task.status === 'Approved';
      return task.status === 'Rejected';
    });
  }

  get selectedPost() { return this.data.selectedPost(); }

  private buildVisibleTasks(): ReviewCardItem[] {
    const postMap = new Map(this.data.posts().map((post) => [post.id, post]));
    const items = this.pendingTasks
      .map((task) => {
        const post = postMap.get(task.postId);
        if (!post) return null;
        return {
          id: task.id,
          postId: task.postId,
          createdAt: task.createdAt,
          author: post.author,
          content: post.content,
          riskLevel: post.riskLevel,
          matchedKeywords: post.matchedKeywords,
        };
      });
    return items.filter((item): item is NonNullable<typeof item> => item !== null);
  }

  private syncVisibleTasks(): void {
    this.visibleTaskItems = this.buildVisibleTasks();
  }

  setActiveTab(tab: (typeof this.tabs)[number]): void {
    this.activeTab = tab;
    this.syncVisibleTasks();
  }

  trackByTaskId(_: number, task: ReviewCardItem): number {
    return task.id;
  }

  summarizeContent(content: string, max = 120): string {
    return content.length > max ? content.slice(0, max) + '…' : content;
  }

  matchedKeywordsText(keywords?: string[]): string {
    return keywords?.length ? keywords.join(', ') : 'Auto-flagged';
  }

  riskColorsByLevel(level: string): { fg: string; tint: string } {
    if (level === 'High')   return { fg: '#C44545', tint: 'rgba(196,69,69,0.15)' };
    if (level === 'Medium') return { fg: '#C28B2A', tint: 'rgba(194,139,42,0.18)' };
    if (level === 'Low')    return { fg: '#4F8F5F', tint: 'rgba(79,143,95,0.15)' };
    return { fg: '#A5A5A5', tint: 'rgba(165,165,165,0.12)' };
  }

  riskLabel(level: string): string {
    if (level === 'High')   return 'High risk';
    if (level === 'Medium') return 'Med risk';
    if (level === 'Low')    return 'Low risk';
    return 'No risk';
  }

  // TODO(backend): wire confidence from /api/audit/queue signal scores when available
  confidenceByLevel(level: string): number {
    if (level === 'High')   return 0.82;
    if (level === 'Medium') return 0.54;
    if (level === 'Low')    return 0.28;
    return 0;
  }

  ngOnInit(): void {
    this.data.refreshWorkspace({ reviewTasks: true, posts: true }).subscribe(() => {
      this.syncVisibleTasks();
      const postId = this.route.snapshot.queryParamMap.get('postId');
      if (postId) this.openTask(postId, false);
    });
  }

  openTask(postId: string, syncRoute = true): void {
    if (syncRoute) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { postId },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    }
    this.data.loadPostDetail(postId).subscribe();
  }

  clearDetail(): void {
    this.data.clearSelectedPost();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { postId: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  approve(postId: string): void {
    this.data.approvePost(postId).subscribe(() => {
      this.data.refreshWorkspace({ reviewTasks: true, posts: true }).subscribe(() => this.syncVisibleTasks());
      this.openTask(postId);
    });
  }

  reject(postId: string): void {
    this.data.rejectPost(postId).subscribe(() => {
      this.data.refreshWorkspace({ reviewTasks: true, posts: true }).subscribe(() => this.syncVisibleTasks());
      this.openTask(postId);
    });
  }
}
