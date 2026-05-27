import { Injectable, computed, inject, signal } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';
import { ApiService } from './api.service';
import { deriveBoardCatalog, toServerProfileUpdate, toUiNotification, toUiPost, toUiProfile, type UiBoard, type UiNotification, type UiPost, type UiProfile } from './data';
import { ActivityLog, ActivityViewModel, BoardAccessViewModel, BoardInvite, BoardMembership, BoardRecommendation, DiscoverJourneyViewModel, HomeViewModel, InboxItem, KeywordRule, MentionItem, NotificationItem, OnboardingState, PlatformSummary, PlatformUser, ProductNextStep, SavedSmartList, SettingsViewModel, SocialPost, ReviewTask, UserPreferences, UserProfile } from './social.models';
import { SessionService } from './session.service';
import { BOARD_CATALOG } from './social-taxonomy';

interface WorkspaceRefreshOptions {
  posts?: boolean;
  reviewTasks?: boolean;
  rules?: boolean;
  users?: boolean;
  summary?: boolean;
  activityLogs?: boolean;
  mentions?: boolean;
  inbox?: boolean;
  memberships?: boolean;
  savedSmartLists?: boolean;
  profile?: boolean;
  preferences?: boolean;
  boardInvites?: boolean;
  boardRecommendations?: boolean;
  notifications?: boolean;
  onboarding?: boolean;
}

const EMPTY_SUMMARY: PlatformSummary = {
  totalPosts: 0,
  published: 0,
  pending: 0,
  rejected: 0,
  rules: 0,
  totalUsers: 0,
};

const EMPTY_PROFILE: UserProfile = {
  username: '',
  displayName: '',
  title: '',
  location: '',
  bio: '',
  updatedAt: '',
};

const EMPTY_PREFERENCES: UserPreferences = {
  theme: 'System',
  notificationsEnabled: true,
  defaultBoardSlug: 'all-company',
  digestCadence: 'Daily',
  updatedAt: '',
};

const EMPTY_ONBOARDING: OnboardingState = {
  profileCompleted: false,
  joinedBoard: false,
  savedSmartList: false,
  reviewedPost: false,
  updatedAt: '',
};

@Injectable({ providedIn: 'root' })
export class SocialDataService {
  private readonly api = inject(ApiService);
  private readonly session = inject(SessionService);

  readonly posts = signal<SocialPost[]>([]);
  readonly reviewTasks = signal<ReviewTask[]>([]);
  readonly keywordRules = signal<KeywordRule[]>([]);
  readonly users = signal<PlatformUser[]>([]);
  readonly summary = signal<PlatformSummary>(EMPTY_SUMMARY);
  readonly selectedPost = signal<SocialPost | null>(null);
  readonly activityLogs = signal<ActivityLog[]>([]);
  readonly mentions = signal<MentionItem[]>([]);
  readonly inboxItems = signal<InboxItem[]>([]);
  readonly boardMemberships = signal<BoardMembership[]>([]);
  readonly boardInvites = signal<BoardInvite[]>([]);
  readonly boardRecommendations = signal<BoardRecommendation[]>([]);
  readonly savedSmartLists = signal<SavedSmartList[]>([]);
  readonly userProfile = signal<UserProfile>(EMPTY_PROFILE);
  readonly userPreferences = signal<UserPreferences>(EMPTY_PREFERENCES);
  readonly notifications = signal<NotificationItem[]>([]);
  readonly onboarding = signal<OnboardingState>(EMPTY_ONBOARDING);
  readonly uiPosts = computed<UiPost[]>(() => this.posts().map((post) => toUiPost(post)));
  readonly uiNotifications = computed<UiNotification[]>(() => this.notifications().map((item) => toUiNotification(item)));
  readonly uiProfile = computed<UiProfile>(() => toUiProfile(this.userProfile()));
  readonly uiBoardCatalog = computed<UiBoard[]>(() => deriveBoardCatalog(this.boardMemberships(), this.boardRecommendations()));

