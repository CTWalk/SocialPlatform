import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'sp-logo',
  standalone: true,
  imports: [NgIf],
  template: `
    <div *ngIf="bg; else bare" [style]="wrapStyle()">
      <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 64 64" style="display:block">
        <circle cx="32" cy="32" r="18" [attr.fill]="color"/>
      </svg>
    </div>
    <ng-template #bare>
      <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 64 64" style="display:block">
        <circle cx="32" cy="32" r="18" [attr.fill]="color"/>
      </svg>
    </ng-template>
  `,
})
export class BrandLogoComponent {
  @Input() size = 32;
  @Input() color = '#1A1A1A';
  @Input() bg = '';
  @Input() rounded = 8;

  wrapStyle() {
    return {
      width: `${this.size + 12}px`,
      height: `${this.size + 12}px`,
      'border-radius': `${this.rounded}px`,
      background: this.bg,
      display: 'flex',
      'align-items': 'center',
      'justify-content': 'center',
      'flex-shrink': '0',
    };
  }
}
