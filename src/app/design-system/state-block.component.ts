import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MIconComponent } from './m-icon.component';

@Component({
  selector: 'state-block',
  standalone: true,
  imports: [CommonModule, MIconComponent],
  template: `
    <section class="state-block" [class.compact]="compact">
      <div class="state-block-icon" [class.loading]="mode === 'loading'">
        <m-icon [name]="iconName()" [size]="26" [color]="iconColor()"></m-icon>
      </div>
      <div class="state-block-copy">
        <strong>{{ title }}</strong>
        <p>{{ body }}</p>
      </div>
    </section>
  `,
})
export class StateBlockComponent {
  @Input() mode: 'loading' | 'error' | 'empty' = 'empty';
  @Input() title = '';
  @Input() body = '';
  @Input() compact = false;

  iconName(): string {
    if (this.mode === 'loading') return 'refresh';
    if (this.mode === 'error') return 'close';
    return 'sparkle';
  }

  iconColor(): string {
    if (this.mode === 'loading') return 'var(--muted)';
    if (this.mode === 'error') return 'var(--danger)';
    return 'var(--muted-soft)';
  }
}
