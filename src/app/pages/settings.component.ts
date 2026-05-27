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
    <!-- Mammoth SettingsScreen hub — mammoth-mobile-3.jsx reference -->
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
          <mm-sett-group-header>Moderation</mm-sett-group-header>
          <mm-sett-group>
            <mm-sett-row
              *ngIf="session.canReviewPosts()"
              icon="shield"
              label="Review queue"
              [badge]="''"
              (onClick)="navTo('/moderation/review')">
            </mm-sett-row>
            <mm-sett-row
              *ngIf="session.canModerateKeywords()"
              icon="filter"
              label="Moderation rules"
              (onClick)="navTo('/moderation/rules')">
            </mm-sett-row>
            <mm-sett-row
              *ngIf="session.canManageUsers()"
              icon="people"
              label="User administration"
              [last]="true"
              (onClick)="navTo('/admin/users')">
            </mm-sett-row>
          </mm-sett-group>
        </ng-container>

        <!-- ── Gold banner — dismissable ── -->
        <div *ngIf="showGoldBanner"
          style="margin:4px 16px 14px;background:rgba(201,169,97,0.18);border-radius:14px;padding:16px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
            <div style="font-size:15px;font-weight:600;color:#B08D3F">Welcome to Mammoth!</div>
            <div (click)="showGoldBanner = false"
              style="margin-left:auto;color:#B08D3F;cursor:pointer"
              data-testid="settings-banner-dismiss">
              <m-icon name="close" [size]="16"></m-icon>
            </div>
          </div>
          <div style="font-size:13px;color:#B08D3F;margin-bottom:12px;line-height:1.4">
            Set up your profile and explore company channels to get started.
          </div>
          <mm-pill-btn kind="gold" (onClick)="navTo('/boards')">Explore boards</mm-pill-btn>
        </div>

        <!-- ── Account group ── -->
        <mm-sett-group>
          <mm-sett-row icon="person" label="Accounts" (onClick)="navTo('/settings/accounts')"></mm-sett-row>
          <mm-sett-row icon="logout" label="Sign out" [danger]="true" [last]="true" (onClick)="signOut()" data-testid="settings-sign-out"></mm-sett-row>
        </mm-sett-group>

        <!-- ── Personalization group ── -->
        <mm-sett-group-header></mm-sett-group-header>
        <mm-sett-group>
          <mm-sett-row icon="paint"     label="Appearance"         (onClick)="navTo('/settings/appearance')"></mm-sett-row>
          <mm-sett-row icon="bell"      label="Notifications"      (onClick)="navTo('/settings/notifications')"></mm-sett-row>
          <mm-sett-row icon="sound"     label="Sounds and Haptics" (onClick)="navTo('/settings/sounds')" [last]="true"></mm-sett-row>
        </mm-sett-group>

        <!-- ── Support group ── -->
        <mm-sett-group-header></mm-sett-group-header>
        <mm-sett-group>
          <mm-sett-row icon="mail"  label="Get in touch"           (onClick)="navTo('/settings/contact')"></mm-sett-row>
          <mm-sett-row icon="info"  label="About"        [last]="true" (onClick)="navTo('/settings/about')"></mm-sett-row>
        </mm-sett-group>

        <!-- ── Security group ── -->
        <mm-sett-group-header></mm-sett-group-header>
        <mm-sett-group>
          <!-- TODO(backend): wire to app-lock preferences endpoint when available -->
          <!-- UI is rendered with local state only until then -->
          <mm-sett-row
            icon="lock"
            label="App lock"
            [toggle]="appLockEnabled"
            (onToggle)="appLockEnabled = $event"
            [chevron]="false"
            [last]="true">
          </mm-sett-row>
        </mm-sett-group>

        <!-- ── Privacy group ── -->
        <mm-sett-group-header></mm-sett-group-header>
        <mm-sett-group>
          <mm-sett-row icon="shield" label="Privacy policy"       (onClick)="openPrivacyPolicy()"></mm-sett-row>
          <mm-sett-row icon="trash"  label="Clear cache and data" [danger]="true" [last]="true" (onClick)="clearCache()"></mm-sett-row>
        </mm-sett-group>

        <!-- Footer -->
        <div style="padding:24px 32px 60px;text-align:center;font-size:12px;color:#A5A5A5">
          Mammoth · Made with ❤ for the open web
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
