import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SocialDataService } from '../social-data.service';
import { SessionService } from '../session.service';
import { BOARD_CATALOG } from '../social-taxonomy';
import {
  MIconComponent,
  PillBtnComponent,
  SettRowComponent,
  SettGroupComponent,
  SettGroupHeaderComponent,
} from '../design-system';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MIconComponent,
    PillBtnComponent,
    SettRowComponent,
    SettGroupComponent,
    SettGroupHeaderComponent,
  ],
  template: `
    <!-- Reference SettingsScreen hub — reference-mobile-3.jsx reference -->
    <div style="background:#F3F1ED;min-height:100%;display:flex;flex-direction:column" data-testid="settings-page">

      <!-- Custom top bar: close → /profile | "Settings" centred | spacer -->
      <div style="padding:14px 16px;display:flex;align-items:center;gap:6px;background:#F3F1ED">
        <div (click)="navTo('/profile')"
          style="color:#1A1A1A;padding:4px;display:flex;cursor:pointer"
          data-testid="settings-close">
          <m-icon name="close" [size]="22"></m-icon>
        </div>
        <div style="flex:1;text-align:center;font-size:17px;font-weight:600;color:#1A1A1A">Settings</div>
        <div style="width:30px"></div>
      </div>

      <!-- Scrollable body -->
      <div style="flex:1;overflow:auto;padding-bottom:48px">

        <!-- ── C1: Role-gated Moderation group (ABOVE gold banner per spec) ── -->
        <ng-container *ngIf="session.canReviewPosts() || session.canModerateKeywords() || session.canManageUsers()">
          <sp-sett-group-header>Moderation</sp-sett-group-header>
          <sp-sett-group>
            <sp-sett-row
              *ngIf="session.canReviewPosts()"
              icon="shield"
              label="Review queue"
              [badge]="''"
              (onClick)="navTo('/moderation/review')">
            </sp-sett-row>
            <sp-sett-row
              *ngIf="session.canModerateKeywords()"
              icon="filter"
              label="Moderation rules"
              (onClick)="navTo('/moderation/rules')">
            </sp-sett-row>
            <sp-sett-row
              *ngIf="session.canManageUsers()"
              icon="people"
              label="User administration"
              [last]="true"
              (onClick)="navTo('/admin/users')">
            </sp-sett-row>
          </sp-sett-group>
        </ng-container>

        <!-- ── Gold banner — dismissable ── -->
        <div *ngIf="showGoldBanner"
          style="margin:4px 16px 14px;background:rgba(201,169,97,0.18);border-radius:14px;padding:16px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
            <div style="font-size:15px;font-weight:600;color:#B08D3F">Premium access is ready</div>
            <div (click)="showGoldBanner = false"
              style="margin-left:auto;color:#B08D3F;cursor:pointer"
              data-testid="settings-banner-dismiss">
              <m-icon name="close" [size]="16"></m-icon>
            </div>
          </div>
          <div style="font-size:13px;color:#B08D3F;margin-bottom:12px;line-height:1.4">
            Set up your profile and explore company channels to get started.
          </div>
          <sp-pill-btn kind="gold" (onClick)="navTo('/boards')">Explore boards</sp-pill-btn>
        </div>

        <!-- ── Account group ── -->
        <sp-sett-group>
          <sp-sett-row icon="person" label="Accounts" (onClick)="navTo('/settings/accounts')"></sp-sett-row>
          <sp-sett-row icon="logout" label="Sign out" [danger]="true" [last]="true" (onClick)="signOut()" data-testid="settings-sign-out"></sp-sett-row>
        </sp-sett-group>

        <!-- ── Personalization group ── -->
        <sp-sett-group-header></sp-sett-group-header>
        <sp-sett-group>
          <sp-sett-row icon="paint"     label="Appearance"         (onClick)="navTo('/settings/appearance')"></sp-sett-row>
          <sp-sett-row icon="bell"      label="Notifications"      (onClick)="navTo('/settings/notifications')"></sp-sett-row>
          <sp-sett-row icon="sound"     label="Sounds and Haptics" (onClick)="navTo('/settings/sounds')" [last]="true"></sp-sett-row>
        </sp-sett-group>

        <!-- ── Support group ── -->
        <sp-sett-group-header></sp-sett-group-header>
        <sp-sett-group>
          <sp-sett-row icon="mail"  label="Get in touch"           (onClick)="navTo('/settings/contact')"></sp-sett-row>
          <sp-sett-row icon="info"  label="About"        [last]="true" (onClick)="navTo('/settings/about')"></sp-sett-row>
        </sp-sett-group>

        <!-- ── Security group ── -->
        <sp-sett-group-header></sp-sett-group-header>
        <sp-sett-group>
          <!-- TODO(backend): wire to app-lock preferences endpoint when available -->
          <!-- UI is rendered with local state only until then -->
          <sp-sett-row
            icon="lock"
            label="App lock"
            [toggle]="appLockEnabled"
            (onToggle)="appLockEnabled = $event"
            [chevron]="false"
            [last]="true">
          </sp-sett-row>
        </sp-sett-group>

        <!-- ── Privacy group ── -->
        <sp-sett-group-header></sp-sett-group-header>
        <sp-sett-group>
          <sp-sett-row icon="shield" label="Privacy policy"       (onClick)="openPrivacyPolicy()"></sp-sett-row>
          <sp-sett-row icon="trash"  label="Clear cache and data" [danger]="true" [last]="true" (onClick)="clearCache()"></sp-sett-row>
        </sp-sett-group>

        <!-- Footer -->
        <div style="padding:24px 32px 60px;text-align:center;font-size:12px;color:#A5A5A5">
          Social Platform · Built for connected teams
        </div>

      </div>
    </div>
  `,
})
export class SettingsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly data = inject(SocialDataService);
  readonly session = inject(SessionService);
  readonly boards = BOARD_CATALOG;
  private readonly router = inject(Router);

  // ── UI-only state ────────────────────────────────────────────────
  showGoldBanner = true;
  // TODO(backend): wire to app-lock preferences endpoint when available
  // UI is rendered with local state only until then
  appLockEnabled = false;

  get vm() { return this.data.settingsViewModel(); }

  readonly preferencesForm = this.fb.nonNullable.group({
    theme: ['System' as 'System' | 'Light' | 'Dark', Validators.required],
    notificationsEnabled: [true],
    defaultBoardSlug: ['all-company', Validators.required],
    digestCadence: ['Daily' as 'Instant' | 'Daily' | 'Weekly', Validators.required],
  });

  get totalUsersLabel(): string {
    return this.session.canManageUsers() ? String(this.data.summary().totalUsers) : '--';
  }

  ngOnInit(): void {
    this.data.loadSettingsWorkspace().subscribe(() => {
      const preferences = this.vm.preferences;
      this.preferencesForm.reset({
        theme: preferences.theme,
        notificationsEnabled: preferences.notificationsEnabled,
        defaultBoardSlug: preferences.defaultBoardSlug,
        digestCadence: preferences.digestCadence,
      });
    });
  }

  savePreferences(): void {
    if (this.preferencesForm.invalid) return;
    this.data.updateMyPreferences(this.preferencesForm.getRawValue()).subscribe((preferences) => {
      this.preferencesForm.patchValue({
        theme: preferences.theme,
        notificationsEnabled: preferences.notificationsEnabled,
        defaultBoardSlug: preferences.defaultBoardSlug,
        digestCadence: preferences.digestCadence,
      });
    });
  }

  onboardingProgress(): number {
    const state = this.vm.onboarding;
    return [state.profileCompleted, state.joinedBoard, state.savedSmartList, state.reviewedPost].filter(Boolean).length;
  }

  followNextStep(step: { route: string; queryParams?: Record<string, string | number | null>; notificationId?: string | null }): void {
    const proceed = () => this.router.navigate([step.route], { queryParams: step.queryParams ?? undefined });
    if (step.notificationId) {
      this.data.markNotificationRead(step.notificationId).subscribe(() => proceed());
      return;
    }
    proceed();
  }

  navTo(path: string): void {
    this.router.navigateByUrl(path);
  }

  signOut(): void {
    this.session.logout();
    this.data.reset();
    this.router.navigateByUrl('/');
  }

  openPrivacyPolicy(): void {
    // TODO(backend): wire to privacy policy URL from config endpoint when available
    // UI is rendered with local state only until then
  }

  clearCache(): void {
    this.data.reset();
    this.router.navigateByUrl('/');
  }
}