  readonly pendingReviewTasks = computed(() => this.reviewTasks().filter((task) => task.status === 'Pending'));
  readonly publishedPosts = computed(() => this.posts().filter((post) => post.status === 'Published'));
  readonly pendingPosts = computed(() => this.posts().filter((post) => post.status === 'Pending Review'));
  readonly rejectedPosts = computed(() => this.posts().filter((post) => post.status === 'Rejected'));
  readonly boardSummaries = computed(() => {
    const posts = this.posts();
    const memberships = new Set(this.boardMemberships().map((item) => item.boardSlug));
    const inviteMap = new Map(this.boardInvites().filter((invite) => invite.status === 'Pending').map((invite) => [invite.boardSlug, invite]));
    return BOARD_CATALOG.map((board) => {
      const boardPosts = posts.filter((post) => post.boardSlug === board.slug);
      const latestPost = boardPosts[0] ?? null;
      return {
        ...board,
        joined: memberships.has(board.slug),
        pendingInvite: inviteMap.get(board.slug) ?? null,
        postCount: boardPosts.length,
        publishedCount: boardPosts.filter((post) => post.status === 'Published').length,
        pendingCount: boardPosts.filter((post) => post.status === 'Pending Review').length,
        highRiskCount: boardPosts.filter((post) => post.riskLevel === 'High').length,
        latestPost,
      };
    });
  });
  readonly discoverCollections = computed(() => {
    const posts = this.posts();
    const boardSummaries = this.boardSummaries();
    const authors = [...new Set(posts.map((post) => post.author))]
      .slice(0, 6)
      .map((author) => ({
        name: author,
        activeBoards: [...new Set(posts.filter((post) => post.author === author).map((post) => post.boardSlug))].length,
        recentStatus: posts.find((post) => post.author === author)?.status ?? 'Published',
      }));

    return {
      trendingBoards: [...boardSummaries]
        .sort((left, right) => right.postCount - left.postCount || right.pendingCount - left.pendingCount)
        .slice(0, 3),
      pendingThreads: posts.filter((post) => post.status === 'Pending Review').slice(0, 4),
      highRiskThreads: posts.filter((post) => post.riskLevel === 'High').slice(0, 4),
      recentAuthors: authors,
    };
  });
  readonly unreadMentions = computed(() => this.mentions().slice(0, 8));
  readonly joinedBoardSlugs = computed(() => this.boardMemberships().map((item) => item.boardSlug));
  readonly ownedBoardSlugs = computed(() => this.boardMemberships().filter((item) => item.role === 'Owner').map((item) => item.boardSlug));
  readonly inboxSummary = computed(() => ({
    review: this.inboxItems().filter((item) => item.kind === 'review').length,
    mentions: this.inboxItems().filter((item) => item.kind === 'mention').length,
    status: this.inboxItems().filter((item) => item.kind === 'status').length,
  }));
  readonly unreadNotificationCount = computed(() => this.notifications().filter((item) => !item.read).length);
  readonly personalizedNextSteps = computed<ProductNextStep[]>(() => this.buildNextSteps());
  readonly boardAccessViewModels = computed<BoardAccessViewModel[]>(() => {
    const username = this.session.activeUser();
    const membershipMap = new Map(this.boardMemberships().map((item) => [item.boardSlug, item]));
    const incomingInviteMap = new Map(
      this.boardInvites()
        .filter((invite) => invite.invitee === username && invite.status === 'Pending')
        .map((invite) => [invite.boardSlug, invite]),
    );
    const outgoingInviteMap = new Map<string, BoardInvite[]>();
    for (const invite of this.boardInvites().filter((item) => item.inviter === username && item.status === 'Pending')) {
      const current = outgoingInviteMap.get(invite.boardSlug) ?? [];
      current.push(invite);
      outgoingInviteMap.set(invite.boardSlug, current);
    }
    const recommendationMap = new Map(this.boardRecommendations().map((item) => [item.boardSlug, item]));

    return BOARD_CATALOG.map((board) => {
      const membership = membershipMap.get(board.slug) ?? null;
      const incomingInvite = incomingInviteMap.get(board.slug) ?? null;
      const outgoingInvites = outgoingInviteMap.get(board.slug) ?? [];
      const recommendation = recommendationMap.get(board.slug) ?? null;
      const entryState = membership?.role === 'Owner'
        ? 'Owner'
        : membership
          ? 'Joined'
          : incomingInvite
            ? 'Invited'
            : recommendation
              ? 'Recommended'
              : 'Open';

      return {
        slug: board.slug,
        role: membership?.role ?? null,
        joined: Boolean(membership),
        isOwner: membership?.role === 'Owner',
        entryState,
        incomingInvite,
        outgoingInvites,
        recommendation,
      };
    });
  });
  readonly homeViewModel = computed<HomeViewModel>(() => {
    const summary = this.summary();
    const reviewPreview = this.pendingReviewTasks().slice(0, 3);
    const recentPosts = this.posts().slice(0, 4);
    const onboarding = this.onboarding();
    const joinedBoards = this.boardSummaries()
      .filter((board) => board.joined)
      .slice(0, 4)
      .map((board) => ({
        slug: board.slug,
        name: board.name,
        pendingCount: board.pendingCount,
        latestPostId: board.latestPost?.id ?? null,
      }));

    return {
      overview: {
        totalPosts: summary.totalPosts,
        pendingPosts: summary.pending,
        publishedPosts: summary.published,
        pendingReviewCount: this.pendingReviewTasks().length,
        highRiskCount: this.posts().filter((post) => post.riskLevel === 'High').length,
        rulesCount: summary.rules,
        totalUsers: summary.totalUsers,
      },
      reviewPreview,
      recentPosts,
      joinedBoards,
      notificationsPreview: this.notifications().slice(0, 4),
      onboarding: {
        progress: this.onboardingProgress(onboarding),
        total: 4,
        steps: [
          { key: 'profileCompleted', label: 'Complete your profile', done: onboarding.profileCompleted },
          { key: 'joinedBoard', label: 'Join a board', done: onboarding.joinedBoard },
          { key: 'savedSmartList', label: 'Save a smart list', done: onboarding.savedSmartList },
          { key: 'reviewedPost', label: 'Review or moderate a post', done: onboarding.reviewedPost },
        ],
      },
      nextSteps: this.personalizedNextSteps().slice(0, 3),
    };
  });
  readonly activityViewModel = computed<ActivityViewModel>(() => ({
    inboxSummary: this.inboxSummary(),
    inboxItems: this.inboxItems().slice(0, 8),
    mentions: this.unreadMentions(),
    timeline: this.activityLogs().slice(0, 8).map((entry) => {
      const relatedPost = entry.postId ? this.posts().find((post) => post.id === entry.postId) : null;
      return {
        id: entry.id,
        action: entry.action,
        title: this.humanizeAction(entry.action),
        summary: entry.postId ? `Related post: ${entry.postId}` : 'Platform event',
        postId: entry.postId ?? null,
        boardSlug: relatedPost?.boardSlug ?? null,
        username: entry.username ?? null,
        role: entry.role ?? null,
        at: entry.at,
      };
    }),
    pendingTasks: this.pendingReviewTasks(),
    moderationPreview: this.reviewTasks().slice(0, 6),
  }));
  readonly settingsViewModel = computed<SettingsViewModel>(() => ({
    preferences: this.userPreferences(),
    summary: this.summary(),
    joinedBoards: this.boardMemberships(),
    defaultBoardName: BOARD_CATALOG.find((board) => board.slug === this.userPreferences().defaultBoardSlug)?.name ?? this.userPreferences().defaultBoardSlug,
    notificationsLabel: this.userPreferences().notificationsEnabled ? 'Notifications enabled' : 'Notifications muted',
    notificationCount: this.unreadNotificationCount(),
    onboarding: this.onboarding(),
    nextSteps: this.personalizedNextSteps().slice(0, 4),
    operations: {
      canReview: this.session.canReviewPosts(),
      canModerate: this.session.canModerateKeywords(),
      canManageUsers: this.session.canManageUsers(),
    },
  }));
  readonly discoverJourneyViewModel = computed<DiscoverJourneyViewModel>(() => {
    const actions = [
      ...this.boardRecommendations().map((item) => ({
        id: `board-recommendation-${item.boardSlug}`,
        title: `Join #${item.boardSlug}`,
        summary: item.reason,
        boardSlug: item.boardSlug,
        source: 'board-recommendation' as const,
        cta: 'join-board' as const,
        relatedId: null,
      })),
      ...this.notifications()
        .filter((item) => item.actionable)
        .slice(0, 3)
        .map((item) => ({
          id: `notification-${item.id}`,
          title: item.title,
          summary: item.summary,
          boardSlug: item.boardSlug ?? null,
          source: 'notification' as const,
          cta: item.kind === 'review' || item.kind === 'mention' ? 'open-activity' as const : 'open-board' as const,
          relatedId: item.postId ?? null,
          notificationId: item.id,
          activityTab: item.kind === 'mention'
            ? ('Mentions' as const)
            : item.kind === 'review'
              ? ('Inbox' as const)
              : null,
        })),
      ...this.savedSmartLists().slice(0, 2).map((item) => ({
        id: `smart-list-${item.id}`,
        title: item.name,
        summary: `${item.statusFilter || 'Any status'} · ${item.riskFilter || 'Any risk'}`,
        boardSlug: item.boardSlug || null,
        source: 'smart-list' as const,
        cta: 'apply-smart-list' as const,
        relatedId: item.id,
        notificationId: null,
      })),
    ];

    return {
      recommendations: this.boardRecommendations(),
      savedLists: this.savedSmartLists(),
      actions: actions.slice(0, 6),
    };
  });

