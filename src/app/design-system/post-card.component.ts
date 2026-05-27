import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';
import { AvComponent } from './av.component';
import { MIconComponent } from './m-icon.component';

export interface Post {
  id: string;
  author: string;
  handle?: string;
  time: string;
  body?: string;
  mammoth?: boolean;
  verified?: boolean;
  replies?: number;
  boardSlug?: string;
  visibility?: 'Public' | 'Company';
}

@Component({
  selector: 'mm-post-card',
  standalone: true,
  imports: [NgIf, AvComponent, MIconComponent],
  template: `
    <div style="padding:14px 16px;position:relative;border-bottom:0.5px solid rgba(0,0,0,0.05)">
      <div style="display:flex;gap:12px">
        <av [name]="post.author" [mammoth]="post.mammoth ?? false" [size]="40"></av>
        <div style="flex:1;min-width:0">

          <!-- header -->
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
            <span style="font-size:16px;font-weight:600;letter-spacing:-0.2px">{{ post.author }}</span>
            <span *ngIf="post.handle" style="font-size:14px;color:#6E6E6E">{{ post.handle }}</span>
            <span *ngIf="post.verified" style="color:#C9A961;display:flex">
              <m-icon name="check" [size]="14" [weight]="2.5"></m-icon>
            </span>
            <span style="margin-left:auto;font-size:15px;color:#6E6E6E;flex-shrink:0">{{ post.time }}</span>
          </div>

          <!-- body -->
          <div *ngIf="post.body"
            style="font-size:16px;line-height:1.4;color:#1A1A1A;letter-spacing:-0.1px;margin-top:6px;white-space:pre-wrap;word-break:break-word">
            {{ post.body }}
          </div>

          <!-- actions: reply count + overflow only (E4: heart/repost removed — no backend endpoints) -->
          <div style="margin-top:10px;display:flex;align-items:center;gap:28px;color:#6E6E6E">
            <span style="display:flex;align-items:center;gap:5px">
              <m-icon name="bubble" [size]="18" [weight]="1.8"></m-icon>
              <span *ngIf="post.replies" style="font-size:14px">{{ post.replies }}</span>
            </span>
            <m-icon name="dots" [size]="18"></m-icon>
          </div>

        </div>
      </div>
    </div>
  `,
})
export class PostCardComponent {
  @Input() post!: Post;
  @Input() compact = false;
}
