import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgIf } from '@angular/common';
import { MIconComponent } from './m-icon.component';
import { ToggleComponent } from './toggle.component';

@Component({
  selector: 'mm-sett-row',
  standalone: true,
  imports: [NgIf, MIconComponent, ToggleComponent],
  template: `
    <div (click)="onClick.emit()" [style]="rowStyle()">
      <div *ngIf="icon"
        style="width:28px;height:28px;margin-right:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0"
        [style.color]="danger ? '#D34A4A' : '#1A1A1A'">
        <m-icon [name]="icon" [size]="22" [weight]="1.8"></m-icon>
      </div>
      <div style="flex:1;font-size:17px;letter-spacing:-0.3px" [style.color]="labelColor()">{{ label }}</div>
      <div *ngIf="badge"
        style="background:#C9A961;color:#fff;border-radius:10px;padding:1px 8px;font-size:12px;font-weight:600;margin-right:8px">
        {{ badge }}
      </div>
      <div *ngIf="value !== undefined && toggle === undefined"
        style="color:#6E6E6E;margin-right:6px;font-size:17px;letter-spacing:-0.3px">
        {{ value }}
      </div>
      <mm-toggle *ngIf="toggle !== undefined" [on]="toggle" (onChange)="onToggle.emit($event)"></mm-toggle>
      <svg *ngIf="chevron && toggle === undefined" width="7" height="12" viewBox="0 0 7 12" style="flex-shrink:0">
        <path d="M1 1l5 5-5 5" stroke="#A5A5A5" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <div *ngIf="!last" [style]="sepStyle()"></div>
    </div>
  `,
})
export class SettRowComponent {
  @Input() icon = '';
  @Input() label = '';
  @Input() value: string | undefined = undefined;
  @Input() toggle: boolean | undefined = undefined;
  @Input() chevron = true;
  @Input() danger = false;
  @Input() accent = false;
  @Input() badge = '';
  @Input() last = false;
  @Output() onClick = new EventEmitter<void>();
  @Output() onToggle = new EventEmitter<boolean>();

  rowStyle() {
    return {
      display: 'flex',
      'align-items': 'center',
      'min-height': '52px',
      padding: '11px 16px',
      position: 'relative',
      cursor: 'pointer',
      background: '#FFFFFF',
    };
  }

  labelColor(): string {
    if (this.danger) return '#D34A4A';
    if (this.accent) return '#C9A961';
    return '#1A1A1A';
  }

  sepStyle() {
    return {
      position: 'absolute',
      bottom: '0',
      right: '0',
      left: this.icon ? '58px' : '16px',
      height: '0.5px',
      background: 'rgba(0,0,0,0.08)',
    };
  }
}
