import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SocialDataService } from '../social-data.service';
import {
  MIconComponent,
  SettRowComponent,
  SettGroupComponent,
  SettGroupHeaderComponent,
  TopBarComponent,
} from '../design-system';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MIconComponent,
    SettRowComponent,
    SettGroupComponent,
    SettGroupHeaderComponent,
    TopBarComponent,
  ],
  template: `
    <!-- NotificationsScreen — absorbs cadence + checkbox logic from old SettingsComponent -->
    <div style="background:#F3F1ED;min-height:100%;display:flex;flex-direction:column" data-testid="settings-notifications-page">

      <mm-top-bar title="Notifications" [showBack]="true" backAriaLabel="Back to settings" (onBack)="back()"></mm-top-bar>

      <div style="flex:1;overflow:auto;padding-bottom:48px">

        <!-- Enable toggle -->
        <mm-sett-group>
          <mm-sett-row
            icon="bell"
            label="Enable notifications"
            [toggle]="notificationsEnabled"
            (onToggle)="onToggleNotifications($event)"
            [chevron]="false"
            [last]="true">
          </mm-sett-row>
        </mm-sett-group>

        <!-- Delivery group — only shown when enabled -->
        <ng-container *ngIf="notificationsEnabled">
          <mm-sett-group-header></mm-sett-group-header>
          <mm-sett-group>
            <!-- TODO(backend): wire digestCadence to preferences endpoint when available -->
            <!-- UI is rendered with local state only until then -->
            <mm-sett-row
              icon="mail"
              label="Digest cadence"
              [value]="digestCadence"
              (onClick)="cycleDigest()">
            </mm-sett-row>
            <mm-sett-row
              icon="at"
              label="Mentions"
              [toggle]="notifyMentions"
              (onToggle)="notifyMentions = $event"
              [chevron]="false">
            </mm-sett-row>
            <mm-sett-row
              icon="bell"
              label="Board activity"
              [toggle]="notifyBoards"
              (onToggle)="notifyBoards = $event"
              [chevron]="false">
            </mm-sett-row>
            <mm-sett-row
              icon="shield"
              label="Moderation events"
              [toggle]="notifyModeration"
              (onToggle)="notifyModeration = $event"
              [chevron]="false"
              [last]="true">
            </mm-sett-row>
          </mm-sett-group>
        </ng-container>

      </div>
    </div>
  `,
})
export class SettingsNotificationsComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly data = inject(SocialDataService);

  // TODO(backend): wire all fields to notifications preferences endpoint when available
  // UI is rendered with local state only until then
  notificationsEnabled = true;
  digestCadence: 'Instant' | 'Daily' | 'Weekly' = 'Daily';
  notifyMentions = true;
  notifyBoards = true;
  notifyModeration = true;

  ngOnInit(): void {
    const prefs = this.data.settingsViewModel().preferences;
    this.notificationsEnabled = prefs.notificationsEnabled;
    this.digestCadence = prefs.digestCadence;
  }

  onToggleNotifications(val: boolean): void {
    this.notificationsEnabled = val;
  }

  cycleDigest(): void {
    const cycle: Array<'Instant' | 'Daily' | 'Weekly'> = ['Instant', 'Daily', 'Weekly'];
    const idx = cycle.indexOf(this.digestCadence);
    this.digestCadence = cycle[(idx + 1) % cycle.length];
  }

  back(): void {
    this.router.navigateByUrl('/settings');
  }
}
