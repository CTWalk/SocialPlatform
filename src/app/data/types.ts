import type {
  BoardMembership,
  BoardRecommendation,
  NotificationItem,
  SocialPost,
  UserProfile,
} from '../social.models';

export type ServerPost = SocialPost;
export type ServerNotification = NotificationItem;
export type ServerProfile = UserProfile;
export type ServerBoardMembership = BoardMembership;
export type ServerBoardRecommendation = BoardRecommendation;

export interface ServerProfileUpdate {
  displayName: string;
  title: string;
  location: string;
  bio: string;
}

export interface UiPost {
  id: string;
  author: string;
  handle: string;
  time: string;
  body: string;
  replies: number;
  boardSlug?: string;
  visibility?: 'Public' | 'Company';
}

export interface UiNotification {
  id: string;
  kind: 'mention' | 'invite' | 'review' | 'status' | 'recommendation';
  who: string;
  time: string;
  preview?: string;
  title?: string;
  boardSlug?: string;
  postId?: string;
  actionable: boolean;
  read: boolean;
}

export interface UiProfile {
  username: string;
  handle: string;
  displayName: string;
  bio: string;
  title: string;
  location: string;
}

export interface UiBoard {
  slug: string;
  name: string;
  desc?: string;
  subscribed: boolean;
  role?: 'member' | 'moderator' | 'admin';
  unread?: number;
}