  reset(): void {
    this.posts.set([]);
    this.reviewTasks.set([]);
    this.keywordRules.set([]);
    this.users.set([]);
    this.summary.set(EMPTY_SUMMARY);
    this.selectedPost.set(null);
    this.activityLogs.set([]);
    this.mentions.set([]);
    this.inboxItems.set([]);
    this.boardMemberships.set([]);
    this.boardInvites.set([]);
    this.boardRecommendations.set([]);
    this.savedSmartLists.set([]);
    this.userProfile.set(EMPTY_PROFILE);
    this.userPreferences.set(EMPTY_PREFERENCES);
    this.notifications.set([]);
    this.onboarding.set(EMPTY_ONBOARDING);
  }

  refreshWorkspace(options: WorkspaceRefreshOptions = {}): Observable<unknown> {
    const {
      posts = false,
      reviewTasks = false,
      rules = false,
      users = false,
      summary = false,
      activityLogs = false,
      mentions = false,
      inbox = false,
      memberships = false,
      savedSmartLists = false,
      profile = false,
      preferences = false,
      boardInvites = false,
      boardRecommendations = false,
      notifications = false,
      onboarding = false,
    } = options;

    return forkJoin({
      posts: posts ? this.api.listPosts().pipe(tap((items) => this.posts.set(items))) : of(this.posts()),
      reviewTasks: reviewTasks ? this.api.listReviewTasks().pipe(tap((items) => this.reviewTasks.set(items))) : of(this.reviewTasks()),
      rules: rules ? this.api.listKeywordRules().pipe(tap((items) => this.keywordRules.set(items))) : of(this.keywordRules()),
      users: users ? this.loadUsers() : of(this.users()),
      summary: summary ? this.api.reportSummary().pipe(tap((result) => this.mergeSummary(result))) : of(this.summary()),
      activityLogs: activityLogs ? this.api.listActivityLogs().pipe(tap((items) => this.activityLogs.set(items))) : of(this.activityLogs()),
      mentions: mentions ? this.api.listMentions().pipe(tap((items) => this.mentions.set(items))) : of(this.mentions()),
      inbox: inbox ? this.api.listInbox().pipe(tap((items) => this.inboxItems.set(items))) : of(this.inboxItems()),
      memberships: memberships ? this.api.listBoardMemberships().pipe(tap((items) => this.boardMemberships.set(items))) : of(this.boardMemberships()),
      boardInvites: boardInvites ? this.api.listBoardInvites().pipe(tap((items) => this.boardInvites.set(items))) : of(this.boardInvites()),
      boardRecommendations: boardRecommendations ? this.api.listBoardRecommendations().pipe(tap((items) => this.boardRecommendations.set(items))) : of(this.boardRecommendations()),
      savedSmartLists: savedSmartLists ? this.api.listSavedSmartLists().pipe(tap((items) => this.savedSmartLists.set(items))) : of(this.savedSmartLists()),
      profile: profile ? this.api.getMyProfile().pipe(tap((item) => this.userProfile.set(item))) : of(this.userProfile()),
      preferences: preferences ? this.api.getMyPreferences().pipe(tap((item) => this.userPreferences.set(item))) : of(this.userPreferences()),
      notifications: notifications ? this.api.listNotifications().pipe(tap((items) => this.notifications.set(items))) : of(this.notifications()),
      onboarding: onboarding ? this.api.getMyOnboarding().pipe(tap((item) => this.onboarding.set(item))) : of(this.onboarding()),
    }).pipe(tap(() => this.reconcileSummary()));
  }

