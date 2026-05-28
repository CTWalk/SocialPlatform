import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgIf } from '@angular/common';
import { MIconComponent } from './m-icon.component';

type PillKind = 'default' | 'gold' | 'dark' | 'blue' | 'danger' | 'ghost';

const PALETTE: Record<PillKind, { bg: string; fg: string; border?: string }> = {
  default: { bg: '#E6E4DE', fg: '#1A1A1A' },
  gold:    { bg: 'linear-gradient(180deg, #E0BD66 0%, #C9A961 100%)', fg: '#fff' },
  dark:    { bg: '#1A1A1A', fg: '#fff' },
  blue:    { bg: '#5BAEDD', fg: '#fff' },
  danger:  { bg: '#E0426B', fg: '#fff' },
  ghost:   { bg: 'transparent', fg: '#1A1A1A', border: '0.5px solid rgba(0,0,0,0.08)' },
};

@Component({
  selector: 'sp-pill-btn',
  standalone: true,
  imports: [NgIf, MIconComponent],
  template: `
    <div (click)="onClick.emit()" [style]="btnStyle()">
      <m-icon *ngIf="icon" [name]="icon" [size]="16" [color]="palette[kind].fg"></m-icon>
      <ng-content></ng-content>
    </div>
  `,
})
export class PillBtnComponent {
  @Input() kind: PillKind = 'default';
  @Input() icon = '';
  @Input() full = false;
  @Output() onClick = new EventEmitter<void>();

  readonly palette = PALETTE;

  btnStyle() {
    const p = PALETTE[this.kind];
    return {
      display: 'inline-flex',
      'align-items': 'center',
      'justify-content': 'center',
      gap: '8px',
      padding: '11px 22px',
      'border-radius': '22px',
      background: p.bg,
      color: p.fg,
      border: p.border ?? 'none',
      'font-size': '15px',
      'font-weight': '600',
      'letter-spacing': '-0.1px',
      width: this.full ? '100%' : 'auto',
      cursor: 'pointer',
      'box-sizing': 'border-box',
    };
  }
}
