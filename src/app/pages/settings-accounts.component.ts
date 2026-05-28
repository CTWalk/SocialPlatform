import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from '../session.service';
import { SocialDataService } from '../social-data.service';
import {
  AvComponent,
  TopBarComponent,
  SettRowComponent,
  SettGroupComponent,
} from '../design-system';

@Component({
  standalone: true,
  imports: [AvComponent, TopBarComponent, SettRowComponent, SettGroupComponent],
  template: `
    <!-- AccountsScreen stub — single account view with sign-out -->
    <div style="background:#F3F1ED;min-height:100%;display:flex;flex-direction:column" data-testid="settings-accounts-page">
      <sp-top-bar title="Accounts" [showBack]="true" backAriaLabel="Back to settings" (onBack)="back()"></sp-top-bar>
      <div style="padding:16px 0">
        <sp-sett-group>
          <div style="display:flex;align-items:center;padding:14px 16px;background:#fff;gap:12px">
            <av [name]="session.activeUser()" [size]="44"></av>
            <div style="flex:1;min-width:0">
              <div style="font-size:16px;font-weight:600;color:#1A1A1A">{{ session.activeUser() }}</div>
              <div style="font-size:13px;color:#6E6E6E">{{ session.activeRole() }}</div>
            </div>
          </div>
          <sp-sett-row icon="logout" label="Sign out" [danger]="true" [last]="true" (onClick)="signOut()"></sp-sett-row>
        </sp-sett-group>
      </div>
    </div>
  `,
})
export class SettingsAccountsComponent {
  // TODO(backend): wire to multi-account management endpoint when available
  // UI is rendered with local state only until then
  readonly session = inject(SessionService);
  private readonly data = inject(SocialDataService);
  private readonly router = inject(Router);

  signOut(): void {
    this.session.logout();
    this.data.reset();
    this.router.navigateByUrl('/');
  }

  back(): void { this.router.navigateByUrl('/settings'); }
}