  loadHomeWorkspace(): Observable<unknown> {
    return this.refreshWorkspace({
      posts: true,
      reviewTasks: this.session.canReviewPosts(),
      rules: true,
      users: this.session.canManageUsers(),
      memberships: true,
      notifications: true,
      onboarding: true,
    });
  }

  loadActivityWorkspace(): Observable<unknown> {
    return this.refreshWorkspace({
      posts: true,
      reviewTasks: this.session.canReviewPosts(),
      activityLogs: true,
      mentions: true,
      inbox: true,
      notifications: true,
    });
  }

  loadSettingsWorkspace(): Observable<unknown> {
    return this.refreshWorkspace({
      posts: true,
      rules: true,
      users: this.session.canManageUsers(),
      preferences: true,
      memberships: true,
      notifications: true,
      onboarding: true,
    });
  }

  loadDiscoverWorkspace(): Observable<unknown> {
    return this.refreshWorkspace({
      posts: true,
      memberships: true,
      boardRecommendations: true,
      savedSmartLists: true,
      notifications: true,
    });
  }

  loadPostDetail(id: string): Observable<SocialPost> {
    return forkJoin({
      post: this.api.getPost(id),
      comments: this.api.listComments(id),
      history: this.api.getPostHistory(id),
    }).pipe(
      map(({ post, comments, history }) => ({
        ...post,
        comments,
        tasks: history,
      })),
      tap((post) => {
        this.selectedPost.set(post);
        this.upsertPost(post);
      }),
    );
  }

