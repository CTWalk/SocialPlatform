import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgFor } from '@angular/common';
import { MIconComponent } from './m-icon.component';

@Component({
  selector: 'mm-feed-tabs',
  standalone: true,
  imports: [NgFor, MIconComponent],
  template: `
    <div style="display:flex;align-items:center;padding:8px 16px;min-height:38px">
      <div style="flex:1;display:flex;align-items:center;gap:14px;overflow:hidden">
        <div *ngFor="let t of tabs" (click)="onChange.emit(t)" [style]="tabStyle(t)">{{ t }}</div>
        <div style="color:#A5A5A5">/</div>
      </div>
      <div (click)="onMore.emit()"
        style="padding:0 10px;color:#6E6E6E;cursor:pointer;display:flex;align-items:center">
        <m-icon name="dots" [size]="20"></m-icon>
      </div>
    </div>
  `,
})
export class FeedTabsComponent {
  @Input() tabs: string[] = ['Following', 'For You'];
  @Input() active = 'Following';
  @Output() onChange = new EventEmitter<string>();
  @Output() onMore = new EventEmitter<void>();

  tabStyle(t: string) {
    const isActive = t === this.active;
    return {
      'font-size': '17px',
      'letter-spacing': '-0.4px',
      'font-weight': isActive ? '700' : '400',
      color: isActive ? '#1A1A1A' : '#6E6E6E',
      'white-space': 'nowrap',
      cursor: 'pointer',
    };
  }
}
