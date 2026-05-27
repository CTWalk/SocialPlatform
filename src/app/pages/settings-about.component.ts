import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TopBarComponent } from '../design-system';

@Component({
  standalone: true,
  imports: [TopBarComponent],
  template: `
    <div style="background:#F3F1ED;min-height:100%;display:flex;flex-direction:column" data-testid="settings-about-page">
      <mm-top-bar title="About" [showBack]="true" backAriaLabel="Back to settings" (onBack)="back()"></mm-top-bar>
      <div style="padding:24px 32px;text-align:center;font-size:13px;color:#A5A5A5">
        Mammoth · Made with ❤ for the open web
      </div>
    </div>
  `,
})
export class SettingsAboutComponent {
  // TODO(backend): wire to version/build info endpoint when available
  // UI is rendered with local state only until then
  private readonly router = inject(Router);
  back(): void { this.router.navigateByUrl('/settings'); }
}
