import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ApiService } from './api.service';
import { SocialDataService } from './social-data.service';
import { SessionService } from './session.service';
import { MIconComponent } from './design-system';

interface NavItem {
  label: string;
  path: string;
  testId: string;
  ariaLabel: string;
  icon: string;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, MIconComponent],
  template: `
    <div class="shell" data-testid="responsive-shell">

      <!-- ─── Desktop sidebar ───────────────────────────────── -->
      <aside class="sidebar" aria-label="Desktop navigation">

        <div class="sidebar-window-controls" aria-hidden="true">
          <span class="traffic-light red"></span>
          <span class="traffic-light amber"></span>
          <span class="traffic-light green"></span>
        </div>

        <div class="brand">
          <div class="brand-mark"><m-icon name="mammoth-logo" [size]="22"></m-icon></div>
          <div class="brand-wordmark">Mammoth</div>
        </div>

        <a routerLink="/discover" class="quick-find" aria-label="Open discover">
          <span class="quick-find-icon nav-icon"><m-icon name="search" [size]="20"></m-icon></span>
          <span class="quick-find-label">Quick find</span>
          <span class="quick-find-kbd">⌘K</span>
        </a>

        <nav class="nav nav-section" aria-label="Primary navigation">
          <a
            *ngFor="let item of desktopPrimaryNav()"
            class="nav-link"
            [routerLink]="item.path"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
            [attr.data-testid]="item.testId"
            [attr.aria-label]="item.ariaLabel"
          >
            <span class="nav-icon"><m-icon [name]="item.icon" [size]="20"></m-icon></span>
            <span>{{ item.label }}</span>
          </a>
        </nav>

        <section class="nav-group">
          <div class="nav-group-label">Boards</div>
          <a class="nav-link muted" routerLink="/boards">
            <span class="nav-icon board-icon">#</span>
            <span>all-company</span>
          </a>
          <a class="nav-link muted" routerLink="/boards">
            <span class="nav-icon board-icon">#</span>
            <span>engineering</span>
          </a>
          <a class="nav-link muted" routerLink="/boards">
            <span class="nav-icon board-icon">#</span>
            <span>design</span>
          </a>
          <a class="nav-link muted" routerLink="/boards">
            <span class="nav-icon board-icon">#</span>
            <span>people-ops</span>
          </a>
        </section>

        <section class="nav-group" *ngIf="session.canReviewPosts() || session.canModerateKeywords()">
          <div class="nav-group-label">Moderation</div>
          <a
            *ngIf="session.canReviewPosts()"
            class="nav-link"
            routerLink="/moderation/review"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
            data-testid="nav-review"
            aria-label="Moderation review queue"
          >
            <span class="nav-icon"><m-icon name="review" [size]="20"></m-icon></span>
            <span>Review queue</span>
          </a>
          <a
            *ngIf="session.canModerateKeywords()"
            class="nav-link"
            routerLink="/moderation/rules"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
            data-testid="nav-rules"
            aria-label="Moderation rules"
          >
            <span class="nav-icon"><m-icon name="rules" [size]="20"></m-icon></span>
            <span>Rules</span>
          </a>
        </section>

        <section class="nav-group" *ngIf="session.canManageUsers()">
          <div class="nav-group-label">Admin</div>
          <a
            class="nav-link"
            routerLink="/admin/users"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
            data-testid="nav-admin"
            aria-label="Administration"
          >
            <span class="nav-icon"><m-icon name="user-group" [size]="20"></m-icon></span>
            <span>Users</span>
          </a>
        </section>

        <!-- User footer -->
        <div class="sidebar-footer">
          <div class="sidebar-user-card">
            <div class="sidebar-avatar">{{ initials() }}</div>
            <div class="sidebar-user-info">
              <strong>{{ session.activeUser() }}</strong>
              <p>
                <span class="status-dot online"></span>
                {{ session.activeRole() }}
              </p>
            </div>
            <a
              routerLink="/settings"
              class="logout-btn"
              data-testid="sidebar-settings"
              aria-label="Settings"
            ><m-icon name="gear" [size]="16"></m-icon></a>
            <button
              type="button"
              class="logout-btn"
              data-testid="sidebar-logout"
              aria-label="Logout"
              (click)="logout()"
            ><m-icon name="logout" [size]="16"></m-icon></button>
          </div>
        </div>

      </aside>

      <!-- ─── Main surface ───────────────────────────────────── -->
      <div class="surface">

        <!-- Mobile top bar -->
        <header class="mobile-topbar" data-testid="mobile-topbar">
          <div class="brand compact">
            <div class="brand-mark"><m-icon name="mammoth-logo" [size]="22"></m-icon></div>
            <div class="brand-wordmark">Mammoth</div>
          </div>
          <div class="mobile-topbar-actions">
            <a
              routerLink="/discover"
              class="icon-button"
              aria-label="Open discover"
              data-testid="mobile-search-shortcut"
            ><m-icon name="search" [size]="20"></m-icon></a>
            <a
              routerLink="/settings"
              class="icon-button"
              aria-label="Settings"
              data-testid="mobile-settings-shortcut"
            ><m-icon name="gear" [size]="20"></m-icon></a>
            <div class="mobile-avatar" aria-hidden="true">{{ initials() }}</div>
          </div>
        </header>

        <main class="content route-stage">
          <router-outlet></router-outlet>
        </main>

        <!-- Mobile tab bar -->
        <nav class="mobile-tabbar" aria-label="Mobile navigation" data-testid="mobile-navigation">
          <a
            *ngFor="let item of mobileNavItems()"
            class="mobile-tab"
            [routerLink]="item.path"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
            [attr.data-testid]="item.testId + '-mobile'"
            [attr.aria-label]="item.ariaLabel"
          >
            <span class="mobile-tab-icon"><m-icon [name]="item.icon" [size]="24"></m-icon></span>
            <span class="mobile-tab-label">{{ item.label }}</span>
          </a>
        </nav>

      </div>
    </div>
  `,
})
export class AppShellComponent {
  readonly session = inject(SessionService);
  private readonly api = inject(ApiService);
  private readonly data = inject(SocialDataService);
  private readonly router = inject(Router);

