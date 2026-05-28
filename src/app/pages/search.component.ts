import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SocialDataService } from '../social-data.service';
import { boardLabel } from '../social-taxonomy';
import { MIconComponent, PillBtnComponent, StateBlockComponent } from '../design-system';

@Component({
  standalone: true,
  imports: [CommonModule, MIconComponent, PillBtnComponent, StateBlockComponent],
  styles: [`
    .discover-page { min-height: 100%; background: var(--brand-bg, #F3F1ED); }
    .discover-empty-hero { padding: 64px 24px 40px; text-align: center; border-bottom: 0.5px solid var(--brand-sep, rgba(0,0,0,0.08)); }
    .discover-empty-title { font-family: var(--serif); font-size: 20px; font-weight: 400; color: var(--brand-label, #1A1A1A); margin: 12px 0 4px; }
    .discover-empty-body { font-size: 14px; color: var(--brand-label-secondary, #6E6E6E); margin: 0; }
    .discover-section { padding: 20px 16px; }
    .discover-section-header { font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--brand-label-secondary, #6E6E6E); margin-bottom: 12px; }
    .discover-board-row { display: flex; align-items: center; gap: 12px; padding: 12px 8px; border-radius: 12px; text-decoration: none; color: var(--brand-label, #1A1A1A); cursor: pointer; }
    .discover-board-row:hover { background: var(--brand-bg-chip, #E6E4DE); }
    .discover-board-hash { font-size: 18px; font-weight: 300; color: var(--brand-label-secondary, #6E6E6E); width: 24px; text-align: center; flex-shrink: 0; }
    .discover-board-info { flex: 1; min-width: 0; }
    .discover-board-name { font-size: 15px; font-weight: 500; display: block; }
    .discover-board-sub { font-size: 13px; color: var(--brand-label-secondary, #6E6E6E); display: block; margin-top: 1px; }

    .discover-boards-empty { font-size: 14px; color: var(--brand-label-tertiary, #A5A5A5); padding: 8px; }
  `],
  template: `
    <div class="discover-page" data-testid="search-page">

      <state-block
        *ngIf="isLoading"
        mode="loading"
        title="Loading Discover"
        body="Fetching boards and recommendations."
      ></state-block>

      <state-block
        *ngIf="!isLoading && loadError"
        mode="error"
        title="Could not load Discover"
        [body]="loadError"
      ></state-block>

      <div *ngIf="!isLoading && !loadError">

        <!-- Search empty state (E9: no search endpoint) -->
        <div class="discover-empty-hero">
          <m-icon name="search" [size]="44" color="var(--brand-label-tertiary, #A5A5A5)"></m-icon>
          <p class="discover-empty-title">Discover coming soon</p>
          <p class="discover-empty-body">Search, trending topics, and people will appear here when available.</p>
        </div>

        <!-- Boards to explore (E5: derived from memberships + recommendations) -->
        <div class="discover-section">
          <div class="discover-section-header">Boards to explore</div>

          <div
            *ngFor="let board of data.uiBoardCatalog()"
            class="discover-board-row"
            (click)="openBoard(board.slug)"
          >
            <span class="discover-board-hash">#</span>
            <div class="discover-board-info">
              <span class="discover-board-name">{{ board.name }}</span>
              <span *ngIf="board.desc" class="discover-board-sub">{{ board.desc }}</span>
            </div>
            <span *ngIf="board.subscribed" (click)="leaveBoardFromDiscover($event, board.slug)">
              <sp-pill-btn kind="ghost">Leave</sp-pill-btn>
            </span>
            <span *ngIf="!board.subscribed" (click)="joinBoardFromDiscover($event, board.slug)">
              <sp-pill-btn kind="default">Join</sp-pill-btn>
            </span>
          </div>

          <div *ngIf="!data.uiBoardCatalog().length" class="discover-boards-empty">
            No boards available yet.
          </div>
        </div>

      </div>
    </div>
  `,
})
export class SearchComponent implements OnInit {
  readonly data = inject(SocialDataService);
  readonly boardLabel = boardLabel;
  private readonly router = inject(Router);
  query = '';
  statusFilter = '';
  riskFilter = '';
  smartListName = '';
  isLoading = true;
  loadError = '';
  readonly trendingTags = ['#engineering', '#announcement', '#design-system', '#postmortem', '#policy'];

