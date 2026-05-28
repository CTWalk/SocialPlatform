import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';
import { Role, SessionService } from '../session.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-shell">
      <section class="login-card">
        <div class="login-brand-mark">
          <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="18" fill="currentColor"/>
          </svg>
        </div>
        <h1>Social Platform</h1>
        <p>Sign in with your work identity to explore the feed, review queue, and role-based moderation.</p>
        <form [formGroup]="form" class="login-form" (ngSubmit)="submit()">
          <label>
            Username
            <input type="text" formControlName="username" aria-label="Username" placeholder="your.name">
          </label>
          <label>
            Demo role
            <select formControlName="role" aria-label="Role">
              <option *ngFor="let role of roles" [ngValue]="role">{{ role }}</option>
            </select>
          </label>
          <button type="submit" class="button primary full">Sign in</button>
        </form>
        <div class="login-footer-note">By signing in you agree to the company communication policy.</div>
      </section>
    </div>
  `,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private session = inject(SessionService);
  private router = inject(Router);
  private api = inject(ApiService);
  roles: Role[] = ['Administrator', 'Moderator', 'Auditor', 'Reviewer', 'Approver', 'Member', 'Viewer'];
  form = this.fb.nonNullable.group({ username: ['mia.chen', Validators.required], role: ['Member' as Role, Validators.required] });

  constructor() {
    if (this.session.activeUser()) {
      this.router.navigateByUrl('/dashboard');
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    const { username, role } = this.form.getRawValue();
    this.api.login(username, role).subscribe((result) => {
      this.session.login(result.user, result.role, result.sessionId);
      this.router.navigateByUrl('/dashboard');
    });
  }
}
