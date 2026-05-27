import type { ServerProfile, ServerProfileUpdate, UiProfile } from './types';

export function toUiProfile(raw: ServerProfile): UiProfile {
  const username = String(raw.username ?? '').trim();

  return {
    username,
    handle: username ? `@${username}` : '@unknown',
    displayName: raw.displayName || username,
    bio: raw.bio || '',
    title: raw.title || '',
    location: raw.location || '',
  };
}

export function toServerProfileUpdate(patch: Partial<UiProfile>): ServerProfileUpdate {
  return {
    displayName: patch.displayName?.trim() || patch.username?.trim() || '',
    title: patch.title?.trim() || '',
    location: patch.location?.trim() || '',
    bio: patch.bio?.trim() || '',
  };
}
