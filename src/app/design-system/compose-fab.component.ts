import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MIconComponent } from './m-icon.component';

@Component({
  selector: 'sp-compose-fab',
  standalone: true,
  imports: [MIconComponent],
  template: `
    <div (click)="onClick.emit()"
      style="position:absolute;right:16px;bottom:100px;z-index:25;width:44px;height:44px;border-radius:12px;background:rgba(0,0,0,0.07);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);display:flex;align-items:center;justify-content:center;cursor:pointer;border:0.5px solid rgba(0,0,0,0.08)">
      <m-icon [name]="icon" [size]="22" color="#1A1A1A" [weight]="2"></m-icon>
    </div>
  `,
})
export class ComposeFabComponent {
  @Input() icon = 'plus';
  @Output() onClick = new EventEmitter<void>();
}
