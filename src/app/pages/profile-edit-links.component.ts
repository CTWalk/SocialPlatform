import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SocialDataService } from '../social-data.service';
import {
  TopBarComponent,
  SettRowComponent,
  SettGroupComponent,
  SettGroupHeaderComponent,
} from '../design-system';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TopBarComponent,
    SettRowComponent,
    SettGroupComponent,
    SettGroupHeaderComponent,
  ],
  template: `
    <!-- EditProfileLinks — reference-mobile-2.jsx legacy reference -->
    <div style="background:#F3F1ED;min-height:100%;display:flex;flex-direction:column" data-testid="profile-edit-links-page">

      <sp-top-bar title="Edit Info and Links" [showBack]="true" backAriaLabel="Back to profile" (onBack)="cancel()">
        <div trailing
          (click)="save()"
          style="font-size:16px;font-weight:600;color:#1A1A1A;cursor:pointer;padding:4px 2px"
          [style.opacity]="saving ? 0.4 : 1">
          Done
        </div>
      </sp-top-bar>

      <div style="flex:1;overflow:auto;padding:8px 0 48px">

        <form [formGroup]="form" (ngSubmit)="save()">

          <!-- Location field -->
          <div style="background:#fff;margin:8px 16px;border-radius:14px;padding:14px">
            <div style="font-size:12px;color:#6E6E6E;margin-bottom:4px">Location</div>
            <input
              formControlName="location"
              type="text"
              placeholder="Your location"
              style="width:100%;font-size:17px;color:#1A1A1A;border:none;outline:none;background:transparent;padding:0;box-sizing:border-box">
          </div>

          <!-- Title / role field -->
          <div style="background:#fff;margin:8px 16px;border-radius:14px;padding:14px">
            <div style="font-size:12px;color:#6E6E6E;margin-bottom:4px">Title</div>
            <input
              formControlName="title"
              type="text"
              placeholder="e.g. Product at Company"
              style="width:100%;font-size:17px;color:#1A1A1A;border:none;outline:none;background:transparent;padding:0;box-sizing:border-box">
          </div>

          <!-- TODO(backend): wire website + pronouns fields to profile endpoint when available -->
          <!-- UI is rendered with local state only until then -->
          <sp-sett-group-header>Pinned link</sp-sett-group-header>
          <sp-sett-group>
            <sp-sett-row icon="link" label="Add a pinned link" [last]="true" (onClick)="noop()"></sp-sett-row>
          </sp-sett-group>

        </form>

        <div *ngIf="saveError"
          style="margin:0 16px;padding:12px 16px;background:rgba(211,74,74,0.1);border-radius:12px;font-size:14px;color:#D34A4A">
          {{ saveError }}
        </div>

      </div>
    </div>
  `,
})
export class ProfileEditLinksComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly data = inject(SocialDataService);
  private readonly router = inject(Router);

  saving = false;
  saveError = '';

  readonly form = this.fb.nonNullable.group({
    location: [''],
    title: [''],
  });

  ngOnInit(): void {
    const profile = this.data.userProfile();
    this.form.reset({
      location: profile.location,
      title: profile.title,
    });
  }

  save(): void {
    if (this.saving) return;
    this.saving = true;
    this.saveError = '';
    const current = this.data.userProfile();
    const payload = { ...current, ...this.form.getRawValue() };
    this.data.updateMyProfile(payload).subscribe({
      next: () => {
        this.saving = false;
        this.router.navigateByUrl('/profile');
      },
      error: () => {
        this.saving = false;
        this.saveError = 'Could not save. Please try again.';
      },
    });
  }

  cancel(): void {
    this.router.navigateByUrl('/profile');
  }

  noop(): void {}
}
