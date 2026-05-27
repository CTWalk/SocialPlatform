import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { humanizeSlug } from '../data';
import { SocialDataService } from '../social-data.service';
import { SessionService } from '../session.service';
import {
  AvComponent,
  ComposeFabComponent,
  MIconComponent,
  PostCardComponent,
  StateBlockComponent,
  TopBarComponent,
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
  selector: 'app-dashboard-mobile',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    AvComponent,
    MIconComponent,
    PostCardComponent,
    StateBlockComponent,
    TopBarComponent,
    ComposeFabComponent,
  ],
  styles: [`
    :host { display: block; background: #F3F1ED; min-height: 100%; position: relative; }
    .compose-row {
      display: flex; align-items: center; gap: 10px;
      margin: 4px 16px 0; padding: 12px 14px;
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
    .feed-empty-body { font-size: 14px; color: #6E6E6E; margin: 0; }
  `],
  template: `
    <div data-testid="dashboard-mobile">

      <state-block *ngIf="isLoading" mode="loading" title="Loading feed"
        body="Fetching the latest posts from your boards."></state-block>

      <state-block *ngIf="!isLoading && loadError" mode="error"
        title="Could not load feed" [body]="loadError"></state-block>

      <ng-container *ngIf="!isLoading && !loadError">

        <mm-top-bar title="Feed" [large]="true"></mm-top-bar>

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

        <!-- Feed list -->
        <div *ngFor="let post of displayPosts()" (click)="openPost(post)" style="cursor:pointer">
          <mm-post-card [post]="post"></mm-post-card>
        </div>

        <div *ngIf="!displayPosts().length" class="feed-empty" data-testid="feed-empty">
          <m-icon name="feed" [size]="44" color="#A5A5A5"></m-icon>
          <p class="feed-empty-title">Nothing here yet</p>
          <p class="feed-empty-body">Posts will appear as your team shares to boards.</p>
        </div>

      </ng-container>

      <mm-compose-fab
        *ngIf="!isLoading && !loadError && session.canCreatePosts()"
        (onClick)="openCompose()">
      </mm-compose-fab>

    </div>
  `,
})
export class DashboardMobileComponent implements OnInit {
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
