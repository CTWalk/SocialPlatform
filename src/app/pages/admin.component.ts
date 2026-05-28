import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { SocialDataService } from '../social-data.service';
import { SessionService } from '../session.service';
import { AvComponent, MIconComponent, StateBlockComponent, TopBarComponent, SettGroupComponent, SettGroupHeaderComponent } from '../design-system';

@Component({
  standalone: true,
  imports: [CommonModule, AvComponent, MIconComponent, StateBlockComponent, TopBarComponent, SettGroupComponent, SettGroupHeaderComponent],
  styles: [`
    .au-stat { background: #fff; border-radius: 14px; padding: 14px; }
    .au-stat-val { font-family: var(--serif); font-size: 30px; font-weight: 400; letter-spacing: -0.5px; color: var(--brand-label); line-height: 1; margin-bottom: 4px; }
    .au-stat-lbl { font-size: 13px; color: var(--brand-label-secondary); }
    .au-user-row { padding: 11px 16px; display: flex; align-items: center; gap: 12px; position: relative; background: #fff; }
    .au-divider { position: absolute; bottom: 0; left: 64px; right: 0; height: 0.5px; background: var(--brand-sep); }
    .au-add-row { padding: 12px 16px; display: flex; align-items: center; gap: 10px; background: #fff; }
    .au-add-row input, .au-add-row select {
      flex: 1; min-width: 0; border: none; background: var(--brand-bg-chip);
      border-radius: 8px; padding: 8px 10px; font-size: 14px; color: var(--brand-label); outline: none;
    }
    .au-add-row button {
      padding: 11px 22px; border-radius: 22px; border: none; cursor: pointer;
      font-size: 15px; font-weight: 600; background: var(--brand-gold-grad); color: #fff; flex-shrink: 0;
    }
    .au-add-row button:disabled { opacity: 0.4; cursor: not-allowed; }
  `],
  template: `
    <div data-testid="admin-page">

      <sp-top-bar title="Administration" [large]="true" [showBack]="true" (onBack)="goBack()">
        <div trailing style="width:36px;height:36px;border-radius:50%;background:rgba(0,0,0,0.06);display:flex;align-items:center;justify-content:center;cursor:pointer">
          <m-icon name="people" [size]="18"></m-icon>
        </div>
      </sp-top-bar>

      <state-block *ngIf="isLoading"
        mode="loading" title="Loading users workspace"
        body="Fetching role assignments, account status, and admin operations.">
      </state-block>

      <state-block *ngIf="!isLoading && loadError"
        mode="error" title="Could not load users workspace" [body]="loadError">
      </state-block>

      <ng-container *ngIf="!isLoading && !loadError">

        <!-- 2×2 stat cards -->
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;padding:0 16px 14px">
          <div class="au-stat">
            <div class="au-stat-val">{{ users.length }}</div>
            <div class="au-stat-lbl">Total users</div>
          </div>
          <div class="au-stat">
            <div class="au-stat-val">{{ countByRole('Moderator') }}</div>
            <div class="au-stat-lbl">Moderators</div>
          </div>
          <div class="au-stat">
            <div class="au-stat-val">{{ countByRole('Administrator') }}</div>
            <div class="au-stat-lbl">Admins</div>
          </div>
          <div class="au-stat">
            <div class="au-stat-val">{{ inactiveCount }}</div>
            <div class="au-stat-lbl">Locked</div>
          </div>
        </div>

        <!-- User list -->
        <sp-sett-group-header action="See all">Users</sp-sett-group-header>
        <sp-sett-group>
          <div *ngFor="let user of users; let last = last" class="au-user-row"
            [attr.data-testid]="'admin-user-' + user.username">
            <av [name]="user.username" [size]="36"></av>
            <div style="flex:1;min-width:0">
              <div style="font-size:16px;font-weight:500;color:var(--brand-label)">
                {{ user.username }}
                <span *ngIf="!user.active" style="font-size:10px;color:#C44545;font-weight:700;margin-left:8px">LOCKED</span>
              </div>
              <div style="font-size:13px;color:var(--brand-label-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
                &#64;{{ user.username }}
              </div>
            </div>
            <span style="font-size:12px;font-weight:600;padding:3px 10px;border-radius:12px;flex-shrink:0"
              [style.background]="roleTone(user.role).bg"
              [style.color]="roleTone(user.role).fg">
              {{ user.role }}
            </span>
            <div *ngIf="!last" class="au-divider"></div>
          </div>

          <div *ngIf="!users.length" style="padding:20px 16px;text-align:center;color:var(--brand-label-secondary);font-size:14px">
            No users provisioned yet
          </div>
        </sp-sett-group>

        <!-- Create user form -->
        <sp-sett-group-header>{{ session.canManageUsers() ? 'Add user' : 'Users (read-only)' }}</sp-sett-group-header>
        <sp-sett-group>
          <form class="au-add-row" (ngSubmit)="createUser(username.value, role.value); username.value='';"
            data-testid="create-user-form">
            <input #username type="text" aria-label="Username" placeholder="Username…"
              data-testid="admin-username-input">
            <select #role aria-label="Role" data-testid="admin-role-select">
              <option *ngFor="let item of roles" [value]="item">{{ item }}</option>
            </select>
            <button type="submit" [disabled]="!session.canManageUsers()" data-testid="create-user-button">
              Add
            </button>
          </form>
        </sp-sett-group>

      </ng-container>

    </div>
  `,
})
export class AdminComponent implements OnInit {
  readonly roles = ['Administrator', 'Moderator', 'Auditor', 'Reviewer', 'Approver', 'Member', 'Viewer'] as const;
  readonly session = inject(SessionService);
  readonly data = inject(SocialDataService);
  isLoading = true;
  loadError = '';

  get users() {
    return this.data.users();
  }

  get inactiveCount(): number {
    return this.users.filter((user) => !user.active).length;
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.loadError = '';
    this.data.refreshWorkspace({ users: true }).subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.loadError = 'Please retry after the users workspace reconnects.';
      },
    });
  }

  createUser(username: string, role: string): void {
    if (!username.trim()) return;
    this.data.createUser(username, role).subscribe();
  }

  goBack(): void {
    window.history.back();
  }

  countByRole(role: string): number {
    return this.users.filter((user) => user.role === role).length;
  }

  roleTone(role: string): { fg: string; bg: string } {
    if (role === 'Administrator') return { fg: '#7A4E9F', bg: 'rgba(122,78,159,0.15)' };
    if (role === 'Moderator') return { fg: '#4F8F5F', bg: 'rgba(79,143,95,0.15)' };
    if (role === 'Auditor' || role === 'Reviewer') return { fg: '#5A7A95', bg: 'rgba(90,122,149,0.15)' };
    if (role === 'Approver') return { fg: '#C28B2A', bg: 'rgba(194,139,42,0.15)' };
    if (role === 'Member') return { fg: '#5A7A95', bg: 'rgba(90,122,149,0.15)' };
    return { fg: '#6E6E6E', bg: 'rgba(110,110,110,0.12)' };
  }
}
