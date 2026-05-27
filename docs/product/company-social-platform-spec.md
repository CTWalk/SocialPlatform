# Company Social Platform Spec

## Product Overview

The Company Social Platform is an internal web application for employees to publish posts, comment on updates, and share ideas in a company-controlled environment. Posts are scanned against manager-defined keywords and, when needed, routed into one, two, or three review layers before publication.

## Product Goal

The goal of the platform is to support safe internal communication while keeping moderation traceable and easy to manage. The system should allow normal posts to go live immediately, and route sensitive content through the correct approval flow.

## Core Concept

- Company workers can create posts in the feed.
- Managers can define moderation keywords.
- Posts that match keywords are routed to the review queue.
- The number of review layers depends on keyword risk:
  - Low risk: one reviewer
  - Medium risk: two reviewers
  - High risk: three reviewers
- Approved content is published to the feed.
- Rejected content stays blocked until revised.

## Roles

- **Administrator:** Manages users, permissions, and system settings.
- **Moderator:** Manages keyword rules and moderate-risk content.
- **Auditor:** Creates posts and helps review content when needed.
- **Reviewer:** Handles the first review layer.
- **Approver:** Handles the second review layer.
- **Member:** Creates normal posts and comments.
- **Viewer:** Read-only access to the platform.

## Main Features

- Login and logout
- Role-based access control
- Public feed for company users
- Post creation and comments
- Keyword rule management
- Review queue for triggered posts
- One, two, or three layer moderation
- Post status history
- Activity logs
- User management
- Dashboard and summary reporting

## Workflow

1. A company user creates a post.
2. The system checks the post content against active keywords.
3. If no keyword matches, the post is published immediately.
4. If a low-risk keyword matches, the post enters one review layer.
5. If a medium-risk keyword matches, the post enters two review layers.
6. If a high-risk keyword matches, the post enters three review layers.
7. Reviewers approve or reject each pending layer in order.
8. When all required layers are approved, the post is published.
9. If a layer rejects the post, it stays blocked until revised.

## Data Model

- Users
- Sessions
- Posts
- Moderation rules
- Post reviews
- Post comments
- Activity logs

## Security Requirements

- Users must authenticate before using the platform.
- Actions must be restricted by role.
- Only managers can change keyword rules.
- Only the assigned review role can process a pending layer.
- Viewers must not be able to create or modify content.

## Reporting Requirements

- Total posts
- Published posts
- Pending review posts
- Rejected posts
- Active keyword rules
- Review workload by role
- Activity logs

## Non-Functional Requirements

- The app should run in modern browsers.
- The UI should be readable on desktop and tablet.
- The mobile layout should remain usable for key navigation and review tasks.
- The backend should persist data reliably.
- The system should be easy to maintain and extend.
- The platform should support multiple internal users at once.

## Acceptance Criteria

- A member can create a normal post and publish immediately when no keyword matches.
- A triggered post is sent to the correct number of review layers.
- A reviewer can approve only the assigned layer.
- A lower-role user cannot process a higher review layer.
- A moderator can add or toggle keyword rules.
- A viewer cannot create posts or manage users.
- The dashboard shows current counts and review status.
- The post detail view shows comments and review progress.

## MVP Scope

- Login and logout
- Feed and post creation
- Keyword rule management
- Layered moderation workflow
- Review queue
- User management
- Dashboard summary
- Activity logging

## Out of Scope for MVP

- File uploads
- Mobile app
- Push notifications
- Advanced analytics
- External system integration

## Open Questions

- Should reviewers be able to add notes at each layer?
- Should rejected posts go back to Draft or stay in Rejected?
- Should members see only published posts or all their own drafts too?
- Should the system notify users when a review layer changes?

## Implementation Notes

- Frontend: Angular
- Backend: Node.js + Express
- Database: SQLite for now, PostgreSQL later if needed
- Deployment: CI-ready web delivery with room for containerized deployment later
