import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgFor } from '@angular/common';

@Component({
  selector: 'sp-seg',
  standalone: true,
  imports: [NgFor],
  template: `
    <div style="display:flex;padding:3px;background:#E6E4DE;border-radius:11px">
      <div *ngFor="let opt of options" (click)="onChange.emit(opt)" [style]="optStyle(opt)">{{ opt }}</div>
    </div>
  `,
})
export class SegComponent {
  @Input() options: string[] = [];
  @Input() value = '';
  @Output() onChange = new EventEmitter<string>();

  optStyle(opt: string) {
    const active = opt === this.value;
    return {
      flex: '1',
      'text-align': 'center',
      padding: '8px 0',
      background: active ? '#fff' : 'transparent',
      'border-radius': '9px',
      cursor: 'pointer',
      'font-size': '14px',
      'font-weight': active ? '600' : '500',
      'letter-spacing': '-0.08px',
      color: '#1A1A1A',
      'box-shadow': active ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
    };
  }
}