  readonly desktopPrimaryNav = computed<NavItem[]>(() => {
    return [
      { label: 'Home', path: '/home', testId: 'nav-home', ariaLabel: 'Home', icon: 'dashboard' },
      { label: 'Discover', path: '/discover', testId: 'nav-discover', ariaLabel: 'Discover', icon: 'search' },
      { label: 'Activity', path: '/activity', testId: 'nav-activity', ariaLabel: 'Activity', icon: 'activity' },
      { label: 'Mentions', path: '/mentions', testId: 'nav-mentions', ariaLabel: 'Mentions', icon: 'at' },
      { label: 'Profile', path: '/profile', testId: 'nav-profile', ariaLabel: 'Profile', icon: 'profile' },
    ];
  });

  readonly mobileNavItems = computed<NavItem[]>(() => {
    return [
      { label: 'Home', path: '/home', testId: 'nav-home', ariaLabel: 'Home', icon: 'dashboard' },
      { label: 'Discover', path: '/discover', testId: 'nav-discover', ariaLabel: 'Discover', icon: 'search' },
      { label: 'Activity', path: '/activity', testId: 'nav-activity', ariaLabel: 'Activity', icon: 'activity' },
      { label: 'Mentions', path: '/mentions', testId: 'nav-mentions', ariaLabel: 'Mentions', icon: 'at' },
      { label: 'Profile', path: '/profile', testId: 'nav-profile', ariaLabel: 'Profile', icon: 'profile' },
    ];
  });

  initials(): string {
    const raw = this.session.activeUser().trim() || 'guest user';
    return raw
      .split(/[.\s_-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
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
}
