import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { SocialDataService } from '../social-data.service';
import { SessionService } from '../session.service';
import { MIconComponent, StateBlockComponent, TopBarComponent, ToggleComponent, SettGroupComponent, SettGroupHeaderComponent } from '../design-system';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MIconComponent, StateBlockComponent, TopBarComponent, ToggleComponent, SettGroupComponent, SettGroupHeaderComponent],
  styles: [`
    .mr-rule-row {
      padding: 12px 16px; display: flex; align-items: center; gap: 12px;
      position: relative; background: #fff;
    }
    .mr-add-row {
      padding: 12px 16px; display: flex; align-items: center; gap: 10px; background: #fff;
    }
    .mr-add-row input, .mr-add-row select {
      flex: 1; min-width: 0; border: none; background: var(--mm-bg-chip);
      border-radius: 8px; padding: 8px 10px; font-size: 14px; color: var(--mm-label);
      outline: none;
    }
    .mr-add-row button {
      padding: 11px 22px; border-radius: 22px; border: none; cursor: pointer;
      font-size: 15px; font-weight: 600; background: var(--mm-gold-grad); color: #fff;
      flex-shrink: 0;
    }
    .mr-add-row button:disabled { opacity: 0.4; cursor: not-allowed; }
    .mr-divider { position: absolute; bottom: 0; left: 33px; right: 0; height: 0.5px; background: var(--mm-sep); }
  `],
  template: `
    <div data-testid="rules-page">

      <mm-top-bar title="Moderation rules" [large]="true" [showBack]="true" (onBack)="goBack()">
        <div trailing style="width:36px;height:36px;border-radius:50%;background:rgba(0,0,0,0.06);display:flex;align-items:center;justify-content:center;cursor:pointer">
          <m-icon name="plus" [size]="18"></m-icon>
        </div>
      </mm-top-bar>

      <state-block *ngIf="isLoading"
        mode="loading" title="Loading moderation rules"
        body="Checking the rules engine, active keywords, and post moderation totals.">
      </state-block>

      <state-block *ngIf="!isLoading && loadError"
        mode="error" title="Could not load moderation rules" [body]="loadError">
      </state-block>

      <ng-container *ngIf="!isLoading && !loadError">

        <!-- Engine status banner -->
        <div style="margin:0 16px 16px;background:rgba(79,143,95,0.12);border-radius:14px;padding:14px;display:flex;align-items:center;gap:12px">
          <div style="width:36px;height:36px;border-radius:10px;background:rgba(79,143,95,0.2);color:#4F8F5F;display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <m-icon name="shield" [size]="20"></m-icon>
          </div>
          <div style="flex:1;min-width:0">
            <div style="font-size:15px;font-weight:600;color:var(--mm-label)">Engine running</div>
            <div style="font-size:13px;color:var(--mm-label-secondary)">
              {{ activeRules }} of {{ rules.length }} rules active · {{ pending }} pending posts
            </div>
          </div>
          <m-icon name="chev-r" [size]="16" color="var(--mm-label-tertiary)"></m-icon>
        </div>

        <!-- Active rules -->
        <mm-sett-group-header action="Edit">Active rules</mm-sett-group-header>
        <mm-sett-group>
          <div *ngFor="let rule of rules; let last = last" class="mr-rule-row"
            [attr.data-testid]="'rule-' + rule.id">
            <div style="width:5px;height:32px;border-radius:3px;flex-shrink:0"
              [style.background]="levelColor(rule.riskLevel)"></div>
            <div style="flex:1;min-width:0">
              <div style="font-size:16px;font-weight:500;color:var(--mm-label)">{{ rule.keyword }}</div>
              <div style="font-size:13px;color:var(--mm-label-secondary)">
                {{ rule.riskLevel }} · {{ rule.active ? 'Active' : 'Inactive' }}
              </div>
            </div>
            <mm-toggle [on]="rule.active" (onChange)="toggle(rule.id)"></mm-toggle>
            <div *ngIf="!last" class="mr-divider"></div>
          </div>

          <div *ngIf="!rules.length" style="padding:20px 16px;text-align:center;color:var(--mm-label-secondary);font-size:14px">
            No rules yet — add the first keyword below
          </div>
        </mm-sett-group>

        <!-- Add rule form -->
        <mm-sett-group-header>Add keyword rule</mm-sett-group-header>
        <mm-sett-group>
          <form [formGroup]="form" (ngSubmit)="createRule()" data-testid="create-rule-form">
            <div class="mr-add-row">
              <input type="text" formControlName="keyword" aria-label="Keyword" placeholder="Keyword…">
              <select formControlName="riskLevel" aria-label="Risk level">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
              <button type="submit" [disabled]="form.invalid || !session.canModerateKeywords()">Save</button>
            </div>
          </form>
        </mm-sett-group>

      </ng-container>

    </div>
  `,
})
export class ReportsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly data = inject(SocialDataService);
  readonly session = inject(SessionService);
  readonly form = this.fb.nonNullable.group({
    keyword: ['', Validators.required],
    riskLevel: ['Low' as 'Low' | 'Medium' | 'High', Validators.required],
  });
  isLoading = true;
  loadError = '';

  get rules() { return this.data.keywordRules(); }
  get activeRules(): number { return this.rules.filter((rule) => rule.active).length; }
  get totalPosts(): number { return this.data.summary().totalPosts; }
  get published(): number { return this.data.summary().published; }
  get pending(): number { return this.data.summary().pending; }
  get rejected(): number { return this.data.summary().rejected; }

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.isLoading = true;
    this.loadError = '';
    this.data.refreshWorkspace({ posts: true, rules: true }).subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.loadError = 'Please retry after the rules workspace reconnects.';
      },
    });
  }

  createRule(): void {
    if (this.form.invalid) return;
    this.data.createKeywordRule(this.form.getRawValue()).subscribe(() => {
      this.form.reset({ keyword: '', riskLevel: 'Low' });
    });
  }

  goBack(): void {
    window.history.back();
  }

  toggle(id: number): void {
    this.data.toggleKeywordRule(id).subscribe();
  }

  levelColor(riskLevel: string): string {
    if (riskLevel === 'High') return '#C44545';
    if (riskLevel === 'Medium') return '#C9A961';
    if (riskLevel === 'Low') return '#7AA5C4';
    return '#A5A5A5';
  }
}
