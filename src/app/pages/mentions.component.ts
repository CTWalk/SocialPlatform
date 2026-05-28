import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MIconComponent } from '../design-system';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, MIconComponent],
  template: `
    <section class="page-stack content-narrow" data-testid="mentions-page">
      <header class="page-header">
        <div class="page-title-block">
          <span class="eyebrow">Mentions</span>
          <h2>Mentions are being prepared</h2>
          <p>
            This placeholder keeps the current shell route live while the dedicated
            mentions experience is wired in a later step.
          </p>
        </div>
      </header>

      <section class="card panel-card" style="padding: 28px 24px;">
        <div style="display:flex; align-items:flex-start; gap:14px;">
          <div
            style="width:44px; height:44px; border-radius:14px; background:rgba(0,0,0,0.04); display:flex; align-items:center; justify-content:center; flex-shrink:0;"
          >
            <m-icon name="at" [size]="22" color="var(--ink)"></m-icon>
          </div>
          <div style="display:flex; flex-direction:column; gap:10px;">
            <strong style="font-size:18px; line-height:1.2;">No mentions view yet</strong>
            <p style="margin:0; color:var(--muted); line-height:1.5;">
              Activity, discover, and profile remain available while this tab is held open as a
              first-class destination in the new shell.
            </p>
            <div style="display:flex; gap:10px; flex-wrap:wrap;">
              <a routerLink="/activity" class="button secondary">Open activity</a>
              <a routerLink="/discover" class="button secondary">Open discover</a>
            </div>
          </div>
        </div>
      </section>
    </section>
  `,
})
export class MentionsComponent {}
