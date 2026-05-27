export type PostStatus = 'Draft' | 'Pending Review' | 'Published' | 'Rejected';
export type RiskLevel = 'None' | 'Low' | 'Medium' | 'High';

export interface ReviewTask {
  id: number;
  postId: string;
  level: number;
  reviewerRole: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  reviewer?: string | null;
  note?: string | null;
  createdAt: string;
  reviewedAt?: string | null;
}

export interface PostComment {
  id: number;
  postId: string;
  author: string;
  comment: string;
  createdAt: string;
}

export interface SocialPost {
  id: string;
  author: string;
  content: string;
  boardSlug: string;
  visibility: 'Public' | 'Company';
  status: PostStatus;
  riskLevel: RiskLevel;
  createdAt: string;
  updatedAt: string;
  tasks?: ReviewTask[];
  comments?: PostComment[];
  matchedKeywords?: string[];
}

export interface KeywordRule {
  id: number;
  keyword: string;
  riskLevel: Exclude<RiskLevel, 'None'>;
  active: boolean;
  createdBy?: string | null;
  createdAt: string;
}

export interface PlatformUser {
  username: string;
  role: string;
  active: boolean;
}

export interface ActivityLog {
  id: string;
  action: string;
  username?: string | null;
  role?: string | null;
  postId?: string | null;
  taskId?: number | null;
  sessionId?: string | null;
  at: string;
}

export interface MentionItem {
  id: string;
  sourceType: 'post' | 'comment';
  postId: string;
  boardSlug: string;
  author: string;
  excerpt: string;
  createdAt: string;
  targetUser: string;
}

export interface InboxItem {
  id: string;
  kind: 'mention' | 'review' | 'status';
  title: string;
  summary: string;
  postId?: string | null;
  boardSlug?: string | null;
  createdAt: string;
  actionable: boolean;
}

export interface NotificationItem {
  id: string;
  kind: 'invite' | 'review' | 'mention' | 'status' | 'recommendation';
  title: string;
  summary: string;
  postId?: string | null;
  boardSlug?: string | null;
  createdAt: string;
  actionable: boolean;
  read: boolean;
}

export interface BoardMembership {
  boardSlug: string;
  role: 'Owner' | 'Member';
  joinedAt: string;
}

export interface BoardInvite {
  id: number;
  boardSlug: string;
  inviter: string;
  invitee: string;
  status: 'Pending' | 'Accepted' | 'Declined';
  createdAt: string;
}

export interface BoardRecommendation {
  boardSlug: string;
  reason: string;
  postCount: number;
  pendingCount: number;
}

export type BoardEntryState = 'Owner' | 'Joined' | 'Invited' | 'Recommended' | 'Open';

export interface BoardAccessViewModel {
  slug: string;
  role: BoardMembership['role'] | null;
  joined: boolean;
  isOwner: boolean;
  entryState: BoardEntryState;
  incomingInvite: BoardInvite | null;
  outgoingInvites: BoardInvite[];
  recommendation: BoardRecommendation | null;
}

export interface SavedSmartList {
  id: number;
  name: string;
  query: string;
  statusFilter: string;
  riskFilter: string;
  boardSlug: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  username: string;
  displayName: string;
  title: string;
  location: string;
  bio: string;
  updatedAt: string;
}

export interface UserPreferences {
  theme: 'System' | 'Light' | 'Dark';
  notificationsEnabled: boolean;
  defaultBoardSlug: string;
  digestCadence: 'Instant' | 'Daily' | 'Weekly';
  updatedAt: string;
}

export interface OnboardingState {
  profileCompleted: boolean;
  joinedBoard: boolean;
  savedSmartList: boolean;
  reviewedPost: boolean;
  updatedAt: string;
}

export interface PlatformSummary {
  totalPosts: number;
  published: number;
  pending: number;
  rejected: number;
  rules: number;
  totalUsers: number;
}

export interface HomeBoardDigestItem {
  slug: string;
  name: string;
  pendingCount: number;
  latestPostId: string | null;
}

export interface HomeViewModel {
  overview: {
    totalPosts: number;
    pendingPosts: number;
    publishedPosts: number;
    pendingReviewCount: number;
    highRiskCount: number;
    rulesCount: number;
    totalUsers: number;
  };
  reviewPreview: ReviewTask[];
  recentPosts: SocialPost[];
  joinedBoards: HomeBoardDigestItem[];
  notificationsPreview: NotificationItem[];
  onboarding: {
    progress: number;
    total: number;
    steps: Array<{ key: keyof Omit<OnboardingState, 'updatedAt'>; label: string; done: boolean }>;
  };
  nextSteps: ProductNextStep[];
}

export interface ProductNextStep {
  id: string;
  title: string;
  summary: string;
  ctaLabel: string;
  route: string;
  queryParams?: Record<string, string | number | null>;
  source: 'onboarding' | 'notification' | 'recommendation' | 'preference';
  notificationId?: string | null;
}

export interface DiscoverJourneyAction {
  id: string;
  title: string;
  summary: string;
  boardSlug: string | null;
  source: 'board-recommendation' | 'notification' | 'smart-list';
  cta: 'join-board' | 'open-board' | 'open-activity' | 'apply-smart-list';
  relatedId?: number | string | null;
  notificationId?: string | null;
  activityTab?: 'Notifications' | 'Inbox' | 'Mentions' | 'Timeline' | null;
}

export interface DiscoverJourneyViewModel {
  recommendations: BoardRecommendation[];
  savedLists: SavedSmartList[];
  actions: DiscoverJourneyAction[];
}

export interface ActivityTimelineItem {
  id: string;
  action: string;
  title: string;
  summary: string;
  postId: string | null;
  boardSlug: string | null;
  username: string | null;
  role: string | null;
  at: string;
}

export interface ActivityViewModel {
  inboxSummary: {
    review: number;
    mentions: number;
    status: number;
  };
  inboxItems: InboxItem[];
  mentions: MentionItem[];
  timeline: ActivityTimelineItem[];
  pendingTasks: ReviewTask[];
  moderationPreview: ReviewTask[];
}

export interface SettingsViewModel {
  preferences: UserPreferences;
  summary: PlatformSummary;
  joinedBoards: BoardMembership[];
  defaultBoardName: string;
  notificationsLabel: string;
  notificationCount: number;
  onboarding: OnboardingState;
  nextSteps: ProductNextStep[];
  operations: {
    canReview: boolean;
    canModerate: boolean;
    canManageUsers: boolean;
  };
}
