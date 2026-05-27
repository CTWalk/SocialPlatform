import { Component, signal, OnDestroy } from '@angular/core';
import { NgIf } from '@angular/common';
import { DashboardMobileComponent } from './dashboard-mobile.component';
import { DashboardDesktopComponent } from './dashboard-desktop.component';
import { SHELL_MOBILE_MAX_WIDTH } from '../layout-breakpoints';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgIf, DashboardMobileComponent, DashboardDesktopComponent],
  template: `
    <app-dashboard-mobile *ngIf="isMobile()" />
    <app-dashboard-desktop *ngIf="!isMobile()" />
  `,
})
export class DashboardComponent implements OnDestroy {
  isMobile = signal(window.innerWidth <= SHELL_MOBILE_MAX_WIDTH);
  private readonly resizeHandler = () => this.isMobile.set(window.innerWidth <= SHELL_MOBILE_MAX_WIDTH);

  constructor() {
    window.addEventListener('resize', this.resizeHandler);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizeHandler);
  }
}
