import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { MIconComponent } from './m-icon.component';

export const TAB_DEFS = [
  { key: 'home',     icon: 'home',   label: 'HOME' },
  { key: 'discover', icon: 'search', label: 'DISCOVER' },
  { key: 'activity', icon: 'bell',   label: 'ACTIVITY' },
  { key: 'mentions', icon: 'at',     label: 'MENTIONS' },
  { key: 'profile',  icon: 'person', label: 'PROFILE' },
];

@Component({
  selector: 'sp-tab-bar',
  standalone: true,
  imports: [NgFor, NgIf, MIconComponent],
  template: `
    <div style="position:absolute;bottom:0;left:0;right:0;padding:8px 8px 26px;z-index:30;background:rgba(243,241,237,0.92);backdrop-filter:blur(28px) saturate(180%);-webkit-backdrop-filter:blur(28px) saturate(180%);border-top:0.5px solid rgba(0,0,0,0.08)">
      <div style="display:flex;justify-content:space-around;align-items:center">
        <div *ngFor="let t of tabs" (click)="onChange.emit(t.key)" [style]="tabStyle(t.key)">
          <m-icon [name]="t.icon" [size]="22" [filled]="t.key === active" color="#1A1A1A" [weight]="1.7"></m-icon>
          <div *ngIf="t.key === active"
            style="font-size:11px;font-weight:700;letter-spacing:0.5px;color:#1A1A1A">
            {{ t.label }}
          </div>
        </div>
      </div>
    </div>
  `,
})
export class TabBarComponent {
  @Input() active = 'home';
  @Output() onChange = new EventEmitter<string>();
  readonly tabs = TAB_DEFS;

  tabStyle(key: string) {
    const isActive = key === this.active;
    return {
      display: 'flex',
      'align-items': 'center',
      gap: '8px',
      padding: isActive ? '7px 14px' : '7px 12px',
      'border-radius': '18px',
      cursor: 'pointer',
      background: isActive ? 'rgba(0,0,0,0.05)' : 'transparent',
    };
  }
}