  clearSelectedPost(): void {
    this.selectedPost.set(null);
  }

  createPost(payload: { author: string; content: string; visibility?: 'Public' | 'Company'; boardSlug?: string }): Observable<SocialPost> {
    return this.api.createPost(payload).pipe(
      tap((post) => {
        this.posts.update((items) => [post, ...items.filter((item) => item.id !== post.id)]);
        this.selectedPost.set(post);
        this.reconcileSummary();
      }),
    );
  }

  publishPost(id: string): Observable<SocialPost> {
    return this.api.publishPost(id).pipe(tap((post) => this.upsertPost(post, true)));
  }

  approvePost(id: string, note = ''): Observable<SocialPost> {
    return this.api.approvePost(id, note).pipe(tap((post) => this.upsertPost(post, true)));
  }

  rejectPost(id: string, note = 'Rejected for revision'): Observable<SocialPost> {
    return this.api.rejectPost(id, note).pipe(tap((post) => this.upsertPost(post, true)));
  }

  addComment(id: string, payload: { author: string; comment: string }): Observable<SocialPost> {
    return this.api.addComment(id, payload).pipe(switchMap(() => this.loadPostDetail(id)));
  }

  createKeywordRule(payload: { keyword: string; riskLevel: 'Low' | 'Medium' | 'High' }): Observable<KeywordRule[]> {
    return this.api.createKeywordRule(payload).pipe(
      switchMap(() => this.api.listKeywordRules()),
      tap((rules) => {
        this.keywordRules.set(rules);
        this.reconcileSummary();
      }),
    );
  }

