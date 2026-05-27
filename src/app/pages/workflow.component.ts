import { Component, signal, OnDestroy } from '@angular/core';
import { NgIf } from '@angular/common';
import { WorkflowMobileComponent } from './workflow-mobile.component';
import { WorkflowDesktopComponent } from './workflow-desktop.component';
import { SHELL_MOBILE_MAX_WIDTH } from '../layout-breakpoints';

@Component({
  standalone: true,
  imports: [NgIf, WorkflowMobileComponent, WorkflowDesktopComponent],
  template: `
    <app-workflow-mobile *ngIf="isMobile()" />
    <app-workflow-desktop *ngIf="!isMobile()" />
  `,
})
export class WorkflowComponent implements OnDestroy {
  isMobile = signal(window.innerWidth <= SHELL_MOBILE_MAX_WIDTH);
  private readonly resizeHandler = () => this.isMobile.set(window.innerWidth <= SHELL_MOBILE_MAX_WIDTH);

  constructor() {
    window.addEventListener('resize', this.resizeHandler);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizeHandler);
  }
}
