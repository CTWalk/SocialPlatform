import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SocialDataService } from '../social-data.service';
import { SessionService } from '../session.service';
import type { SocialPost } from '../social.models';
import { AvComponent, MIconComponent, PillBtnComponent, SegComponent } from '../design-system';

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
};

@Component({
  selector: 'app-workflow-desktop',
  standalone: true,
  imports: [CommonModule, AvComponent, MIconComponent, PillBtnComponent, SegComponent],
  styles: [`
    :host { display: block; background: #F3F1ED; min-height: 100%; }
    .toolbar {
      display: flex; align-items: center; gap: 12px;
      padding: 16px 22px; border-bottom: 0.5px solid var(--mm-sep); background: #fff;
    }
    .toolbar-title { font-family: var(--serif); font-size: 22px; font-weight: 400; flex: 1; letter-spacing: -0.3px; color: #1A1A1A; }
    .toolbar-subtitle { font-size: 13px; color: var(--mm-label-secondary); margin-top: 1px; }
    .filter-btn {
      width: 36px; height: 36px; border-radius: 50%;
      background: rgba(0,0,0,0.06); display: flex;
      align-items: center; justify-content: center; cursor: pointer;
    }
    .desktop-body { display: flex; align-items: flex-start; min-height: calc(100vh - 73px); }
    .left-pane {
      width: 380px; flex-shrink: 0; border-right: 0.5px solid var(--mm-sep);
      background: rgba(255,255,255,0.4); align-self: stretch;
    }
    .right-pane { flex: 1; padding: 22px; }
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
  `],
  template: `
    <div data-testid="review-page">

      <!-- Toolbar -->
      <div class="toolbar">
        <div style="flex:1;min-width:0">
          <div class="toolbar-title">Review queue</div>
          <div class="toolbar-subtitle">{{ allPending.length }} pending · sorted by risk</div>
        </div>
        <div class="filter-btn" aria-label="Filter">
          <m-icon name="filter" [size]="18"></m-icon>
        </div>
        <mm-pill-btn kind="gold" (onClick)="approveAllSafe()">Approve all safe</mm-pill-btn>
      </div>

      <div class="desktop-body">

        <!-- Left pane: queue list -->
        <div class="left-pane">
          <!-- Seg control -->
          <div style="padding:10px 12px">
            <mm-seg [options]="tabs" [value]="activeTab" (onChange)="setActiveTab($any($event))"></mm-seg>
          </div>

          <div style="padding:0 12px 24px;display:flex;flex-direction:column;gap:10px">
            <ng-container *ngFor="let item of visibleTaskItems; trackBy: trackByTaskId">
              <div
                class="rq-card"
                [attr.data-testid]="'review-task-' + item.id"
                (click)="openTask(item.postId)"
                [style.outline]="selectedPost?.id === item.postId ? '2px solid var(--mm-gold)' : 'none'"
                [style.outline-offset]="'-2px'">
                <div style="height:3px" [style.background]="riskColorsByLevel(item.riskLevel).fg"></div>
                <div style="padding:12px">
                  <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px">
                    <div style="font-size:14px;font-weight:600;color:var(--mm-label);min-width:0;flex:1">{{ item.author }}</div>
                    <span style="font-size:11px;color:var(--mm-label-secondary);white-space:nowrap">{{ formatRelativeTime(item.createdAt) }}</span>
                  </div>
                  <div style="font-size:11px;color:var(--mm-label-secondary);margin-bottom:6px">
                    {{ riskLabel(item.riskLevel) }}
                  </div>
                  <div style="font-size:13px;line-height:1.4;color:var(--mm-label);letter-spacing:-0.1px">
                    "{{ summarizeContent(item.content, 100) }}"
                  </div>
                </div>
              </div>
            </ng-container>

            <div *ngIf="!pendingTasks.length"
              style="text-align:center;padding:32px 16px;color:var(--mm-label-secondary)">
              <m-icon name="check" [size]="24" color="var(--mm-reposted)"></m-icon>
              <p style="margin:8px 0 0;font-size:14px">Queue is clear</p>
            </div>
          </div>
        </div>

        <!-- Right pane: detail -->
        <div class="right-pane" *ngIf="selectedPost as selected" data-testid="review-post-detail">
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

            <!-- Signals panel -->
            <div style="margin-top:16px">
              <div style="font-size:11px;font-weight:600;color:var(--mm-label-secondary);text-transform:uppercase;letter-spacing:0.3px;margin-bottom:8px">
                Signals
              </div>
              <!-- TODO(backend): wire signal confidence scores from /api/audit/queue when breakdown is available -->
              <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px">
                <div style="background:var(--mm-bg-chip);border-radius:8px;padding:10px;border:0.5px solid var(--mm-sep-faint)">
                  <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:6px">
                    <span style="color:var(--mm-label-secondary)">Risk score</span>
                    <span style="font-weight:600" [style.color]="riskColorsByLevel(selected.riskLevel).fg">
                      {{ confidenceByLevel(selected.riskLevel) | percent:'1.0-0' }}
                    </span>
                  </div>
                  <div style="height:4px;background:rgba(0,0,0,0.08);border-radius:2px">
                    <div style="height:100%;border-radius:2px"
                      [style.width]="(confidenceByLevel(selected.riskLevel) * 100) + '%'"
                      [style.background]="riskColorsByLevel(selected.riskLevel).fg"></div>
                  </div>
                </div>
                <div *ngIf="(selected.matchedKeywords || []).length > 0"
                  style="background:var(--mm-bg-chip);border-radius:8px;padding:10px;border:0.5px solid var(--mm-sep-faint)">
                  <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px">
                    <span style="color:var(--mm-label-secondary)">Keyword hits</span>
                    <span style="font-weight:600;color:#D88030">{{ (selected.matchedKeywords || []).length }}</span>
                  </div>
                  <div style="font-size:11px;color:var(--mm-label-tertiary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                    {{ (selected.matchedKeywords || []).join(', ') }}
                  </div>
                </div>
              </div>
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

            <div style="display:flex;gap:8px;margin-top:18px">
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

          <!-- Review history -->
          <div *ngIf="(selected.tasks || []).length" style="margin-top:16px">
            <div style="font-size:11px;font-weight:600;color:var(--mm-label-secondary);text-transform:uppercase;letter-spacing:0.3px;margin-bottom:8px">
              Review history
            </div>
            <div style="background:#fff;border-radius:12px;overflow:hidden;border:0.5px solid var(--mm-sep)">
              <div *ngFor="let h of selected.tasks; let last = last"
                style="padding:10px 14px;display:flex;align-items:center;gap:8px;font-size:13px"
                [style.border-bottom]="last ? 'none' : '0.5px solid var(--mm-sep-faint)'">
                <span style="color:var(--mm-label-secondary)">L{{ h.level }} · {{ h.reviewerRole }}</span>
                <span style="margin-left:auto;font-weight:600"
                  [style.color]="h.status === 'Approved' ? '#4F8F5F' : h.status === 'Rejected' ? '#C44545' : 'var(--mm-gold)'">
                  {{ h.status }}
                </span>
                <span *ngIf="h.reviewer" style="color:var(--mm-label-tertiary);font-size:12px">· {{ h.reviewer }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty right pane (no selection) — only shows when queue is empty -->
        <div *ngIf="!selectedPost && !pendingTasks.length" class="right-pane"
          style="display:flex;align-items:center;justify-content:center;color:var(--mm-label-tertiary);min-height:300px">
          <div style="text-align:center">
            <m-icon name="flag" [size]="32" color="var(--mm-label-tertiary)"></m-icon>
            <p style="margin:12px 0 0;font-size:15px">Queue is clear</p>
          </div>
        </div>

      </div>
    </div>
  `,
})
export class WorkflowDesktopComponent implements OnInit {
  readonly data = inject(SocialDataService);
  readonly session = inject(SessionService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly tabs = ['Pending', 'Flagged', 'Approved'] as const;
  activeTab: (typeof this.tabs)[number] = 'Pending';
  visibleTaskItems: ReviewCardItem[] = [];

  readonly formatRelativeTime = formatRelativeTime;

  get allPending() {
    return this.data.reviewTasks().filter((t) => t.status === 'Pending');
  }

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

  summarizeContent(content: string, max = 100): string {
    return content.length > max ? content.slice(0, max) + '…' : content;
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
      if (postId) {
        this.openTask(postId, false);
      } else {
        // Auto-select first item on load when queue is non-empty
        const first = this.pendingTasks[0];
        if (first) this.openTask(first.postId, false);
      }
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

  approve(postId: string): void {
    this.data.approvePost(postId).subscribe(() => {
      this.data.refreshWorkspace({ reviewTasks: true, posts: true }).subscribe(() => {
        this.syncVisibleTasks();
        const first = this.pendingTasks[0];
        if (first) this.openTask(first.postId);
      });
    });
  }

  reject(postId: string): void {
    this.data.rejectPost(postId).subscribe(() => {
      this.data.refreshWorkspace({ reviewTasks: true, posts: true }).subscribe(() => {
        this.syncVisibleTasks();
        const first = this.pendingTasks[0];
        if (first) this.openTask(first.postId);
      });
    });
  }

  approveAllSafe(): void {
    const safeTasks = this.pendingTasks.filter((t) => {
      const level = this.data.posts().find((p) => p.id === t.postId)?.riskLevel ?? 'None';
      return level === 'Low' || level === 'None';
    });
    if (!safeTasks.length) return;
    let remaining = safeTasks.length;
    safeTasks.forEach((task) => {
      this.data.approvePost(task.postId).subscribe(() => {
        remaining -= 1;
        if (remaining === 0) {
          this.data.refreshWorkspace({ reviewTasks: true, posts: true }).subscribe(() => {
            this.syncVisibleTasks();
            const first = this.pendingTasks[0];
            if (first) {
              this.openTask(first.postId);
            } else {
              this.data.clearSelectedPost();
            }
          });
        }
      });
    });
  }
}
