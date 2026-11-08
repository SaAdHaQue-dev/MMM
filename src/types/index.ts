export type FamilySide = 'bride' | 'groom';

export type UserRole = 'wedding_admin' | 'family_admin' | 'family_member' | 'guest';

export interface Profile {
  id: string;
  fullName: string;
  avatarUrl?: string;
  phone?: string;
  createdAt: string;
}

export interface Wedding {
  id: string;
  creatorId: string;
  brideName: string;
  groomName: string;
  weddingDate: string;
  weddingTime?: string;
  venueName: string;
  venueAddress: string;
  mapUrl?: string;
  totalBudget: number;
  currency: string;
  timezone: string;
  description?: string;
  couplePhotoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WeddingMember {
  id: string;
  weddingId: string;
  userId?: string;
  fullName: string;
  email: string;
  phone?: string;
  familySide: FamilySide;
  role: UserRole;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export type PaymentStatus = 'paid' | 'pending' | 'partially_paid';

export interface ExpenseCategory {
  id: string;
  weddingId: string;
  name: string;
  allocatedBudget: number;
  isActive: boolean;
  createdAt: string;
}

export interface Expense {
  id: string;
  weddingId: string;
  categoryId: string;
  categoryName?: string;
  name: string;
  description?: string;
  totalAmount: number;
  amountPaid: number;
  familySide: FamilySide;
  creatorId: string;
  vendorName?: string;
  expenseDate: string;
  dueDate?: string;
  paymentMethod?: string;
  receiptPath?: string;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'to_do' | 'in_progress' | 'completed';

export interface Task {
  id: string;
  weddingId: string;
  title: string;
  description?: string;
  assigneeId?: string;
  assigneeName?: string;
  creatorId: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: string;
}

export interface WeddingEvent {
  id: string;
  weddingId: string;
  name: string;
  eventType: 'engagement' | 'haldi' | 'mehendi' | 'sangeet' | 'wedding_ceremony' | 'reception' | 'custom';
  description?: string;
  startTime: string;
  endTime?: string;
  venueName: string;
  venueAddress: string;
  mapUrl?: string;
  organizer?: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  weddingId: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  isPinned: boolean;
  createdAt: string;
}

export interface Discussion {
  id: string;
  weddingId: string;
  title: string;
  content: string;
  creatorId: string;
  creatorName: string;
  isPinned: boolean;
  commentCount: number;
  createdAt: string;
}

export interface DiscussionComment {
  id: string;
  discussionId: string;
  weddingId: string;
  creatorId: string;
  creatorName: string;
  content: string;
  createdAt: string;
}

export interface Guest {
  id: string;
  weddingId: string;
  fullName: string;
  phone?: string;
  email?: string;
  familySide: FamilySide;
  groupName?: string;
  notes?: string;
  invitationStatus: 'not_sent' | 'shared';
  createdAt: string;
}

export interface RSVP {
  id: string;
  weddingId: string;
  guestId?: string;
  guestName: string;
  status: 'attending' | 'not_attending' | 'maybe';
  attendeeCount: number;
  message?: string;
  submittedAt: string;
}

export interface DigitalInvitation {
  id: string;
  weddingId: string;
  slug: string;
  templateKey: 'royal_indian' | 'traditional_floral' | 'modern_minimal' | 'ivory_gold' | 'contemporary_romantic';
  themeConfig: {
    primaryColor: string;
    accentColor: string;
    fontFamily: string;
    backgroundTexture?: string;
  };
  content: {
    welcomeMessage: string;
    brideParents?: string;
    groomParents?: string;
    rsvpDeadline: string;
    customNote?: string;
  };
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  weddingId: string;
  recipientUserId: string;
  type: 'task_assigned' | 'deadline_approaching' | 'overdue_task' | 'new_announcement' | 'invitation_accepted' | 'new_rsvp' | 'upcoming_event' | 'payment_reminder';
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  weddingId: string;
  actorName: string;
  action: string;
  entityType: string;
  entityName: string;
  createdAt: string;
}
