import { Component, inject } from '@angular/core';
import { TopBarComponent } from '../design-system';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  imports: [TopBarComponent],
  template: `
    <div style="background:#F3F1ED;min-height:100%;display:flex;flex-direction:column">
      <sp-top-bar title="Get in touch" [showBack]="true" (onBack)="back()"></sp-top-bar>
      <div style="padding:24px 20px 48px;font-size:14px;line-height:1.5;color:#6E6E6E">
        Support and feedback contact options will live here.
      </div>
    </div>
  `,
})
export class SettingsContactComponent {
  // TODO(backend): wire to contact/support endpoint or config URL when available
  // UI is rendered with local state only until then
  private readonly router = inject(Router);

  back(): void {
    this.router.navigateByUrl('/settings');
  }
}
