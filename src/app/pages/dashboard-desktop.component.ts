import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { humanizeSlug } from '../data';
import { SocialDataService } from '../social-data.service';
import { SessionService } from '../session.service';
import {
  AvComponent,
  MIconComponent,
  PillBtnComponent,
  PostCardComponent,
  StateBlockComponent,
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
  selector: 'app-dashboard-desktop',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    AvComponent,
    MIconComponent,
    PillBtnComponent,
    PostCardComponent,
    StateBlockComponent,
  ],
  styles: [`
    :host { display: block; background: #F3F1ED; min-height: 100%; }
    .toolbar {
      display: flex; align-items: center; gap: 12px;
      padding: 16px 22px; border-bottom: 0.5px solid var(--brand-sep);
    }
    .toolbar-title {
      font-family: var(--serif); font-size: 22px; font-weight: 400;
      flex: 1; letter-spacing: -0.3px; color: #1A1A1A;
    }
    .dots-btn {
      width: 36px; height: 36px; border-radius: 50%;
      background: rgba(0,0,0,0.06); border: none; display: flex;
      align-items: center; justify-content: center; cursor: pointer;
    }
    .desktop-body { display: flex; align-items: flex-start; min-height: calc(100vh - 57px); }
    .center-col { flex: 1; max-width: 640px; min-height: 100%; border-right: 0.5px solid var(--brand-sep); }
    .compose-row {
      display: flex; align-items: center; gap: 10px;
      margin: 12px 16px; padding: 12px 14px;
      background: #fff; border-radius: 14px; cursor: pointer;
    }
    .compose-placeholder { flex: 1; font-size: 15px; color: #A5A5A5; }
    .compose-plus {
      width: 30px; height: 30px; border-radius: 8px;
      background: #1A1A1A; display: flex; align-items: center;
      justify-content: center; flex-shrink: 0;
    }
    .board-filter-pill {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 7px 12px; border-radius: 999px;
      background: #E6E4DE; font-size: 13px;
    }
    .feed-empty { padding: 64px 24px; text-align: center; }
    .feed-empty-title { font-family: var(--serif); font-size: 18px; font-weight: 400; color: #1A1A1A; margin: 12px 0 4px; }
    .rail {
      flex: 1; padding: 18px; background: rgba(255,255,255,0.4); min-height: 100%;
    }
    .rail-panel-title {
      font-family: var(--serif); font-size: 22px; font-weight: 400;
      letter-spacing: -0.3px; color: #1A1A1A; margin: 0 0 12px;
    }
    .rail-board-row {
      display: flex; align-items: center; gap: 8px; padding: 9px 8px;
      border-radius: 10px; text-decoration: none; color: #1A1A1A; font-size: 14px; cursor: pointer;
    }
    .rail-board-row:hover { background: #E6E4DE; }
    .rail-board-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .rail-board-badge {
      font-size: 11px; font-weight: 600; background: rgba(201,169,97,0.18);
      color: #B08D3F; padding: 2px 7px; border-radius: 10px; flex-shrink: 0;
    }
  `],
  template: `
    <div data-testid="dashboard-desktop">

      <state-block *ngIf="isLoading" mode="loading" title="Loading feed"
        body="Fetching the latest posts from your boards."></state-block>

      <state-block *ngIf="!isLoading && loadError" mode="error"
        title="Could not load feed" [body]="loadError"></state-block>

      <ng-container *ngIf="!isLoading && !loadError">

        <!-- Toolbar -->
        <div class="toolbar">
          <span class="toolbar-title">Feed</span>
          <div class="dots-btn" aria-label="More options">
            <m-icon name="dots" [size]="18"></m-icon>
          </div>
          <sp-pill-btn kind="dark" icon="plus" (onClick)="openCompose()">New post</sp-pill-btn>
        </div>

        <div class="desktop-body">

          <!-- Center feed column -->
          <div class="center-col">

            <!-- Compose row -->
            <div class="compose-row" (click)="openCompose()" data-testid="compose-row">
              <av [name]="session.activeUser()" [size]="32"></av>
              <span class="compose-placeholder">Share with the team…</span>
              <div class="compose-plus" aria-label="Compose">
                <m-icon name="plus" [size]="16" color="#fff"></m-icon>
              </div>
            </div>

            <!-- Board filter pill -->
            <div *ngIf="activeBoardSlug" style="padding:8px 16px" data-testid="home-board-filter-pill">
              <div class="board-filter-pill">
                <span>#{{ activeBoardName() }}</span>
                <button type="button"
                  (click)="clearBoardFilter()"
                  style="border:none;background:transparent;color:#6E6E6E;cursor:pointer;font-size:13px;padding:0">
                  Clear
                </button>
              </div>
            </div>

            <!-- Feed list — exactly posts.length items, no empty rows -->
            <div *ngFor="let post of displayPosts()" (click)="openPost(post)" style="cursor:pointer">
              <sp-post-card [post]="post"></sp-post-card>
            </div>

            <div *ngIf="!displayPosts().length" class="feed-empty" data-testid="feed-empty">
              <m-icon name="feed" [size]="44" color="#A5A5A5"></m-icon>
              <p class="feed-empty-title">Nothing here yet</p>
              <p style="font-size:14px;color:#6E6E6E;margin:0">Posts will appear as your team shares to boards.</p>
            </div>

          </div>

          <!-- Right rail — hidden when catalog is empty (never shows # placeholders) -->
          <aside class="rail" aria-label="Trending boards" *ngIf="data.uiBoardCatalog().length">
            <p class="rail-panel-title">Trending boards</p>
            <a *ngFor="let board of data.uiBoardCatalog()"
              class="rail-board-row"
              routerLink="/home"
              [queryParams]="{ board: board.slug }">
              <span class="rail-board-name">{{ board.name }}</span>
              <span *ngIf="board.unread" class="rail-board-badge">{{ board.unread }}</span>
            </a>
          </aside>

        </div>

      </ng-container>

    </div>
  `,
})
export class DashboardDesktopComponent implements OnInit {
  readonly session = inject(SessionService);
  readonly data = inject(SocialDataService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  isLoading = true;
  loadError = '';
  activeBoardSlug: string | null = null;

  ngOnInit(): void {
    this.isLoading = true;
    this.loadError = '';
    this.route.queryParamMap.subscribe((params) => {
      this.activeBoardSlug = params.get('board');
    });
    this.data.loadHomeWorkspace().subscribe({
      next: () => { this.isLoading = false; },
      error: () => {
        this.isLoading = false;
        this.loadError = 'Please retry once the workspace connection is stable.';
      },
    });
  }

  displayPosts(): Post[] {
    const boardSlug = this.activeBoardSlug;
    const posts = this.data.uiPosts();
    const filtered = boardSlug ? posts.filter((p) => p.boardSlug === boardSlug) : posts;
    return filtered.map((p) => ({ ...p, time: formatRelativeTime(p.time) }));
  }

  activeBoardName(): string {
    const slug = this.activeBoardSlug;
    if (!slug) return '';
    return this.data.uiBoardCatalog().find((b) => b.slug === slug)?.name ?? humanizeSlug(slug);
  }

  clearBoardFilter(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { board: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  openCompose(): void {
    const board = this.activeBoardSlug ?? this.data.userPreferences().defaultBoardSlug ?? 'all-company';
    this.router.navigate(['/boards'], { queryParams: { board, compose: 1 } });
  }

  openPost(post: Post): void {
    this.router.navigate(['/boards'], {
      queryParams: {
        board: post.boardSlug ?? this.activeBoardSlug ?? this.data.userPreferences().defaultBoardSlug ?? 'all-company',
        postId: post.id,
      },
    });
  }
}
