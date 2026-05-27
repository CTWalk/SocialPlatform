import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'mm-sett-group',
  standalone: true,
  template: `
    <div style="margin:0 16px;border-radius:14px;overflow:hidden;background:#fff">
      <ng-content></ng-content>
    </div>
  `,
})
export class SettGroupComponent {}

@Component({
  selector: 'mm-sett-group-header',
  standalone: true,
  imports: [NgIf],
  template: `
    <div style="padding:20px 32px 8px;display:flex;justify-content:space-between;align-items:flex-end;font-size:13px;color:#6E6E6E;letter-spacing:-0.08px">
      <span style="text-transform:uppercase;font-weight:500;letter-spacing:0.3px">
        <ng-content></ng-content>
      </span>
      <span *ngIf="action" style="color:#1A1A1A;font-size:14px">{{ action }}</span>
    </div>
  `,
})
export class SettGroupHeaderComponent {
  @Input() action = '';
}
