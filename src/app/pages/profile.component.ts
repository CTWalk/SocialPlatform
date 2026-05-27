import { Component, signal, OnDestroy } from '@angular/core';
import { NgIf } from '@angular/common';
import { ProfileMobileComponent } from './profile-mobile.component';
import { ProfileDesktopComponent } from './profile-desktop.component';
import { SHELL_MOBILE_MAX_WIDTH } from '../layout-breakpoints';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [NgIf, ProfileMobileComponent, ProfileDesktopComponent],
  template: `
    <app-profile-mobile *ngIf="isMobile()" />
    <app-profile-desktop *ngIf="!isMobile()" />
  `,
})
export class ProfileComponent implements OnDestroy {
  isMobile = signal(window.innerWidth <= SHELL_MOBILE_MAX_WIDTH);
  private readonly resizeHandler = () => this.isMobile.set(window.innerWidth <= SHELL_MOBILE_MAX_WIDTH);

  constructor() {
    window.addEventListener('resize', this.resizeHandler);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizeHandler);
  }
}
