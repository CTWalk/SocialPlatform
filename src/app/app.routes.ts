import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login.component';
import { DashboardComponent } from './pages/dashboard.component';
import { CasesComponent } from './pages/cases.component';
import { WorkflowComponent } from './pages/workflow.component';
import { ReportsComponent } from './pages/reports.component';
import { AdminComponent } from './pages/admin.component';
import { SearchComponent } from './pages/search.component';
import { ProfileComponent } from './pages/profile.component';
import { ActivityComponent } from './pages/activity.component';
import { SettingsComponent } from './pages/settings.component';
import { MentionsComponent } from './pages/mentions.component';
import { SettingsAppearanceComponent } from './pages/settings-appearance.component';
import { SettingsNotificationsComponent } from './pages/settings-notifications.component';
import { SettingsAppIconComponent } from './pages/settings-app-icon.component';
import { SettingsAccountsComponent } from './pages/settings-accounts.component';
import { SettingsAboutComponent } from './pages/settings-about.component';
import { SettingsComposerComponent } from './pages/settings-composer.component';
import { SettingsSoundsComponent } from './pages/settings-sounds.component';
import { SettingsContactComponent } from './pages/settings-contact.component';
import { ProfileEditDetailsComponent } from './pages/profile-edit-details.component';
import { ProfileEditLinksComponent } from './pages/profile-edit-links.component';
import { ProfileEditAvatarComponent } from './pages/profile-edit-avatar.component';
import { ProfileEditHeaderComponent } from './pages/profile-edit-header.component';
import { authGuard } from './auth.guard';
import { AppShellComponent } from './app-shell.component';
import { roleGuard } from './role.guard';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  {
    path: '',
    component: AppShellComponent,
    canMatch: [authGuard],
    children: [
      { path: 'home', component: DashboardComponent },
      { path: 'discover', component: SearchComponent },
      { path: 'activity', component: ActivityComponent },
      { path: 'mentions', component: MentionsComponent },
      { path: 'boards', component: CasesComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'profile/edit/details', component: ProfileEditDetailsComponent },
      { path: 'profile/edit/links', component: ProfileEditLinksComponent },
      { path: 'profile/edit/avatar', component: ProfileEditAvatarComponent },
      { path: 'profile/edit/header', component: ProfileEditHeaderComponent },
      { path: 'settings', component: SettingsComponent },
      { path: 'settings/appearance', component: SettingsAppearanceComponent },
      { path: 'settings/notifications', component: SettingsNotificationsComponent },
      { path: 'settings/app-icon', component: SettingsAppIconComponent },
      { path: 'settings/accounts', component: SettingsAccountsComponent },
      { path: 'settings/about', component: SettingsAboutComponent },
      { path: 'settings/composer', component: SettingsComposerComponent },
      { path: 'settings/sounds', component: SettingsSoundsComponent },
      { path: 'settings/contact', component: SettingsContactComponent },
      {
        path: 'moderation/review',
        component: WorkflowComponent,
        canActivate: [roleGuard],
        data: { roles: ['Administrator', 'Moderator', 'Auditor', 'Reviewer', 'Approver'] },
      },
      {
        path: 'moderation/rules',
        component: ReportsComponent,
        canActivate: [roleGuard],
        data: { roles: ['Administrator', 'Moderator'] },
      },
      {
        path: 'admin/users',
        component: AdminComponent,
        canActivate: [roleGuard],
        data: { roles: ['Administrator'] },
      },
      { path: 'dashboard', redirectTo: 'home', pathMatch: 'full' },
      { path: 'feed', redirectTo: 'boards', pathMatch: 'full' },
      { path: 'search', redirectTo: 'discover', pathMatch: 'full' },
      { path: 'review', redirectTo: 'moderation/review', pathMatch: 'full' },
      { path: 'rules', redirectTo: 'moderation/rules', pathMatch: 'full' },
      { path: 'admin', redirectTo: 'admin/users', pathMatch: 'full' },
      { path: 'cases', redirectTo: 'boards', pathMatch: 'full' },
      { path: 'workflow', redirectTo: 'moderation/review', pathMatch: 'full' },
      { path: 'reports', redirectTo: 'moderation/rules', pathMatch: 'full' },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '' },
];
