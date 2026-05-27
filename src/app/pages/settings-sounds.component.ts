import { Component, inject } from '@angular/core';
import { TopBarComponent } from '../design-system';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  imports: [TopBarComponent],
  template: `
    <div style="background:#F3F1ED;min-height:100%;display:flex;flex-direction:column">
      <mm-top-bar title="Sounds and Haptics" [showBack]="true" (onBack)="back()"></mm-top-bar>
      <div style="padding:24px 20px 48px;font-size:14px;line-height:1.5;color:#6E6E6E">
        Sounds and haptic preferences will live here.
      </div>
    </div>
  `,
})
export class SettingsSoundsComponent {
  // TODO(backend): wire to sounds and haptics preferences endpoint when available
  // UI is rendered with local state only until then
  private readonly router = inject(Router);

  back(): void {
    this.router.navigateByUrl('/settings');
  }
}
