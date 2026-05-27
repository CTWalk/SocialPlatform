export interface BoardDefinition {
  slug: string;
  name: string;
  members: string;
  summary: string;
  cadence: string;
  owner: string;
}

export const BOARD_CATALOG: BoardDefinition[] = [
  {
    slug: 'all-company',
    name: 'all-company',
    members: '312 members',
    summary: 'Announcements and cross-team updates.',
    cadence: 'Daily',
    owner: 'Communications',
  },
  {
    slug: 'engineering',
    name: 'engineering',
    members: '87 members',
    summary: 'Deploys, incidents, RFCs, and release notes.',
    cadence: 'Hourly',
    owner: 'Platform',
  },
  {
    slug: 'design',
    name: 'design',
    members: '28 members',
    summary: 'Design system, critique, and brand changes.',
    cadence: 'Weekly',
    owner: 'Design Ops',
  },
  {
    slug: 'people-ops',
    name: 'people-ops',
    members: '19 members',
    summary: 'Benefits, policy, and survey communication.',
    cadence: 'Weekly',
    owner: 'People Ops',
  },
];

export function boardLabel(slug: string): string {
  return BOARD_CATALOG.find((board) => board.slug === slug)?.name ?? slug;
}
