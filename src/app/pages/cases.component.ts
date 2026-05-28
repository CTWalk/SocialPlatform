import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SocialDataService } from '../social-data.service';
import { SessionService } from '../session.service';
import { BOARD_CATALOG, boardLabel } from '../social-taxonomy';
import { AvComponent, MIconComponent, PillBtnComponent, SegComponent } from '../design-system';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, AvComponent, MIconComponent, PillBtnComponent],
  styles: [`
    .boards-screen { min-height: 100%; background: var(--brand-bg, #F3F1ED); position: relative; display: flex; flex-direction: column; }

    /* ── Board index ─────────────────────────────────────── */
    .boards-topbar { display: flex; align-items: center; padding: 14px 16px; }
    .boards-page-title { font-family: var(--serif); font-size: 28px; font-weight: 700; letter-spacing: -0.5px; color: #1A1A1A; flex: 1; }
    .boards-subtitle { font-size: 14px; color: var(--brand-label-secondary, #6E6E6E); padding: 0 16px 16px; }
    .round-icon-btn { width: 36px; height: 36px; border-radius: 50%; background: rgba(0,0,0,0.06); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .boards-list { display: flex; flex-direction: column; }
    .board-row { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-bottom: 0.5px solid var(--brand-sep-faint, rgba(0,0,0,0.06)); cursor: pointer; }
    .board-row:hover { background: rgba(0,0,0,0.02); }
    .board-hash-tile { width: 40px; height: 40px; background: #fff; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; position: relative; }
    .board-unread-badge { position: absolute; top: -4px; right: -4px; width: 16px; height: 16px; border-radius: 50%; background: var(--brand-gold, #C9A961); color: #fff; font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
    .board-row-info { flex: 1; min-width: 0; }
    .board-row-name { font-size: 16px; font-weight: 600; color: var(--brand-label, #1A1A1A); }
    .board-row-meta { font-size: 13px; color: var(--brand-label-secondary, #6E6E6E); margin-top: 1px; }
    .board-row-desc { font-size: 13px; color: var(--brand-label-secondary, #6E6E6E); line-height: 1.4; margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    /* ── Thread view ─────────────────────────────────────── */
    .thread-topbar { display: flex; align-items: center; padding: 10px 16px; border-bottom: 0.5px solid var(--brand-sep, rgba(0,0,0,0.08)); background: var(--brand-bg, #F3F1ED); }
    .back-btn { background: none; border: none; cursor: pointer; display: flex; align-items: center; gap: 4px; font-size: 16px; font-weight: 500; color: var(--brand-label, #1A1A1A); padding: 4px 0; }
    .board-header-card { display: flex; align-items: center; gap: 12px; background: rgba(0,0,0,0.04); margin: 6px 16px 12px; padding: 14px; border-radius: 14px; }
    .board-header-tile { width: 44px; height: 44px; background: #fff; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 300; color: #6E6E6E; flex-shrink: 0; }
    .board-header-name { font-size: 18px; font-weight: 700; color: var(--brand-label, #1A1A1A); }
    .board-header-sub { font-size: 13px; color: var(--brand-label-secondary, #6E6E6E); margin-top: 2px; }
    .posts-list { display: flex; flex-direction: column; }
    .post-item { display: flex; gap: 10px; padding: 12px 16px; border-bottom: 0.5px solid var(--brand-sep-faint, rgba(0,0,0,0.06)); cursor: pointer; }
    .post-item:hover { background: rgba(0,0,0,0.02); }
    .post-item.active { background: rgba(201,169,97,0.08); }
    .post-item-body { flex: 1; min-width: 0; }
    .post-item-author { font-size: 15px; font-weight: 600; color: var(--brand-label, #1A1A1A); }
    .post-item-meta { font-size: 12px; color: var(--brand-label-secondary, #6E6E6E); margin-top: 1px; }
    .post-item-content { font-size: 14px; color: var(--brand-label, #1A1A1A); margin-top: 4px; line-height: 1.4; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; }
    .post-item-actions { display: flex; align-items: center; gap: 4px; margin-top: 8px; }
    .post-action-btn { width: 32px; height: 32px; border: none; background: none; cursor: pointer; display: flex; align-items: center; justify-content: center; border-radius: 50%; color: var(--brand-label-secondary, #6E6E6E); }
    .post-action-btn:hover { background: rgba(0,0,0,0.05); }
    .posts-empty { padding: 48px 24px; text-align: center; color: var(--brand-label-secondary, #6E6E6E); font-size: 14px; }

    /* ── Post detail ─────────────────────────────────────── */
    .detail-scroll { flex: 1; overflow-y: auto; padding: 16px; }
    .detail-author-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
    .detail-author { font-size: 15px; font-weight: 600; color: var(--brand-label, #1A1A1A); }
    .detail-meta { font-size: 12px; color: var(--brand-label-secondary, #6E6E6E); margin-top: 1px; }
    .risk-badge { font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 22px; flex-shrink: 0; background: var(--brand-bg-chip, #E6E4DE); color: var(--brand-label, #1A1A1A); }
    .risk-badge.high { background: rgba(224,66,107,0.15); color: #E0426B; }
    .risk-badge.med { background: rgba(201,169,97,0.2); color: #B08D3F; }
    .detail-body { font-size: 15px; line-height: 1.5; color: var(--brand-label, #1A1A1A); margin: 0 0 16px; }
    .review-action-row { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
    .approve-btn { display: flex; align-items: center; gap: 6px; padding: 9px 16px; border: none; border-radius: 22px; font-size: 14px; font-weight: 600; cursor: pointer; background: rgba(52,168,113,0.12); color: #34A871; }
    .reject-btn { display: flex; align-items: center; gap: 6px; padding: 9px 16px; border: none; border-radius: 22px; font-size: 14px; font-weight: 600; cursor: pointer; background: rgba(224,66,107,0.12); color: #E0426B; }
    .approve-btn:disabled, .reject-btn:disabled, .publish-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .flag-btn-sm { width: 36px; height: 36px; border-radius: 50%; background: rgba(0,0,0,0.06); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .publish-btn { padding: 9px 16px; border: none; border-radius: 22px; background: var(--brand-bg-chip, #E6E4DE); color: var(--brand-label, #1A1A1A); font-size: 14px; font-weight: 600; cursor: pointer; margin-left: auto; }
    .detail-section { margin-bottom: 16px; }
    .section-label { font-size: 11px; font-weight: 700; color: var(--brand-label-secondary, #6E6E6E); letter-spacing: 0.3px; text-transform: uppercase; margin-bottom: 8px; }
    .history-row { font-size: 13px; color: var(--brand-label-secondary, #6E6E6E); padding: 4px 0; }
    .comment-row { display: flex; gap: 10px; padding: 8px 0; border-bottom: 0.5px solid var(--brand-sep-faint, rgba(0,0,0,0.06)); }
    .comment-author { font-size: 14px; font-weight: 600; color: var(--brand-label, #1A1A1A); }
    .comment-text { font-size: 14px; color: var(--brand-label, #1A1A1A); margin-top: 2px; line-height: 1.4; }
    .comment-body { flex: 1; min-width: 0; }

    /* ── Inline sticky reply composer ────────────────────── */
    .reply-composer-sticky { padding: 12px 16px; border-top: 0.5px solid var(--brand-sep, rgba(0,0,0,0.08)); background: var(--brand-bg, #F3F1ED); }
    .reply-composer-card { border: 0.5px solid var(--brand-sep, rgba(0,0,0,0.08)); border-radius: 12px; padding: 10px 12px; background: #fff; }
    .reply-textarea { width: 100%; border: none; outline: none; background: transparent; font-size: 15px; line-height: 1.4; color: var(--brand-label, #1A1A1A); resize: none; font-family: inherit; box-sizing: border-box; min-height: 32px; }
    .reply-actions { display: flex; align-items: center; gap: 4px; margin-top: 8px; }
    .reply-attach-btn { width: 30px; height: 30px; border: none; background: none; cursor: pointer; display: flex; align-items: center; justify-content: center; border-radius: 8px; }
    .reply-send-btn { width: 32px; height: 32px; border-radius: 50%; background: var(--brand-label, #1A1A1A); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .reply-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }

    /* ── Full-screen compose modal ───────────────────────── */
    .compose-full-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: stretch; justify-content: center; z-index: 100; }
    .compose-full-modal { width: 100%; max-width: 640px; background: var(--surface-solid, #F8F6F2); display: flex; flex-direction: column; }
    .compose-full-form { display: flex; flex-direction: column; flex: 1; }
    .compose-full-head { display: flex; align-items: center; padding: 14px 16px; border-bottom: 0.5px solid var(--brand-sep, rgba(0,0,0,0.08)); }
    .compose-close-btn { width: 32px; height: 32px; border: none; background: none; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0; }
    .compose-counter { flex: 1; text-align: center; font-size: 17px; font-weight: 600; color: var(--brand-label-secondary, #6E6E6E); }
    .compose-counter.over-limit { color: var(--brand-heart, #E0426B); }
    .compose-send-btn { width: 36px; height: 36px; border-radius: 12px; background: var(--brand-label, #1A1A1A); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .compose-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .compose-full-body { display: flex; gap: 12px; align-items: flex-start; padding: 16px; flex: 1; position: relative; }
    .compose-full-textarea { flex: 1; border: none; outline: none; background: transparent; font-size: 17px; line-height: 1.4; color: var(--brand-label, #1A1A1A); resize: none; font-family: inherit; min-height: 120px; width: 100%; padding-right: 90px; box-sizing: border-box; }
    .compose-audience-wrap { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); }
    .audience-select { appearance: none; -webkit-appearance: none; border: 0.5px solid var(--brand-sep, rgba(0,0,0,0.08)); border-radius: 22px; padding: 11px 22px; font-size: 15px; font-weight: 600; color: var(--brand-label, #1A1A1A); background: var(--brand-bg-chip, #E6E4DE); cursor: pointer; }
    .compose-board-row { padding: 0 16px 8px; display: flex; align-items: center; gap: 8px; }
    .board-select { flex: 1; border: none; background: transparent; font-size: 14px; color: var(--brand-label-secondary, #6E6E6E); outline: none; }
    .compose-attachment-row { display: flex; align-items: center; gap: 22px; padding: 14px 16px; border-top: 0.5px solid var(--brand-sep, rgba(0,0,0,0.08)); }
    .attach-btn { border: none; background: none; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0; }
    .lang-chip { font-size: 11px; font-weight: 700; padding: 4px 8px; border-radius: 6px; background: var(--brand-bg-chip, #E6E4DE); color: var(--brand-label-secondary, #6E6E6E); }
  `],
  template: `
    <div class="boards-screen" data-testid="feed-page">

      <!-- ══ BOARD INDEX ════════════════════════════════════════════ -->
      <ng-container *ngIf="viewState === 'index'">

        <div class="boards-topbar">
          <div class="boards-page-title">Boards</div>
          <button type="button" class="round-icon-btn" (click)="openCompose()" aria-label="New post">
            <m-icon name="plus" [size]="18"></m-icon>
          </button>
        </div>

        <div class="boards-subtitle">Join and follow company channels</div>

        <div class="boards-list">
          <div *ngFor="let board of boards"
            class="board-row"
            [attr.data-testid]="'board-row-' + board.slug"
            (click)="setBoard(board.slug)">

            <div class="board-hash-tile">
              <span style="font-size:16px;font-weight:300;color:#6E6E6E">#</span>
              <span *ngIf="ownerInviteCount(board.slug)" class="board-unread-badge">{{ ownerInviteCount(board.slug) }}</span>
            </div>

            <div class="board-row-info">
              <div class="board-row-name">{{ board.name }}</div>
              <div class="board-row-meta" *ngIf="board.members">{{ board.members }} · {{ board.postCount }} threads</div>
              <div *ngIf="board.summary" class="board-row-desc">{{ board.summary }}</div>
            </div>

            <sp-pill-btn *ngIf="isBoardJoined(board.slug)" kind="ghost"
              (onClick)="$event.stopPropagation(); leaveBoard(board.slug)">Leave</sp-pill-btn>
            <sp-pill-btn *ngIf="!isBoardJoined(board.slug)" kind="default"
              (onClick)="$event.stopPropagation(); joinBoard(board.slug)">Join</sp-pill-btn>
          </div>
        </div>

      </ng-container>

      <!-- ══ THREAD LIST ════════════════════════════════════════════ -->
      <ng-container *ngIf="viewState === 'thread' && !selectedPost">

        <div class="thread-topbar">
          <button type="button" class="back-btn" (click)="exitBoard()">
            <m-icon name="chev-l" [size]="20"></m-icon>
            <span>Boards</span>
          </button>
        </div>

        <div class="board-header-card" *ngIf="selectedBoardSummary as board">
          <div class="board-header-tile">#</div>
          <div style="flex:1;min-width:0">
            <div class="board-header-name">{{ board.name }}</div>
            <div *ngIf="board.summary" class="board-header-sub">{{ board.summary }}</div>
          </div>
          <sp-pill-btn *ngIf="!isBoardJoined(board.slug)" kind="dark"
            (onClick)="joinBoard(board.slug)">Join</sp-pill-btn>
          <sp-pill-btn *ngIf="isBoardJoined(board.slug)" kind="ghost"
            (onClick)="leaveBoard(board.slug)">Leave</sp-pill-btn>
        </div>

        <div class="posts-list" *ngIf="filteredPosts.length">
          <div *ngFor="let item of filteredPosts"
            class="post-item"
            [class.active]="selectedPost?.id === item.id"
            [attr.data-testid]="'board-post-' + item.id"
            (click)="openPost(item.id)">
            <av [name]="item.author" [size]="36"></av>
            <div class="post-item-body">
              <div class="post-item-author">{{ item.author }}</div>
              <div class="post-item-meta">{{ item.updatedAt | date:'shortTime' }}</div>
              <div class="post-item-content">{{ item.content }}</div>
              <div class="post-item-actions" (click)="$event.stopPropagation()">
                <button type="button" class="post-action-btn">
                  <m-icon name="reply" [size]="18" [weight]="1.8"></m-icon>
                </button>
                <button type="button" class="post-action-btn" style="margin-left:auto">
                  <m-icon name="dots" [size]="18" [weight]="1.8"></m-icon>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="posts-empty" *ngIf="!filteredPosts.length">
          No posts in this board yet.
        </div>

        <button type="button" class="compose-fab"
          *ngIf="session.canCreatePosts() && !composing"
          (click)="openCompose()"
          aria-label="Compose new post"
          data-testid="compose-fab">
          <m-icon name="plus" [size]="24" [weight]="2.5"></m-icon>
        </button>

      </ng-container>

      <!-- ══ POST DETAIL ════════════════════════════════════════════ -->
      <div *ngIf="viewState === 'thread' && selectedPost as selected" data-testid="feed-post-detail">

        <div class="thread-topbar">
          <button type="button" class="back-btn" (click)="closePostDetail()">
            <m-icon name="chev-l" [size]="20"></m-icon>
            <span>Back</span>
          </button>
        </div>

        <div class="detail-scroll">

          <div class="detail-author-row">
            <av [name]="selected.author" [size]="36"></av>
            <div style="flex:1;min-width:0">
              <div class="detail-author">{{ selected.author }}</div>
              <div class="detail-meta">#{{ boardLabel(selected.boardSlug) }} · {{ selected.status }}</div>
            </div>
            <span class="risk-badge"
              [class.high]="selected.riskLevel === 'High'"
              [class.med]="selected.riskLevel === 'Medium'">{{ selected.riskLevel }}</span>
          </div>

          <p class="detail-body">"{{ selected.content }}"</p>

          <div class="review-action-row">
            <button type="button" class="approve-btn"
              (click)="approve(selected.id)"
              [disabled]="!session.canReviewPosts()"
              [attr.aria-label]="'Approve ' + selected.id">
              <m-icon name="check" [size]="16"></m-icon> Approve
            </button>
            <button type="button" class="flag-btn-sm" aria-label="Flag">
              <m-icon name="flag" [size]="16"></m-icon>
            </button>
            <button type="button" class="reject-btn"
              (click)="reject(selected.id)"
              [disabled]="!session.canReviewPosts()"
              [attr.aria-label]="'Reject ' + selected.id">
              <m-icon name="close" [size]="16"></m-icon> Reject
            </button>
            <button type="button" class="publish-btn"
              (click)="publish(selected.id)"
              [disabled]="!session.canPublishDirectly() || selected.riskLevel !== 'None'"
              [attr.aria-label]="'Publish ' + selected.id">Publish</button>
          </div>

          <div class="detail-section" *ngIf="(selected.tasks || []).length">
            <div class="section-label">Review history</div>
            <div *ngFor="let h of selected.tasks || []" class="history-row">
              L{{ h.level }} · {{ h.reviewerRole }} · {{ h.status }} · {{ h.reviewer || 'pending' }}
            </div>
          </div>

          <div class="detail-section">
            <div class="section-label">Comments</div>
            <div *ngFor="let c of selected.comments || []" class="comment-row">
              <av [name]="c.author" [size]="28"></av>
              <div class="comment-body">
                <div class="comment-author">{{ c.author }}</div>
                <div class="comment-text">{{ c.comment }}</div>
              </div>
            </div>
          </div>

        </div>

        <!-- Inline sticky reply composer — no AUTHOR field -->
        <div class="reply-composer-sticky">
          <div class="reply-composer-card">
            <form (ngSubmit)="addComment(selected.id)" data-testid="feed-comment-form">
              <input type="hidden" [(ngModel)]="commentForm.author" name="author">
              <textarea
                class="reply-textarea"
                [(ngModel)]="commentForm.comment"
                name="comment"
                placeholder="Reply to thread…"
                rows="2"
                aria-label="Comment body"
              ></textarea>
              <div class="reply-actions">
                <button type="button" class="reply-attach-btn" aria-label="Attach image">
                  <m-icon name="image" [size]="18" color="var(--brand-label-secondary, #6E6E6E)"></m-icon>
                </button>
                <button type="button" class="reply-attach-btn" aria-label="Attach GIF">
                  <m-icon name="gif" [size]="18" color="var(--brand-label-secondary, #6E6E6E)"></m-icon>
                </button>
                <div style="flex:1"></div>
                <button type="submit" class="reply-send-btn"
                  [disabled]="!commentForm.comment.trim()"
                  aria-label="Send reply">
                  <m-icon name="arrow-r" [size]="16" color="#fff"></m-icon>
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>

      <!-- ══ FULL-SCREEN COMPOSE MODAL ══════════════════════════════ -->
      <div class="compose-full-overlay" *ngIf="composing" (click)="closeCompose()">
        <div class="compose-full-modal" (click)="$event.stopPropagation()">
          <form [formGroup]="form" (ngSubmit)="createPost()" class="compose-full-form" data-testid="create-post-form">

            <!-- Header: × close · counter · send -->
            <div class="compose-full-head">
              <button type="button" class="compose-close-btn" (click)="closeCompose()" aria-label="Close composer">
                <m-icon name="close" [size]="22"></m-icon>
              </button>
              <div class="compose-counter" [class.over-limit]="charCount < 0">{{ charCount }}</div>
              <button type="submit" class="compose-send-btn"
                data-testid="create-post-button"
                [disabled]="form.invalid"
                aria-label="Post">
                <m-icon name="arrow-r" [size]="20" color="#fff"></m-icon>
              </button>
            </div>

            <!-- Body: avatar · textarea · audience pill -->
            <div class="compose-full-body">
              <av [name]="session.activeUser()" [size]="36"></av>
              <textarea
                class="compose-full-textarea"
                formControlName="content"
                placeholder="What's on your mind?"
                aria-label="Compose post content"
                data-testid="compose-content-input"
                (input)="charCount = 488 - $any($event.target).value.length"
              ></textarea>
              <div class="compose-audience-wrap">
                <select formControlName="visibility" aria-label="Visibility" data-testid="compose-visibility-select" class="audience-select">
                  <option value="Public">Public</option>
                  <option value="Company">Company</option>
                </select>
              </div>
            </div>

            <!-- Board selector -->
            <div class="compose-board-row">
              <m-icon name="hash" [size]="16" color="var(--brand-label-secondary, #6E6E6E)"></m-icon>
              <select formControlName="boardSlug" aria-label="Board" data-testid="compose-board-select" class="board-select">
                <option *ngFor="let board of boards" [value]="board.slug">{{ board.name }}</option>
              </select>
            </div>

            <!-- Attachment row -->
            <div class="compose-attachment-row">
              <button type="button" class="attach-btn" aria-label="Image">
                <m-icon name="image" [size]="22" color="var(--brand-label-secondary, #6E6E6E)"></m-icon>
              </button>
              <button type="button" class="attach-btn" aria-label="GIF">
                <m-icon name="gif" [size]="22" color="var(--brand-label-secondary, #6E6E6E)"></m-icon>
              </button>
              <button type="button" class="attach-btn" aria-label="Poll">
                <m-icon name="chart" [size]="22" color="var(--brand-label-secondary, #6E6E6E)"></m-icon>
              </button>
              <button type="button" class="attach-btn" aria-label="Content warning">
                <m-icon name="warning" [size]="22" color="var(--brand-label-secondary, #6E6E6E)"></m-icon>
              </button>
              <span class="lang-chip">EN</span>
              <div style="flex:1"></div>
              <button type="button" class="attach-btn" aria-label="More options">
                <m-icon name="dots" [size]="22" color="var(--brand-label-secondary, #6E6E6E)"></m-icon>
              </button>
            </div>

          </form>
        </div>
      </div>

    </div>
  `,
})
export class CasesComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly session = inject(SessionService);
  readonly data = inject(SocialDataService);
  readonly feedSegments = ['All', 'Following', 'Unread'] as const;
  readonly boards = BOARD_CATALOG;
  readonly boardLabel = boardLabel;
  query = '';
  statusFilter = '';
  riskFilter = '';
  activeBoard = 'all-company';
  activeSegment: (typeof this.feedSegments)[number] = 'All';
  commentForm = { author: '', comment: '' };
  composing = false;
  viewState: 'index' | 'thread' = 'index';
  charCount = 488;

  get selectedPost() {
    return this.data.selectedPost();
  }

  get selectedBoardSummary() {
    return this.data.boardSummaries().find((board) => board.slug === this.activeBoard) ?? null;
  }

  get joinedBoardCount() {
    return this.data.joinedBoardSlugs().length;
  }

  get visibleInvites() {
    return this.data.boardInvites().filter((invite) => invite.boardSlug === this.activeBoard);
  }

  get recommendations() {
    return this.data.boardRecommendations();
  }

  accessState(boardSlug: string) {
    return this.data.boardAccessViewModels().find((item) => item.slug === boardSlug) ?? null;
  }

  get filteredPosts() {
    const q = this.query.trim().toLowerCase();
    return this.data.posts().filter((item) => {
      const matchesQuery = !q || [item.id, item.author, item.content, item.status, item.riskLevel].some((value) => String(value).toLowerCase().includes(q));
      const matchesStatus = !this.statusFilter || item.status === this.statusFilter;
      const matchesRisk = !this.riskFilter || item.riskLevel === this.riskFilter;
      const matchesBoard = item.boardSlug === this.activeBoard;
      const matchesSegment = this.activeSegment === 'All'
        || (this.activeSegment === 'Following' && item.author === this.session.activeUser())
        || (this.activeSegment === 'Unread' && item.status === 'Pending Review');
      return matchesQuery && matchesStatus && matchesRisk && matchesBoard && matchesSegment;
    });
  }

  readonly form = this.fb.nonNullable.group({
    author: ['mia.chen', Validators.required],
    visibility: ['Public' as 'Public' | 'Company', Validators.required],
    boardSlug: ['all-company', Validators.required],
    content: ['', Validators.required],
  });

  readonly inviteForm = this.fb.nonNullable.group({
    invitee: ['', Validators.required],
  });

  ngOnInit(): void {
    this.data.refreshWorkspace({ posts: true, memberships: true, preferences: true, boardInvites: true, boardRecommendations: true }).subscribe(() => {
      this.commentForm.author = this.session.activeUser() || '';
      const preferredBoard = this.data.userPreferences().defaultBoardSlug || 'all-company';
      this.applyRouteContext(preferredBoard);
    });
  }

  exitBoard(): void {
    this.viewState = 'index';
    this.data.clearSelectedPost();
    this.syncRoute(null, null);
  }

  createPost(): void {
    if (this.form.invalid) return;
    this.data.createPost(this.form.getRawValue()).subscribe(() => {
      this.composing = false;
      this.charCount = 488;
      this.form.reset({ author: this.session.activeUser() || 'mia.chen', visibility: 'Public', boardSlug: this.activeBoard, content: '' });
      this.syncRoute(this.activeBoard, this.selectedPost?.id ?? null, null);
    });
  }

  openCompose(): void {
    this.form.patchValue({ boardSlug: this.activeBoard, author: this.session.activeUser() || 'mia.chen' });
    this.charCount = 488;
    this.composing = true;
  }

  closeCompose(): void {
    const hasDraft = !!this.form.controls.content.value.trim();
    if (hasDraft && !window.confirm('Discard this draft?')) {
      return;
    }
    this.composing = false;
    if (this.viewState === 'index') {
      this.syncRoute(null, null, null);
      return;
    }
    this.syncRoute(this.activeBoard, this.selectedPost?.id ?? null, null);
  }

  myInitials(): string {
    return (this.session.activeUser() || 'U')
      .split(/[\s._-]+/).slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '').join('');
  }

  riskStrip(level: string): string {
    if (level === 'High') return 'high';
    if (level === 'Medium') return 'med';
    if (level === 'Low') return 'low';
    return 'none';
  }

  authorInitials(author: string): string {
    return author.split(/[\s._-]+/).slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '').join('');
  }

  authorHandle(author: string): string {
    return author.toLowerCase().replaceAll(' ', '.');
  }

  publish(id: string): void {
    this.data.publishPost(id).subscribe();
  }

  approve(id: string): void {
    this.data.approvePost(id).subscribe();
  }

  reject(id: string): void {
    this.data.rejectPost(id).subscribe();
  }

  setQuery(value: string): void { this.query = value; }
  setStatus(value: string): void { this.statusFilter = value; }
  setRisk(value: string): void { this.riskFilter = value; }
  setBoard(value: string): void {
    this.viewState = 'thread';
    this.activeBoard = value;
    this.form.patchValue({ boardSlug: value });
    this.data.clearSelectedPost();
    this.syncRoute(value, null);
  }

  isBoardJoined(boardSlug: string): boolean {
    return this.data.joinedBoardSlugs().includes(boardSlug);
  }

  membershipRole(boardSlug: string): string | null {
    return this.data.boardMemberships().find((item) => item.boardSlug === boardSlug)?.role ?? null;
  }

  isBoardOwner(boardSlug: string): boolean {
    return this.accessState(boardSlug)?.isOwner ?? false;
  }

  entryState(boardSlug: string) {
    return this.accessState(boardSlug)?.entryState ?? 'Open';
  }

  entryStateLabel(boardSlug: string): string {
    const state = this.entryState(boardSlug);
    return state === 'Invited' ? 'Pending invite' : state;
  }

  incomingInvite(boardSlug: string) {
    return this.accessState(boardSlug)?.incomingInvite ?? null;
  }

  ownerPendingInvites(boardSlug: string) {
    return this.accessState(boardSlug)?.outgoingInvites ?? [];
  }

  ownerInviteCount(boardSlug: string): number {
    return this.ownerPendingInvites(boardSlug).length;
  }

  recommendationReason(boardSlug: string): string | null {
    return this.accessState(boardSlug)?.recommendation?.reason ?? null;
  }

  joinBoard(boardSlug: string): void {
    this.data.joinBoard(boardSlug).subscribe(() => {
      this.data.refreshWorkspace({ memberships: true, boardRecommendations: true }).subscribe(() => this.setBoard(boardSlug));
    });
  }

  leaveBoard(boardSlug: string): void {
    this.data.leaveBoard(boardSlug).subscribe(() => {
      this.data.refreshWorkspace({ memberships: true, boardRecommendations: true }).subscribe(() => {
        if (this.activeBoard === boardSlug) {
          this.setBoard('all-company');
        }
      });
    });
  }

  sendInvite(boardSlug: string): void {
    if (this.inviteForm.invalid) return;
    this.data.createBoardInvite({
      boardSlug,
      invitee: this.inviteForm.getRawValue().invitee.trim(),
    }).subscribe(() => {
      this.inviteForm.reset({ invitee: '' });
      this.data.refreshWorkspace({ boardInvites: true }).subscribe();
    });
  }

  respondInvite(id: number, action: 'accept' | 'decline'): void {
    this.data.respondBoardInvite(id, action).subscribe(() => {
      this.data.refreshWorkspace({ memberships: true, boardInvites: true, boardRecommendations: true }).subscribe(() => {
        if (action === 'accept') {
          this.setBoard(this.activeBoard);
        }
      });
    });
  }

  withdrawInvite(id: number): void {
    this.data.withdrawBoardInvite(id).subscribe(() => {
      this.data.refreshWorkspace({ boardInvites: true, boardRecommendations: true }).subscribe();
    });
  }

  resetFilters(): void {
    this.setQuery('');
    this.setStatus('');
    this.setRisk('');
    this.activeSegment = 'All';
  }

  openPost(id: string, syncRoute = true): void {
    if (syncRoute) {
      this.syncRoute(this.activeBoard, id);
    }
    this.reloadPost(id);
  }

  reloadPost(id: string): void {
    this.data.loadPostDetail(id).subscribe();
  }

  closePostDetail(): void {
    this.data.clearSelectedPost();
    this.syncRoute(this.activeBoard, null);
  }

  addComment(id: string): void {
    if (!this.commentForm.author.trim() || !this.commentForm.comment.trim()) return;
    this.data.addComment(id, this.commentForm).subscribe(() => {
      this.commentForm = { author: this.session.activeUser() || '', comment: '' };
    });
  }

  private applyRouteContext(preferredBoard: string): void {
    const boardParam = this.route.snapshot.queryParamMap.get('board');
    const postIdParam = this.route.snapshot.queryParamMap.get('postId');
    const composeParam = this.route.snapshot.queryParamMap.get('compose');
    const board = this.boards.some((item) => item.slug === boardParam) ? boardParam! : preferredBoard;

    this.activeBoard = board;
    this.form.patchValue({
      author: this.session.activeUser() || 'mia.chen',
      boardSlug: board,
    });

    if (boardParam && this.boards.some((item) => item.slug === boardParam)) {
      this.viewState = 'thread';
    }

    if (postIdParam) {
      const targetPost = this.data.posts().find((item) => item.id === postIdParam);
      if (targetPost) {
        this.viewState = 'thread';
        this.activeBoard = targetPost.boardSlug;
        this.form.patchValue({ boardSlug: targetPost.boardSlug });
        this.openPost(postIdParam, false);
        return;
      }
    }

    if (composeParam === '1') {
      this.openCompose();
      this.syncRoute(this.activeBoard, this.selectedPost?.id ?? null, null);
      return;
    }

  }

  private syncRoute(boardSlug: string | null, postId: string | null, compose: number | null = null): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        board: boardSlug ?? null,
        postId: postId ?? null,
        compose,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
