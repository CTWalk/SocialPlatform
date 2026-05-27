import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';

const PALETTE: [string, string][] = [
  ['#7AA5C4', '#B6CFD8'],
  ['#C9A961', '#E0BD66'],
  ['#8D6748', '#B89776'],
  ['#3E5C76', '#748CAB'],
  ['#A75B5B', '#D38484'],
  ['#5C6B5C', '#8FA68F'],
];

function hashIdx(s: string, n: number): number {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 9999;
  return h % n;
}

@Component({
  selector: 'av',
  standalone: true,
  imports: [NgIf],
  template: `
    <div *ngIf="mammoth; else initials" [style]="mammothStyle()">
      <svg [attr.width]="size * 0.7" [attr.height]="size * 0.7" viewBox="0 0 64 64" style="display:block">
        <path
          d="M 12 44 C 12 20, 20 16, 24 22 C 27 27, 24 36, 20 38 C 16 40, 14 36, 18 32 C 22 28, 30 26, 32 32 C 34 38, 30 44, 24 44 M 32 32 C 34 26, 42 26, 46 32 C 50 38, 46 40, 42 38 C 38 36, 35 27, 38 22 C 42 16, 50 20, 50 44"
          stroke="#FFFFFF" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <ng-template #initials>
      <div [style]="style()">{{ initials() }}</div>
    </ng-template>
  `,
})
export class AvComponent {
  @Input() name = '';
  @Input() size = 40;
  @Input() ring = false;
  @Input() mammoth = false;

  initials(): string {
    return this.name
      .split(/[\s.@]/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('');
  }

  style(): Record<string, string> {
    const [c1, c2] = PALETTE[hashIdx(this.name || 'X', PALETTE.length)];
    return {
      width: `${this.size}px`,
      height: `${this.size}px`,
      'border-radius': '50%',
      background: `linear-gradient(135deg, ${c1}, ${c2})`,
      display: 'flex',
      'align-items': 'center',
      'justify-content': 'center',
      color: '#fff',
      'font-size': `${Math.round(this.size * 0.38)}px`,
      'font-weight': '600',
      'flex-shrink': '0',
      'box-shadow': this.ring ? '0 0 0 2px #fff, 0 0 0 4px rgba(201,169,97,0.5)' : 'none',
      'user-select': 'none',
    };
  }

  mammothStyle(): Record<string, string> {
    return {
      width: `${this.size}px`,
      height: `${this.size}px`,
      'border-radius': '50%',
      background: '#1F1F1F',
      display: 'flex',
      'align-items': 'center',
      'justify-content': 'center',
      'flex-shrink': '0',
    };
  }
}
