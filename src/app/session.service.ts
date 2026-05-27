import { Injectable, signal } from '@angular/core';
import { clearErrorMonitoringUserContext, setErrorMonitoringUserContext } from './error-monitoring';

export type Role = 'Administrator' | 'Moderator' | 'Auditor' | 'Reviewer' | 'Approver' | 'Member' | 'Viewer';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly storageKey = 'social-platform-session';
  readonly activeUser = signal('');
  readonly activeRole = signal<Role>('Auditor');
  readonly sessionId = signal('');

  constructor() {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as { activeUser: string; activeRole: Role; sessionId: string };
      this.activeUser.set(parsed.activeUser || '');
      this.activeRole.set(parsed.activeRole || 'Auditor');
      this.sessionId.set(parsed.sessionId || '');
      if (this.activeUser()) {
        setErrorMonitoringUserContext(this.activeUser(), this.activeRole());
      }
    } catch {
      localStorage.removeItem(this.storageKey);
    }
  }

  login(username: string, role: Role, sessionId = ''): void {
    this.activeUser.set(username.trim() || 'guest.user');
    this.activeRole.set(role);
    this.sessionId.set(sessionId);
    localStorage.setItem(this.storageKey, JSON.stringify({
      activeUser: this.activeUser(),
      activeRole: this.activeRole(),
      sessionId: this.sessionId(),
    }));
    setErrorMonitoringUserContext(this.activeUser(), this.activeRole());
  }

  logout(): void {
    this.activeUser.set('');
    this.activeRole.set('Auditor');
    this.sessionId.set('');
    localStorage.removeItem(this.storageKey);
    clearErrorMonitoringUserContext();
  }

  canCreateCases(): boolean {
    return ['Administrator', 'Moderator', 'Auditor', 'Reviewer', 'Approver', 'Member'].includes(this.activeRole());
  }

  canCreatePosts(): boolean {
    return this.canCreateCases();
  }

  canManageUsers(): boolean {
    return this.activeRole() === 'Administrator';
  }

  canReviewPosts(): boolean {
    return ['Administrator', 'Moderator', 'Auditor', 'Reviewer', 'Approver'].includes(this.activeRole());
  }

  canModerateKeywords(): boolean {
    return this.activeRole() === 'Administrator' || this.activeRole() === 'Moderator';
  }

  canPublishDirectly(): boolean {
    return ['Administrator', 'Moderator', 'Auditor', 'Reviewer', 'Approver', 'Member'].includes(this.activeRole());
  }

  hasMobileReviewTab(): boolean {
    return ['Administrator', 'Moderator', 'Auditor', 'Reviewer', 'Approver'].includes(this.activeRole());
  }

  hasMobileRulesTab(): boolean {
    return this.activeRole() === 'Administrator' || this.activeRole() === 'Moderator';
  }

  canOpenAdminTools(): boolean {
    return this.canManageUsers() || this.canModerateKeywords() || this.canReviewPosts();
  }
}
