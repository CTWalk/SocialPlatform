import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ActivityLog, BoardInvite, BoardMembership, BoardRecommendation, InboxItem, KeywordRule, MentionItem, NotificationItem, OnboardingState, PlatformUser, SavedSmartList, SocialPost, ReviewTask, UserPreferences, UserProfile } from './social.models';
import { Role } from './session.service';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  login(username: string, role: Role): Observable<{ user: string; role: Role; sessionId: string }> {
    return this.http.post<{ user: string; role: Role; sessionId: string }>(`${this.baseUrl}/auth/login`, { username, role });
  }

  logout(sessionId: string): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(`${this.baseUrl}/auth/logout`, { sessionId });
  }

  listPosts(): Observable<SocialPost[]> {
    return this.http.get<SocialPost[]>(`${this.baseUrl}/posts`);
  }

  getPost(id: string): Observable<SocialPost> {
    return this.http.get<SocialPost>(`${this.baseUrl}/posts/${id}`);
  }

  createPost(payload: { author: string; content: string; visibility?: 'Public' | 'Company'; boardSlug?: string }): Observable<SocialPost> {
    return this.http.post<SocialPost>(`${this.baseUrl}/posts`, payload);
  }

  publishPost(id: string): Observable<SocialPost> {
    return this.http.patch<SocialPost>(`${this.baseUrl}/posts/${id}/publish`, {});
  }

  approvePost(id: string, note = ''): Observable<SocialPost> {
    return this.http.patch<SocialPost>(`${this.baseUrl}/posts/${id}/approve`, { note });
  }

  rejectPost(id: string, note = 'Rejected for revision'): Observable<SocialPost> {
    return this.http.patch<SocialPost>(`${this.baseUrl}/posts/${id}/reject`, { note });
  }

  listReviewTasks(): Observable<ReviewTask[]> {
    return this.http.get<ReviewTask[]>(`${this.baseUrl}/review-tasks`);
  }

  getPostHistory(id: string): Observable<ReviewTask[]> {
    return this.http.get<ReviewTask[]>(`${this.baseUrl}/posts/${id}/history`);
  }

  listComments(id: string): Observable<Array<{ id: number; postId: string; author: string; comment: string; createdAt: string }>> {
    return this.http.get<Array<{ id: number; postId: string; author: string; comment: string; createdAt: string }>>(`${this.baseUrl}/posts/${id}/comments`);
  }

  addComment(id: string, payload: { author: string; comment: string }): Observable<{ id: number; postId: string; author: string; comment: string; createdAt: string }> {
    return this.http.post<{ id: number; postId: string; author: string; comment: string; createdAt: string }>(`${this.baseUrl}/posts/${id}/comments`, payload);
  }

  listKeywordRules(): Observable<KeywordRule[]> {
    return this.http.get<KeywordRule[]>(`${this.baseUrl}/keyword-rules`);
  }

  createKeywordRule(payload: { keyword: string; riskLevel: 'Low' | 'Medium' | 'High' }): Observable<KeywordRule> {
    return this.http.post<KeywordRule>(`${this.baseUrl}/keyword-rules`, payload);
  }

  toggleKeywordRule(id: number): Observable<KeywordRule> {
    return this.http.patch<KeywordRule>(`${this.baseUrl}/keyword-rules/${id}/toggle`, {});
  }

  reportSummary(): Observable<{ totalPosts: number; published: number; pending: number; rejected: number; rules: number }> {
    return this.http.get<{ totalPosts: number; published: number; pending: number; rejected: number; rules: number }>(`${this.baseUrl}/reports/summary`);
  }

  meta(): Observable<{ roles: Role[]; workflow: string[]; riskLevels: string[] }> {
    return this.http.get<{ roles: Role[]; workflow: string[]; riskLevels: string[] }>(`${this.baseUrl}/meta`);
  }

  listUsers(): Observable<PlatformUser[]> {
    return this.http.get<PlatformUser[]>(`${this.baseUrl}/users`);
  }

  createUser(username: string, role: Role): Observable<PlatformUser> {
    return this.http.post<PlatformUser>(`${this.baseUrl}/users`, { username, role });
  }

  listActivityLogs(): Observable<ActivityLog[]> {
    return this.http.get<ActivityLog[]>(`${this.baseUrl}/activity-logs`);
  }

  listMentions(): Observable<MentionItem[]> {
    return this.http.get<MentionItem[]>(`${this.baseUrl}/mentions`);
  }

  listInbox(): Observable<InboxItem[]> {
    return this.http.get<InboxItem[]>(`${this.baseUrl}/inbox`);
  }

  listNotifications(): Observable<NotificationItem[]> {
    return this.http.get<NotificationItem[]>(`${this.baseUrl}/notifications`);
  }

  markNotificationRead(id: string): Observable<NotificationItem[]> {
    return this.http.patch<NotificationItem[]>(`${this.baseUrl}/notifications/${encodeURIComponent(id)}/read`, {});
  }

  listBoardMemberships(): Observable<BoardMembership[]> {
    return this.http.get<BoardMembership[]>(`${this.baseUrl}/board-memberships`);
  }

  joinBoard(boardSlug: string): Observable<BoardMembership[]> {
    return this.http.post<BoardMembership[]>(`${this.baseUrl}/board-memberships`, { boardSlug });
  }

  leaveBoard(boardSlug: string): Observable<BoardMembership[]> {
    return this.http.delete<BoardMembership[]>(`${this.baseUrl}/board-memberships/${boardSlug}`);
  }

  listBoardInvites(): Observable<BoardInvite[]> {
    return this.http.get<BoardInvite[]>(`${this.baseUrl}/board-invites`);
  }

  createBoardInvite(payload: { boardSlug: string; invitee: string }): Observable<BoardInvite[]> {
    return this.http.post<BoardInvite[]>(`${this.baseUrl}/board-invites`, payload);
  }

  respondBoardInvite(id: number, action: 'accept' | 'decline'): Observable<BoardInvite[]> {
    return this.http.patch<BoardInvite[]>(`${this.baseUrl}/board-invites/${id}`, { action });
  }

  withdrawBoardInvite(id: number): Observable<BoardInvite[]> {
    return this.http.delete<BoardInvite[]>(`${this.baseUrl}/board-invites/${id}`);
  }

  listBoardRecommendations(): Observable<BoardRecommendation[]> {
    return this.http.get<BoardRecommendation[]>(`${this.baseUrl}/board-recommendations`);
  }

  listSavedSmartLists(): Observable<SavedSmartList[]> {
    return this.http.get<SavedSmartList[]>(`${this.baseUrl}/saved-smart-lists`);
  }

  createSavedSmartList(payload: { name: string; query?: string; statusFilter?: string; riskFilter?: string; boardSlug?: string }): Observable<SavedSmartList[]> {
    return this.http.post<SavedSmartList[]>(`${this.baseUrl}/saved-smart-lists`, payload);
  }

  deleteSavedSmartList(id: number): Observable<SavedSmartList[]> {
    return this.http.delete<SavedSmartList[]>(`${this.baseUrl}/saved-smart-lists/${id}`);
  }

  getMyProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.baseUrl}/me/profile`);
  }

  updateMyProfile(payload: { displayName: string; title: string; location: string; bio: string }): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.baseUrl}/me/profile`, payload);
  }

  getMyPreferences(): Observable<UserPreferences> {
    return this.http.get<UserPreferences>(`${this.baseUrl}/me/preferences`);
  }

  getMyOnboarding(): Observable<OnboardingState> {
    return this.http.get<OnboardingState>(`${this.baseUrl}/me/onboarding`);
  }

  updateMyPreferences(payload: { theme: 'System' | 'Light' | 'Dark'; notificationsEnabled: boolean; defaultBoardSlug: string; digestCadence: 'Instant' | 'Daily' | 'Weekly' }): Observable<UserPreferences> {
    return this.http.put<UserPreferences>(`${this.baseUrl}/me/preferences`, payload);
  }
}
