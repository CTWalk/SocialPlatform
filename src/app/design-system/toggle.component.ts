import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'sp-toggle',
  standalone: true,
  template: `
    <div (click)="onChange.emit(!on)" [style]="trackStyle()">
      <div [style]="thumbStyle()"></div>
    </div>
  `,
})
export class ToggleComponent {
  @Input() on = false;
  @Output() onChange = new EventEmitter<boolean>();

  trackStyle() {
    return {
      width: '51px',
      height: '31px',
      'border-radius': '31px',
      background: this.on
        ? 'linear-gradient(180deg, #E0BD66 0%, #C9A961 100%)'
        : 'rgba(120,120,128,0.20)',
      padding: '2px',
      transition: 'background .2s',
      'flex-shrink': '0',
      cursor: 'pointer',
      display: 'block',
    };
  }

  thumbStyle() {
    return {
      width: '27px',
      height: '27px',
      'border-radius': '50%',
      background: '#fff',
      transform: this.on ? 'translateX(20px)' : 'translateX(0)',
      transition: 'transform .2s',
      'box-shadow': '0 3px 8px rgba(0,0,0,0.18), 0 1px 1px rgba(0,0,0,0.08)',
    };
  }
}
