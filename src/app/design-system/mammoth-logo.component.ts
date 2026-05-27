import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'mm-logo',
  standalone: true,
  imports: [NgIf],
  template: `
    <div *ngIf="bg; else bare" [style]="wrapStyle()">
      <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 64 64" style="display:block">
        <path [attr.d]="PATH" [attr.stroke]="color" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <ng-template #bare>
      <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 64 64" style="display:block">
        <path [attr.d]="PATH" [attr.stroke]="color" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </ng-template>
  `,
})
export class MammothLogoComponent {
  @Input() size = 32;
  @Input() color = '#1A1A1A';
  @Input() bg = '';
  @Input() rounded = 8;

  readonly PATH = 'M 12 44 C 12 20, 20 16, 24 22 C 27 27, 24 36, 20 38 C 16 40, 14 36, 18 32 C 22 28, 30 26, 32 32 C 34 38, 30 44, 24 44 M 32 32 C 34 26, 42 26, 46 32 C 50 38, 46 40, 42 38 C 38 36, 35 27, 38 22 C 42 16, 50 20, 50 44';

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
