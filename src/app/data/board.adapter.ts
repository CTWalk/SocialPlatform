import type {
  ServerBoardMembership,
  ServerBoardRecommendation,
  UiBoard,
} from './types';

function normalizeRole(role: ServerBoardMembership['role'] | null | undefined): UiBoard['role'] {
  if (role === 'Owner') {
    return 'admin';
  }
  if (role === 'Member') {
    return 'member';
  }
  return undefined;
}

export function humanizeSlug(slug: string): string {
  return slug
    .split(/[-_/]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function toUiBoard(
  membership: ServerBoardMembership | null,
  recommendation: ServerBoardRecommendation | null,
): UiBoard {
  const slug = membership?.boardSlug ?? recommendation?.boardSlug ?? '';

  return {
    slug,
    name: humanizeSlug(slug),
    subscribed: Boolean(membership),
    role: normalizeRole(membership?.role),
    unread: recommendation?.pendingCount,
  };
}

export function deriveBoardCatalog(
  memberships: ServerBoardMembership[],
  recommendations: ServerBoardRecommendation[],
): UiBoard[] {
  const membershipMap = new Map(memberships.map((item) => [item.boardSlug, item]));
  const recommendationMap = new Map(recommendations.map((item) => [item.boardSlug, item]));
  const slugs = [...new Set([...membershipMap.keys(), ...recommendationMap.keys()])];

  return slugs
    .map((slug) => toUiBoard(membershipMap.get(slug) ?? null, recommendationMap.get(slug) ?? null))
    .sort((left, right) => left.name.localeCompare(right.name));
}
