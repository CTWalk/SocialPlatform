import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgIf } from '@angular/common';
import { TabBarComponent } from './tab-bar.component';
import { ComposeFabComponent } from './compose-fab.component';

@Component({
  selector: 'mm-screen',
  standalone: true,
  imports: [NgIf, TabBarComponent, ComposeFabComponent],
  template: `
    <div style="height:100%;background:#F3F1ED;position:relative;overflow:hidden;display:flex;flex-direction:column">
      <div style="flex:1;overflow:auto;padding-bottom:100px;padding-top:54px">
        <ng-content></ng-content>
      </div>
      <mm-compose-fab *ngIf="!hideTabBar && fab !== false"
        [icon]="fab || 'plus'"
        (onClick)="onFab.emit()">
      </mm-compose-fab>
      <mm-tab-bar *ngIf="!hideTabBar"
        [active]="tabActive"
        (onChange)="onTabChange.emit($event)">
      </mm-tab-bar>
    </div>
  `,
})
export class ScreenComponent {
  @Input() hideTabBar = false;
  @Input() fab: string | false = 'plus';
  @Input() tabActive = 'home';
  @Output() onTabChange = new EventEmitter<string>();
  @Output() onFab = new EventEmitter<void>();
}
