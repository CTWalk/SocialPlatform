import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgIf } from '@angular/common';
import { MIconComponent } from './m-icon.component';

@Component({
  selector: 'mm-top-bar',
  standalone: true,
  imports: [NgIf, MIconComponent],
  template: `
    <div [style.padding]="large ? '8px 16px 14px' : '8px 16px'">
      <div style="display:flex;align-items:center;min-height:38px;gap:6px">
        <button
          *ngIf="showBack"
          type="button"
          (click)="onBack.emit()"
          [attr.aria-label]="backAriaLabel"
          style="color:#1A1A1A;padding:4px;display:flex;cursor:pointer;background:none;border:none">
          <m-icon name="chev-l" [size]="22"></m-icon>
        </button>
        <ng-content select="[leading]"></ng-content>
        <div *ngIf="!large" style="flex:1;text-align:center;font-size:17px;font-weight:600;color:#1A1A1A">
          {{ title }}
        </div>
        <div *ngIf="large" style="flex:1"></div>
        <div style="display:flex;gap:8px;align-items:center">
          <ng-content select="[trailing]"></ng-content>
        </div>
      </div>
      <div *ngIf="large"
        style="font-family:var(--serif);font-weight:700;font-size:28px;letter-spacing:-0.5px;color:#1A1A1A;margin-top:4px">
        {{ title }}
      </div>
    </div>
  `,
})
export class TopBarComponent {
  @Input() title = '';
  @Input() large = false;
  @Input() showBack = false;
  @Input() backAriaLabel = 'Back';
  @Output() onBack = new EventEmitter<void>();
}
