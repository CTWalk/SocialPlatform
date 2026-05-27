import { Component, Input, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'm-icon',
  standalone: true,
  template: `<span class="m-icon" [style.width.px]="size" [style.height.px]="size" [innerHTML]="svg()"></span>`,
  styles: [`
    :host { display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .m-icon { display: inline-flex; align-items: center; justify-content: center; }
  `],
})
export class MIconComponent {
  @Input() name = '';
  @Input() size = 22;
  @Input() color = 'currentColor';
  @Input() weight = 1.8;
  @Input() filled = false;

  private readonly sanitizer = inject(DomSanitizer);

  svg(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.render());
  }

  private render(): string {
    const s = this.size;
    const c = this.color;
    const w = this.weight;
    const sk = `stroke="${c}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
    const fi = `fill="${c}"`;
    const n = this.filled ? `${this.name}-fill` : this.name;

    const map: Record<string, string> = {
      // ── Navigation ──────────────────────────────────────────
      'mammoth-logo': `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 64 64"><path d="M 12 44 C 12 20, 20 16, 24 22 C 27 27, 24 36, 20 38 C 16 40, 14 36, 18 32 C 22 28, 30 26, 32 32 C 34 38, 30 44, 24 44 M 32 32 C 34 26, 42 26, 46 32 C 50 38, 46 40, 42 38 C 38 36, 35 27, 38 22 C 42 16, 50 20, 50 44" stroke="${c}" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      // home — reference name (alias for house)
      'home':         `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-7h-6v7H4a1 1 0 01-1-1v-9z" ${sk}/></svg>`,
      'home-fill':    `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-7h-6v7H4a1 1 0 01-1-1v-9z" ${fi}/></svg>`,
      'house':        `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-7h-6v7H4a1 1 0 01-1-1v-9z" ${sk}/></svg>`,
      'house-fill':   `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-7h-6v7H4a1 1 0 01-1-1v-9z" ${fi}/></svg>`,
      'dashboard':    `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-7h-6v7H4a1 1 0 01-1-1v-9z" ${sk}/></svg>`,
      'feed':         `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M4 12c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8c-1.2 0-2.4-.3-3.5-.8L4 21l1-4.5C4.4 15.2 4 13.6 4 12z" ${sk}/></svg>`,
      'bubble':       `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M4 12c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8c-1.2 0-2.4-.3-3.5-.8L4 21l1-4.5C4.4 15.2 4 13.6 4 12z" ${sk}/></svg>`,
      'bubble-fill':  `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M4 12c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8c-1.2 0-2.4-.3-3.5-.8L4 21l1-4.5C4.4 15.2 4 13.6 4 12z" ${fi}/></svg>`,
      'search':       `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" ${sk}/><path d="M16.5 16.5L21 21" ${sk}/></svg>`,
      'activity':     `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5" ${sk}/><path d="M10 17a2 2 0 004 0" ${sk}/></svg>`,
      'bell':         `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M6 9a6 6 0 0112 0v5l2 3H4l2-3V9zM10 20a2 2 0 004 0" ${sk}/></svg>`,
      'bell-fill':    `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M6 9a6 6 0 0112 0v5l2 3H4l2-3V9zM10 20a2 2 0 004 0" ${fi}/></svg>`,
      // at — reference name
      'at':           `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" ${sk}/><path d="M16 8v5a3 3 0 006 0v-1a10 10 0 10-4 8" ${sk}/></svg>`,
      // ── People ──────────────────────────────────────────────
      'person':       `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" ${sk}/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" ${sk}/></svg>`,
      'person-fill':  `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" ${fi}/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" ${fi}/></svg>`,
      'profile':      `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" ${sk}/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" ${sk}/></svg>`,
      'people':       `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><circle cx="9" cy="9" r="3" ${sk}/><circle cx="17" cy="10" r="2.5" ${sk}/><path d="M3 19a6 6 0 0112 0M15 19a4 4 0 016-3.5" ${sk}/></svg>`,
      'user-group':   `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><circle cx="9" cy="9" r="3.2" ${sk}/><circle cx="17" cy="10" r="2.6" ${sk}/><path d="M3 19c0-3.3 2.7-6 6-6s6 2.7 6 6" ${sk}/><path d="M15 19c0-2 .9-3.8 2.3-5 2.3.4 3.7 2.6 3.7 5" ${sk}/></svg>`,
      // ── Moderation ──────────────────────────────────────────
      'review':       `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M12 3l8 3v6c0 4.5-3.3 8.5-8 9-4.7-.5-8-4.5-8-9V6l8-3z" ${sk}/><path d="M8.5 12l2.5 2.5L16 9.5" ${sk}/></svg>`,
      'shield':       `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M12 3l8 3v6c0 4.5-3.3 8.5-8 9-4.7-.5-8-4.5-8-9V6l8-3z" ${sk}/></svg>`,
      'shield-fill':  `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M12 3l8 3v6c0 4.5-3.3 8.5-8 9-4.7-.5-8-4.5-8-9V6l8-3z" ${fi}/><path d="M8.5 12l2.5 2.5L16 9.5" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      'rules':        `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M3 5h18M6 12h12M10 19h4" ${sk}/></svg>`,
      'flag':         `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M5 21V4h11l-1.5 4L16 12H5" ${sk}/></svg>`,
      'flag-fill':    `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M5 21V4h11l-1.5 4L16 12H5" ${fi} stroke="${c}" stroke-width="${w}" stroke-linejoin="round"/></svg>`,
      'eye':          `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" ${sk}/><circle cx="12" cy="12" r="3" ${sk}/></svg>`,
      'warning':      `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M12 3l10 18H2L12 3z" ${sk}/><path d="M12 10v5M12 18.5v.01" ${sk}/></svg>`,
      // ── Engagement ──────────────────────────────────────────
      'heart':        `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z" ${sk}/></svg>`,
      'heart-fill':   `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z" ${fi}/></svg>`,
      'reply':        `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" ${sk}/></svg>`,
      'repost':       `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M5 10V8a2 2 0 012-2h8M3 12l2-2 2 2M19 14v2a2 2 0 01-2 2H9M21 12l-2 2-2-2" ${sk}/></svg>`,
      'bookmark':     `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M6 3h12v18l-6-4-6 4V3z" ${sk}/></svg>`,
      'bookmark-fill': `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M6 3h12v18l-6-4-6 4V3z" ${fi}/></svg>`,
      'share':        `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M12 3v13M7 8l5-5 5 5M5 14v5a1 1 0 001 1h12a1 1 0 001-1v-5" ${sk}/></svg>`,
      'star':         `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M12 3l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6z" ${sk}/></svg>`,
      'star-fill':    `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M12 3l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6z" ${fi}/></svg>`,
      // ── UI Controls ─────────────────────────────────────────
      'plus':         `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" ${sk}/></svg>`,
      'plus-circle':  `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.5" ${sk}/><path d="M12 8v8M8 12h8" ${sk}/></svg>`,
      'close':        `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" ${sk}/></svg>`,
      'check':        `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" ${sk}/></svg>`,
      // chevron aliases — reference names
      'chev-r':       `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" ${sk}/></svg>`,
      'chev-l':       `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6" ${sk}/></svg>`,
      'chev-d':       `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" ${sk}/></svg>`,
      'chevron':      `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" ${sk}/></svg>`,
      'chevron-left': `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6" ${sk}/></svg>`,
      'chevron-down': `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" ${sk}/></svg>`,
      // dots — reference uses filled circles
      'dots':         `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><circle cx="5.5" cy="12" r="1.5" fill="${c}"/><circle cx="12" cy="12" r="1.5" fill="${c}"/><circle cx="18.5" cy="12" r="1.5" fill="${c}"/></svg>`,
      // ── Composer toolbar icons ───────────────────────────────
      'image':        `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2" ${sk}/><circle cx="8.5" cy="9" r="1.5" ${sk}/><path d="M3 17l5-5 4 4 3-3 6 6" ${sk}/></svg>`,
      'gif':          `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="12" rx="2" ${sk}/><text x="12" y="15" text-anchor="middle" font-size="6" font-weight="700" fill="${c}" stroke="none">GIF</text></svg>`,
      'poll':         `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M5 19V12M12 19V5M19 19v-9" ${sk} stroke-width="2.2"/></svg>`,
      'lang':         `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M3 5h12M9 3v2M5 5c0 5 5 9 10 9M14 14L8 8" ${sk}/><path d="M13 20l4-9 4 9M14.5 17h5" ${sk}/></svg>`,
      'edit':         `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M4 20h4l12-12-4-4L4 16v4z M14 6l4 4" ${sk}/></svg>`,
      // ── Content type icons ───────────────────────────────────
      'filter':       `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M3 5h18M6 12h12M10 19h4" ${sk} stroke-width="2.2"/></svg>`,
      'hash':         `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M5 9h14M5 15h14M10 4l-2 16M16 4l-2 16" ${sk}/></svg>`,
      'paint':        `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M4 4h14v6H4z M11 10v3M9 13h4v3a2 2 0 11-4 0v-3z" ${sk}/></svg>`,
      'mute':         `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M4 12c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8c-1.2 0-2.4-.3-3.5-.8L4 21l1-4.5C4.4 15.2 4 13.6 4 12zM4 4l16 16" ${sk}/></svg>`,
      'block':        `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" ${sk}/><path d="M5 5l14 14" ${sk}/></svg>`,
      'globe':        `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" ${sk}/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" ${sk}/></svg>`,
      'card':         `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="13" rx="2" ${sk}/><path d="M3 10h18" ${sk}/></svg>`,
      'info':         `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" ${sk}/><path d="M12 11v5M12 8v.01" ${sk}/></svg>`,
      'link':         `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M10 14l4-4M9 9L7 11a3 3 0 004 4l1-1M13 13l2-2a3 3 0 00-4-4l-1 1" ${sk}/></svg>`,
      'pin':          `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M12 3l5 5-2 2v6l-3-3-3 3v-6L7 8l5-5z" ${sk}/></svg>`,
      'list':         `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h10" ${sk}/></svg>`,
      // arrow-r — reference name (alias for arrow-right)
      'arrow-r':      `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" ${sk}/></svg>`,
      'arrow-right':  `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" ${sk}/></svg>`,
      // ── Settings / app-specific ──────────────────────────────
      'app-icon':     `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><rect x="3" y="3" width="8" height="8" rx="2" ${sk}/><rect x="13" y="3" width="8" height="8" rx="2" ${sk}/><rect x="3" y="13" width="8" height="8" rx="2" ${sk}/><rect x="13" y="13" width="8" height="8" rx="2" ${sk}/></svg>`,
      'composer':     `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M4 4h11l5 5v11H4V4z M14 4v5h5" ${sk}/></svg>`,
      'sound':        `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4zM17 8a5 5 0 010 8M20 5a9 9 0 010 14" ${sk}/></svg>`,
      'siri':         `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" ${sk}/><circle cx="12" cy="12" r="7" ${sk}/></svg>`,
      // mail — reference name (alias for envelope)
      'mail':         `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2" ${sk}/><path d="M3 7l9 6 9-6" ${sk}/></svg>`,
      'envelope':     `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2" ${sk}/><path d="M3 7l9 6 9-6" ${sk}/></svg>`,
      'trash':        `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" ${sk}/></svg>`,
      // ── System ──────────────────────────────────────────────
      'settings':     `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" ${sk}/><path d="M19.4 15a1.8 1.8 0 00.4 2l.1.1a2 2 0 01-2.8 2.8l-.1-.1a1.8 1.8 0 00-2-.4 1.8 1.8 0 00-1 1.6V21a2 2 0 01-4 0v-.2a1.8 1.8 0 00-1-1.6 1.8 1.8 0 00-2 .4l-.1.1a2 2 0 01-2.8-2.8l.1-.1a1.8 1.8 0 00.4-2 1.8 1.8 0 00-1.6-1H3a2 2 0 010-4h.2a1.8 1.8 0 001.6-1 1.8 1.8 0 00-.4-2l-.1-.1a2 2 0 012.8-2.8l.1.1a1.8 1.8 0 002 .4h.1a1.8 1.8 0 001-1.6V3a2 2 0 014 0v.2a1.8 1.8 0 001 1.6 1.8 1.8 0 002-.4l.1-.1a2 2 0 012.8 2.8l-.1.1a1.8 1.8 0 00-.4 2v.1a1.8 1.8 0 001.6 1H21a2 2 0 010 4h-.2a1.8 1.8 0 00-1.6 1z" ${sk}/></svg>`,
      'gear':         `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" ${sk}/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" ${sk}/></svg>`,
      'logout':       `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M14 8V5a1 1 0 00-1-1H5a1 1 0 00-1 1v14a1 1 0 001 1h8a1 1 0 001-1v-3M9 12h12M17 8l4 4-4 4" ${sk}/></svg>`,
      'lock':         `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="11" rx="2" ${sk}/><path d="M8 10V7a4 4 0 018 0v3" ${sk}/></svg>`,
      'sliders':      `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M4 7h10M18 7h2M4 17h2M10 17h10" ${sk}/><circle cx="16" cy="7" r="2.2" ${sk}/><circle cx="8" cy="17" r="2.2" ${sk}/></svg>`,
      'chart':        `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M4 20V8M10 20V4M16 20v-7M22 20H2" ${sk}/></svg>`,
      'doc':          `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M6 3h9l4 4v14a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z" ${sk}/><path d="M14 3v5h5" ${sk}/></svg>`,
      'sparkle':      `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6zM19 14l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" ${fi}/></svg>`,
      'refresh':      `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path d="M20 8A9 9 0 104.93 18.36" ${sk}/><path d="M20 2v6h-6" ${sk}/></svg>`,
    };

    return map[n] ?? map[this.name] ?? `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" ${sk}/></svg>`;
  }
}
