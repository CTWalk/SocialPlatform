import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TopBarComponent } from '../design-system';

@Component({
  standalone: true,
  imports: [TopBarComponent],
  template: `
    <div style="background:#F3F1ED;min-height:100%;display:flex;flex-direction:column">
      <mm-top-bar title="Edit Header" [showBack]="true" (onBack)="back()"></mm-top-bar>
    </div>
  `,
})
export class ProfileEditHeaderComponent {
  // TODO(backend): wire to header image upload endpoint when available
  // UI is rendered with local state only until then
  private readonly router = inject(Router);
  back(): void { this.router.navigateByUrl('/profile'); }
}