  get selectedPost() {
    return this.data.selectedPost();
  }

  get discoverCollections() {
    return this.data.discoverCollections();
  }

  get savedLists() {
    return this.data.savedSmartLists();
  }

  get journey() {
    return this.data.discoverJourneyViewModel();
  }

  get filteredPosts() {
    const q = this.query.trim().toLowerCase();
    return this.data.posts().filter((item) => {
      const matchesQuery = !q || [item.id, item.author, item.content, item.status, item.riskLevel].some((value) => String(value).toLowerCase().includes(q));
      const matchesStatus = !this.statusFilter || item.status === this.statusFilter;
      const matchesRisk = !this.riskFilter || item.riskLevel === this.riskFilter;
      return matchesQuery && matchesStatus && matchesRisk;
    });
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.loadError = '';
    this.data.loadDiscoverWorkspace().subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.loadError = 'Please retry after the discovery workspace reconnects.';
      },
    });
  }

  setQuery(value: string): void { this.query = value; }
  setStatus(value: string): void { this.statusFilter = value; }
  setRisk(value: string): void { this.riskFilter = value; }
  resetFilters(): void { this.setQuery(''); this.setStatus(''); this.setRisk(''); }

  applySmartList(mode: 'pending' | 'high-risk' | 'published'): void {
    this.resetFilters();
    if (mode === 'pending') {
      this.setStatus('Pending Review');
      return;
    }
    if (mode === 'high-risk') {
      this.setRisk('High');
      return;
    }
    this.setStatus('Published');
  }

  saveCurrentList(): void {
    const name = this.smartListName.trim() || `View ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    this.data.createSavedSmartList({
      name,
      query: this.query,
      statusFilter: this.statusFilter,
      riskFilter: this.riskFilter,
    }).subscribe(() => {
      this.smartListName = '';
    });
  }

  applySavedList(id: number): void {
    const item = this.savedLists.find((entry) => entry.id === id);
    if (!item) return;
    this.query = item.query;
    this.statusFilter = item.statusFilter;
    this.riskFilter = item.riskFilter;
  }

  deleteSavedList(id: number): void {
    this.data.deleteSavedSmartList(id).subscribe();
  }

  followAction(actionId: string): void {
    const action = this.journey.actions.find((item) => item.id === actionId);
    if (!action) return;
    if (action.cta === 'join-board' && action.boardSlug) {
      this.data.joinBoard(action.boardSlug).subscribe(() => {
        this.data.loadDiscoverWorkspace().subscribe();
        this.router.navigate(['/boards'], { queryParams: { board: action.boardSlug } });
      });
      return;
    }
    if (action.cta === 'open-board' && action.boardSlug) {
      const proceed = () => this.router.navigate(['/boards'], {
        queryParams: {
          board: action.boardSlug,
          postId: action.relatedId || null,
        },
      });
      if (action.notificationId) {
        this.data.markNotificationRead(action.notificationId).subscribe(() => proceed());
        return;
      }
      proceed();
      return;
    }
    if (action.cta === 'open-activity') {
      const navigate = () => this.router.navigate(['/activity'], {
        queryParams: action.activityTab ? { tab: action.activityTab } : undefined,
      });
      if (action.notificationId) {
        this.data.markNotificationRead(action.notificationId).subscribe(() => navigate());
        return;
      }
      navigate();
      return;
    }
    if (action.cta === 'apply-smart-list' && typeof action.relatedId === 'number') {
      this.applySavedList(action.relatedId);
    }
  }

  openPost(id: string): void {
    this.reloadPost(id);
  }

  reloadPost(id: string): void {
    this.data.loadPostDetail(id).subscribe();
  }

  openBoard(boardSlug: string): void {
    this.router.navigate(['/boards'], { queryParams: { board: boardSlug } });
  }

  joinBoardFromDiscover(event: Event, boardSlug: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.data.joinBoard(boardSlug).subscribe();
  }

  leaveBoardFromDiscover(event: Event, boardSlug: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.data.leaveBoard(boardSlug).subscribe();
  }
}
