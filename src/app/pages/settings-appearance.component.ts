import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  AvComponent,
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
    AvComponent,
    MIconComponent,
    SettRowComponent,
    SettGroupComponent,
    SettGroupHeaderComponent,
    TopBarComponent,
  ],
  template: `
    <!-- AppearanceScreen — mammoth-mobile-3.jsx reference -->
    <div style="background:#F3F1ED;min-height:100%;display:flex;flex-direction:column">

      <mm-top-bar title="Appearance" [showBack]="true" (onBack)="back()"></mm-top-bar>

      <div style="flex:1;overflow:auto;padding-bottom:48px">

        <!-- Live preview post card -->
        <div style="margin:8px 16px 4px;background:#fff;border-radius:14px;padding:14px">
          <div style="display:flex;gap:10px">
            <av name="Jsmith" [size]="32"></av>
            <div style="flex:1;min-width:0">
              <div style="display:flex;align-items:center;gap:6px">
                <span style="font-size:14px;font-weight:600">Jsmith</span>
                <span style="margin-left:auto;font-size:13px;color:#6E6E6E">5m</span>
              </div>
              <div [style.font-size.px]="14 + textSizeOffset"
                style="color:#1A1A1A;margin-top:4px;line-height:1.4">
                Example post preview showing what these changes will look like on your feed. 🐘
              </div>
              <div style="font-size:13px;color:#6E6E6E;margin-top:8px">8.0K Likes · 3 Reposts · 20 Replies</div>
            </div>
          </div>
        </div>

        <!-- Text Size slider row -->
        <mm-sett-group style="margin-top:16px">
          <div style="padding:12px 16px;position:relative">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
              <m-icon name="image" [size]="20"></m-icon>
              <div style="flex:1;font-size:17px;color:#1A1A1A">Text Size</div>
              <div style="font-size:14px;color:#6E6E6E">
                System {{ textSizeOffset >= 0 ? '+' : '' }}{{ textSizeOffset }}
              </div>
            </div>
            <!-- Slider track -->
            <div style="position:relative;height:4px;background:rgba(0,0,0,0.08);border-radius:2px"
              (click)="onSliderClick($event)">
              <div style="position:absolute;left:0;top:0;bottom:0;background:#1A1A1A;border-radius:2px"
                [style.width]="sliderPct + '%'"></div>
              <div style="position:absolute;top:-11px;width:26px;height:26px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,0.25),0 4px 8px rgba(0,0,0,0.1)"
                [style.left]="'calc(' + sliderPct + '% - 13px)'"></div>
            </div>
          </div>
        </mm-sett-group>

        <!-- Display settings group -->
        <mm-sett-group-header></mm-sett-group-header>
        <mm-sett-group>
          <!-- TODO(backend): wire all fields to appearance preferences endpoint when available -->
          <!-- UI persists to localStorage only until then (decisions.md §C2) -->
          <mm-sett-row icon="paint"   label="Theme"                    [value]="theme"          (onClick)="cycleTheme()"></mm-sett-row>
          <mm-sett-row icon="person"  label="Circle profile icons"     [toggle]="circleIcons"   (onToggle)="setCircleIcons($event)"   [chevron]="false"></mm-sett-row>
          <mm-sett-row icon="warning" label="Content warning overlays" [toggle]="cwOverlays"    (onToggle)="setCwOverlays($event)"    [chevron]="false"></mm-sett-row>
          <mm-sett-row icon="warning" label="Blur sensitive content"   [toggle]="blurSensitive" (onToggle)="setBlurSensitive($event)" [chevron]="false"></mm-sett-row>
          <mm-sett-row icon="gif"     label="Auto-play videos & GIFs"  [toggle]="autoPlay"      (onToggle)="setAutoPlay($event)"      [chevron]="false" [last]="true"></mm-sett-row>
        </mm-sett-group>

      </div>
    </div>
  `,
})
export class SettingsAppearanceComponent implements OnInit {
  private readonly router = inject(Router);

  // TODO(backend): wire all fields to appearance preferences endpoint when available
  // Persists to localStorage only until then (decisions.md §C2)
  textSizeOffset = 0;
  theme: 'System' | 'Light' | 'Dark' = 'System';
  circleIcons = true;
  cwOverlays = true;
  blurSensitive = true;
  autoPlay = true;

  readonly sliderMin = -6;
  readonly sliderMax = 6;

  get sliderPct(): number {
    return ((this.textSizeOffset - this.sliderMin) / (this.sliderMax - this.sliderMin)) * 100;
  }

  ngOnInit(): void {
    const stored = localStorage.getItem('mm.textSize');
    if (stored !== null) {
      const n = parseInt(stored, 10);
      if (!isNaN(n)) this.textSizeOffset = Math.max(this.sliderMin, Math.min(this.sliderMax, n));
    }
    const storedTheme = localStorage.getItem('mm.theme');
    if (storedTheme === 'Light' || storedTheme === 'Dark' || storedTheme === 'System') {
      this.theme = storedTheme;
    }
    this.circleIcons    = localStorage.getItem('mm.circleAvatars')   !== 'false';
    this.cwOverlays     = localStorage.getItem('mm.contentWarnings') !== 'false';
    this.blurSensitive  = localStorage.getItem('mm.blurSensitive')   !== 'false';
    this.autoPlay       = localStorage.getItem('mm.autoplay')        !== 'false';
    this.applyAll();
  }

  onSliderClick(e: MouseEvent): void {
    const target = e.currentTarget as HTMLElement;
    const pct = e.offsetX / target.clientWidth;
    const raw = Math.round(pct * (this.sliderMax - this.sliderMin) + this.sliderMin);
    this.textSizeOffset = Math.max(this.sliderMin, Math.min(this.sliderMax, raw));
    localStorage.setItem('mm.textSize', String(this.textSizeOffset));
    document.documentElement.style.setProperty('--mm-text-scale', String(this.textSizeOffset));
  }

  cycleTheme(): void {
    const cycle: Array<'System' | 'Light' | 'Dark'> = ['System', 'Light', 'Dark'];
    this.theme = cycle[(cycle.indexOf(this.theme) + 1) % cycle.length];
    localStorage.setItem('mm.theme', this.theme);
    this.applyTheme();
  }

  setCircleIcons(val: boolean): void {
    this.circleIcons = val;
    localStorage.setItem('mm.circleAvatars', String(val));
    document.body.classList.toggle('mm-circle-avatars', val);
  }

  setCwOverlays(val: boolean): void {
    this.cwOverlays = val;
    localStorage.setItem('mm.contentWarnings', String(val));
  }

  setBlurSensitive(val: boolean): void {
    this.blurSensitive = val;
    localStorage.setItem('mm.blurSensitive', String(val));
    document.body.classList.toggle('mm-blur-sensitive', val);
  }

  setAutoPlay(val: boolean): void {
    this.autoPlay = val;
    localStorage.setItem('mm.autoplay', String(val));
  }

  private applyAll(): void {
    document.documentElement.style.setProperty('--mm-text-scale', String(this.textSizeOffset));
    this.applyTheme();
    document.body.classList.toggle('mm-circle-avatars', this.circleIcons);
    document.body.classList.toggle('mm-blur-sensitive', this.blurSensitive);
  }

  private applyTheme(): void {
    const body = document.body;
    body.removeAttribute('data-theme');
    if (this.theme === 'Light')  body.setAttribute('data-theme', 'light');
    if (this.theme === 'Dark')   body.setAttribute('data-theme', 'dark');
  }

  back(): void {
    this.router.navigateByUrl('/settings');
  }
}