  toggleKeywordRule(id: number): Observable<KeywordRule[]> {
    return this.api.toggleKeywordRule(id).pipe(
      switchMap(() => this.api.listKeywordRules()),
      tap((rules) => {
        this.keywordRules.set(rules);
        this.reconcileSummary();
      }),
    );
  }

  createUser(username: string, role: string): Observable<PlatformUser> {
    return this.api.createUser(username, role as any).pipe(
      tap((user) => {
        this.users.update((items) => [user, ...items.filter((item) => item.username !== user.username)]);
        this.reconcileSummary();
      }),
    );
  }

  joinBoard(boardSlug: string): Observable<BoardMembership[]> {
    return this.api.joinBoard(boardSlug).pipe(
      tap((items) => this.boardMemberships.set(items)),
    );
  }

  leaveBoard(boardSlug: string): Observable<BoardMembership[]> {
    return this.api.leaveBoard(boardSlug).pipe(
      tap((items) => this.boardMemberships.set(items)),
    );
  }

  createBoardInvite(payload: { boardSlug: string; invitee: string }): Observable<BoardInvite[]> {
    return this.api.createBoardInvite(payload).pipe(
      tap((items) => this.boardInvites.set(items)),
    );
  }

  respondBoardInvite(id: number, action: 'accept' | 'decline'): Observable<BoardInvite[]> {
    return this.api.respondBoardInvite(id, action).pipe(
      switchMap((items) => {
        this.boardInvites.set(items);
        return this.api.listBoardMemberships();
      }),
      tap((items) => this.boardMemberships.set(items)),
      switchMap(() => this.api.listBoardInvites()),
      tap((items) => this.boardInvites.set(items)),
    );
  }

  withdrawBoardInvite(id: number): Observable<BoardInvite[]> {
    return this.api.withdrawBoardInvite(id).pipe(
      tap((items) => this.boardInvites.set(items)),
    );
  }

  markNotificationRead(id: string): Observable<NotificationItem[]> {
    return this.api.markNotificationRead(id).pipe(
      tap((items) => this.notifications.set(items)),
    );
  }

  createSavedSmartList(payload: { name: string; query?: string; statusFilter?: string; riskFilter?: string; boardSlug?: string }): Observable<SavedSmartList[]> {
    return this.api.createSavedSmartList(payload).pipe(
      tap((items) => this.savedSmartLists.set(items)),
    );
  }

  deleteSavedSmartList(id: number): Observable<SavedSmartList[]> {
    return this.api.deleteSavedSmartList(id).pipe(
      tap((items) => this.savedSmartLists.set(items)),
    );
  }

  updateMyProfile(payload: Partial<UiProfile>): Observable<UiProfile> {
    return this.api.updateMyProfile(toServerProfileUpdate(payload)).pipe(
      tap((item) => this.userProfile.set(item)),
      map((item) => toUiProfile(item)),
    );
  }

  updateMyPreferences(payload: { theme: 'System' | 'Light' | 'Dark'; notificationsEnabled: boolean; defaultBoardSlug: string; digestCadence: 'Instant' | 'Daily' | 'Weekly' }): Observable<UserPreferences> {
    return this.api.updateMyPreferences(payload).pipe(
      tap((item) => this.userPreferences.set(item)),
    );
  }

  private loadUsers(): Observable<PlatformUser[]> {
    if (!this.session.canManageUsers()) {
      this.users.set([]);
      this.reconcileSummary();
      return of([]);
    }

    return this.api.listUsers().pipe(
      tap((users) => {
        this.users.set(users);
        this.reconcileSummary();
      }),
    );
  }

  private upsertPost(post: SocialPost, alsoSelect = false): void {
    this.posts.update((items) => [post, ...items.filter((item) => item.id !== post.id)]);
    if (alsoSelect || this.selectedPost()?.id === post.id) {
      this.selectedPost.set(post);
    }
    this.reconcileSummary();
  }

  private mergeSummary(partial: Omit<PlatformSummary, 'totalUsers'>): void {
    this.summary.set({
      ...this.summary(),
      ...partial,
      totalUsers: this.users().length,
    });
  }

