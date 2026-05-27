import type { ServerPost, UiPost } from './types';

export function toUiPost(raw: ServerPost): UiPost {
  const username = String(raw.author ?? '').trim();

  return {
    id: raw.id,
    author: username,
    handle: username ? `@${username}` : '@unknown',
    time: raw.createdAt,
    body: raw.content,
    replies: raw.comments?.length ?? 0,
    boardSlug: raw.boardSlug || undefined,
    visibility: raw.visibility,
  };
}
