import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SocialDataService } from '../social-data.service';
import { TopBarComponent } from '../design-system';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TopBarComponent],
  template: `
    <!-- EditProfileDetails — reference-mobile-2.jsx legacy reference -->
    <div style="background:#F3F1ED;min-height:100%;display:flex;flex-direction:column" data-testid="profile-edit-details-page">

      <sp-top-bar title="Edit Details" [showBack]="true" backAriaLabel="Back to profile" (onBack)="cancel()">
        <div trailing
          (click)="save()"
          style="font-size:16px;font-weight:600;color:#1A1A1A;cursor:pointer;padding:4px 2px"
          [style.opacity]="form.invalid || saving ? 0.4 : 1">
          Done
        </div>
      </sp-top-bar>

      <div style="flex:1;overflow:auto;padding:8px 0 48px">

        <form [formGroup]="form" (ngSubmit)="save()">

          <!-- Display name field -->
          <div style="background:#fff;margin:8px 16px;border-radius:14px;padding:14px">
            <div style="font-size:12px;color:#6E6E6E;margin-bottom:4px">Display name</div>
            <input
              formControlName="displayName"
              type="text"
              placeholder="Your display name"
              style="width:100%;font-size:17px;color:#1A1A1A;border:none;outline:none;background:transparent;padding:0;box-sizing:border-box">
          </div>

          <!-- Bio field -->
          <div style="background:#fff;margin:8px 16px;border-radius:14px;padding:14px;min-height:130px">
            <div style="font-size:12px;color:#6E6E6E;margin-bottom:4px">Bio</div>
            <textarea
              formControlName="bio"
              placeholder="Tell people about yourself"
              rows="5"
              style="width:100%;font-size:17px;color:#1A1A1A;border:none;outline:none;background:transparent;padding:0;resize:none;box-sizing:border-box;line-height:1.4;font-family:inherit"></textarea>
          </div>

        </form>

        <div *ngIf="saveError"
          style="margin:0 16px;padding:12px 16px;background:rgba(211,74,74,0.1);border-radius:12px;font-size:14px;color:#D34A4A">
          {{ saveError }}
        </div>

      </div>
    </div>
  `,
})
export class ProfileEditDetailsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly data = inject(SocialDataService);
  private readonly router = inject(Router);

  saving = false;
  saveError = '';

  readonly form = this.fb.nonNullable.group({
    displayName: ['', Validators.required],
    bio: [''],
  });

  ngOnInit(): void {
    const profile = this.data.userProfile();
    this.form.reset({
      displayName: profile.displayName,
      bio: profile.bio,
    });
  }

  save(): void {
    if (this.form.invalid || this.saving) return;
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
}