  private reconcileSummary(): void {
    const posts = this.posts();
    const rules = this.keywordRules();
    this.summary.set({
      totalPosts: posts.length,
      published: posts.filter((post) => post.status === 'Published').length,
      pending: posts.filter((post) => post.status === 'Pending Review').length,
      rejected: posts.filter((post) => post.status === 'Rejected').length,
      rules: rules.filter((rule) => rule.active).length,
      totalUsers: this.users().length,
    });
  }

  private humanizeAction(action: string): string {
    return action
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  private onboardingProgress(state: OnboardingState): number {
    return [state.profileCompleted, state.joinedBoard, state.savedSmartList, state.reviewedPost].filter(Boolean).length;
  }

  private buildNextSteps(): ProductNextStep[] {
    const steps: ProductNextStep[] = [];
    const onboarding = this.onboarding();
    const preferences = this.userPreferences();
    const recommendations = this.boardRecommendations();
    const unreadNotifications = this.notifications().filter((item) => !item.read);

    unreadNotifications
      .filter((item) => item.actionable)
      .slice(0, 2)
      .forEach((item) => {
        steps.push({
          id: `notification-${item.id}`,
          title: item.kind === 'review'
            ? 'Handle a review request'
            : item.kind === 'mention'
              ? 'Reply to a mention'
              : item.kind === 'invite'
                ? 'Respond to a board invite'
                : 'Open a notification context',
          summary: item.summary,
          ctaLabel: item.kind === 'review' ? 'Open review flow' : 'Open context',
          route: item.kind === 'review' || item.kind === 'mention' ? '/activity' : '/boards',
          queryParams: item.kind === 'review'
            ? { tab: 'Inbox' }
            : item.kind === 'mention'
              ? { tab: 'Mentions' }
              : { board: item.boardSlug ?? preferences.defaultBoardSlug, postId: item.postId ?? null },
          source: 'notification',
          notificationId: item.id,
        });
      });

    if (!onboarding.profileCompleted) {
      steps.push({
        id: 'complete-profile',
        title: 'Complete your profile',
        summary: 'Add a clearer name, title, and bio so teams can recognize your presence across boards.',
        ctaLabel: 'Edit profile',
        route: '/profile',
        source: 'onboarding',
      });
    }

    if (!onboarding.joinedBoard) {
      const firstRecommendation = recommendations[0];
      steps.push({
        id: 'join-first-board',
        title: firstRecommendation ? `Join #${firstRecommendation.boardSlug}` : 'Join your first board',
        summary: firstRecommendation?.reason ?? 'Boards shape your default workspace and make future recommendations more useful.',
        ctaLabel: 'Open boards',
        route: '/boards',
        queryParams: { board: firstRecommendation?.boardSlug ?? preferences.defaultBoardSlug },
        source: firstRecommendation ? 'recommendation' : 'onboarding',
      });
    }

    if (!onboarding.savedSmartList) {
      steps.push({
        id: 'save-smart-list',
        title: 'Save a smart list',
        summary: 'Turn a useful board or moderation filter into a reusable view for faster follow-up work.',
        ctaLabel: 'Open discover',
        route: '/discover',
        source: 'onboarding',
      });
    }

    if (this.session.canReviewPosts() && !onboarding.reviewedPost) {
      steps.push({
        id: 'complete-first-review',
        title: 'Complete a moderation decision',
        summary: 'Finish one queued review to establish your moderation workflow and clear onboarding.',
        ctaLabel: 'Open review queue',
        route: '/moderation/review',
        source: 'onboarding',
      });
    }

    if (!preferences.notificationsEnabled && unreadNotifications.length) {
      steps.push({
        id: 'enable-notifications',
        title: 'Turn notifications back on',
        summary: `${unreadNotifications.length} unread signals are waiting. Re-enable notifications so inbox and moderation alerts stay visible.`,
        ctaLabel: 'Open settings',
        route: '/settings',
        source: 'preference',
      });
    }

    return steps.filter((step, index, items) => items.findIndex((candidate) => candidate.id === step.id) === index).slice(0, 4);
  }
}
