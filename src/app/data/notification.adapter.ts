import type { ServerNotification, UiNotification } from './types';

const NOTIFICATION_KIND_TO_LABEL: Record<UiNotification['kind'], string> = {
  mention: 'mentioned you',
  invite: 'invited you',
  recommendation: 'recommended a board',
  review: 'flagged a post for review',
  status: 'updated a post status',
};

function deriveActor(raw: ServerNotification): string {
  if (raw.kind === 'recommendation') {
    return 'System';
  }

  const match = raw.summary.match(/^([^ ]+)/);
  if (match?.[1]) {
    return match[1];
  }

  const titleMatch = raw.title.match(/^([^ ]+)/);
  if (titleMatch?.[1] && !['Board', 'Review', 'Recommended'].includes(titleMatch[1])) {
    return titleMatch[1];
  }

  return 'System';
}

export function toUiNotification(raw: ServerNotification): UiNotification {
  return {
    id: raw.id,
    kind: raw.kind,
    who: deriveActor(raw),
    time: raw.createdAt,
    preview: raw.summary || undefined,
    title: raw.title || NOTIFICATION_KIND_TO_LABEL[raw.kind],
    boardSlug: raw.boardSlug ?? undefined,
    postId: raw.postId ?? undefined,
    actionable: raw.actionable,
    read: raw.read,
  };
}
