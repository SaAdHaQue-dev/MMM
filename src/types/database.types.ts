export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type WeddingRole = 'owner' | 'admin' | 'member' | 'viewer';
export type FamilySide = 'bride' | 'groom';
export type PaymentStatus = 'pending' | 'partially_paid' | 'paid' | 'cancelled';
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type EventStatus = 'planned' | 'confirmed' | 'completed' | 'cancelled';
export type InvitationStatus = 'not_sent' | 'sent' | 'delivered';
export type RsvpStatus = 'pending' | 'accepted' | 'declined';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          avatar_url: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          avatar_url?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          avatar_url?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      weddings: {
        Row: {
          id: string;
          name: string;
          created_by: string;
          partner_one_name: string | null;
          partner_two_name: string | null;
          wedding_date: string | null;
          wedding_time: string | null;
          venue_name: string | null;
          venue_address: string | null;
          map_url: string | null;
          budget: number;
          currency_code: string;
          notes: string | null;
          description: string | null;
          couple_photo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_by: string;
          partner_one_name?: string | null;
          partner_two_name?: string | null;
          wedding_date?: string | null;
          wedding_time?: string | null;
          venue_name?: string | null;
          venue_address?: string | null;
          map_url?: string | null;
          budget?: number;
          currency_code?: string;
          notes?: string | null;
          description?: string | null;
          couple_photo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_by?: string;
          partner_one_name?: string | null;
          partner_two_name?: string | null;
          wedding_date?: string | null;
          wedding_time?: string | null;
          venue_name?: string | null;
          venue_address?: string | null;
          map_url?: string | null;
          budget?: number;
          currency_code?: string;
          notes?: string | null;
          description?: string | null;
          couple_photo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "weddings_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      wedding_members: {
        Row: {
          id: string;
          wedding_id: string;
          user_id: string;
          role: WeddingRole;
          family_side: FamilySide | null;
          joined_at: string;
        };
        Insert: {
          id?: string;
          wedding_id: string;
          user_id: string;
          role: WeddingRole;
          family_side?: FamilySide | null;
          joined_at?: string;
        };
        Update: {
          id?: string;
          wedding_id?: string;
          user_id?: string;
          role?: WeddingRole;
          family_side?: FamilySide | null;
          joined_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "wedding_members_wedding_id_fkey";
            columns: ["wedding_id"];
            isOneToOne: false;
            referencedRelation: "weddings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "wedding_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      expenses: {
        Row: {
          id: string;
          wedding_id: string;
          title: string;
          category: string;
          amount: number;
          paid_amount: number;
          payment_status: PaymentStatus;
          expense_date: string;
          due_date: string | null;
          vendor_name: string | null;
          payment_method: string | null;
          notes: string | null;
          family_side: FamilySide | null;
          receipt_url: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          wedding_id: string;
          title: string;
          category: string;
          amount: number;
          paid_amount?: number;
          payment_status?: PaymentStatus;
          expense_date?: string;
          due_date?: string | null;
          vendor_name?: string | null;
          payment_method?: string | null;
          notes?: string | null;
          family_side?: FamilySide | null;
          receipt_url?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          wedding_id?: string;
          title?: string;
          category?: string;
          amount?: number;
          paid_amount?: number;
          payment_status?: PaymentStatus;
          expense_date?: string;
          due_date?: string | null;
          vendor_name?: string | null;
          payment_method?: string | null;
          notes?: string | null;
          family_side?: FamilySide | null;
          receipt_url?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "expenses_wedding_id_fkey";
            columns: ["wedding_id"];
            isOneToOne: false;
            referencedRelation: "weddings";
            referencedColumns: ["id"];
          }
        ];
      };
      tasks: {
        Row: {
          id: string;
          wedding_id: string;
          title: string;
          description: string | null;
          status: TaskStatus;
          priority: TaskPriority;
          due_date: string | null;
          assigned_to: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          wedding_id: string;
          title: string;
          description?: string | null;
          status?: TaskStatus;
          priority?: TaskPriority;
          due_date?: string | null;
          assigned_to?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          wedding_id?: string;
          title?: string;
          description?: string | null;
          status?: TaskStatus;
          priority?: TaskPriority;
          due_date?: string | null;
          assigned_to?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tasks_wedding_id_fkey";
            columns: ["wedding_id"];
            isOneToOne: false;
            referencedRelation: "weddings";
            referencedColumns: ["id"];
          }
        ];
      };
      events: {
        Row: {
          id: string;
          wedding_id: string;
          title: string;
          description: string | null;
          event_type: string | null;
          start_at: string;
          end_at: string | null;
          venue_name: string | null;
          venue_address: string | null;
          map_url: string | null;
          organizer: string | null;
          status: EventStatus;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          wedding_id: string;
          title: string;
          description?: string | null;
          event_type?: string | null;
          start_at: string;
          end_at?: string | null;
          venue_name?: string | null;
          venue_address?: string | null;
          map_url?: string | null;
          organizer?: string | null;
          status?: EventStatus;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          wedding_id?: string;
          title?: string;
          description?: string | null;
          event_type?: string | null;
          start_at?: string;
          end_at?: string | null;
          venue_name?: string | null;
          venue_address?: string | null;
          map_url?: string | null;
          organizer?: string | null;
          status?: EventStatus;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "events_wedding_id_fkey";
            columns: ["wedding_id"];
            isOneToOne: false;
            referencedRelation: "weddings";
            referencedColumns: ["id"];
          }
        ];
      };
      guests: {
        Row: {
          id: string;
          wedding_id: string;
          full_name: string;
          email: string | null;
          phone: string | null;
          side: string | null;
          group_name: string | null;
          guest_count: number;
          invitation_status: InvitationStatus;
          rsvp_status: RsvpStatus;
          dietary_requirements: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          wedding_id: string;
          full_name: string;
          email?: string | null;
          phone?: string | null;
          side?: string | null;
          group_name?: string | null;
          guest_count?: number;
          invitation_status?: InvitationStatus;
          rsvp_status?: RsvpStatus;
          dietary_requirements?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          wedding_id?: string;
          full_name?: string;
          email?: string | null;
          phone?: string | null;
          side?: string | null;
          group_name?: string | null;
          guest_count?: number;
          invitation_status?: InvitationStatus;
          rsvp_status?: RsvpStatus;
          dietary_requirements?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "guests_wedding_id_fkey";
            columns: ["wedding_id"];
            isOneToOne: false;
            referencedRelation: "weddings";
            referencedColumns: ["id"];
          }
        ];
      };
      announcements: {
        Row: {
          id: string;
          wedding_id: string;
          title: string;
          body: string;
          is_pinned: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          wedding_id: string;
          title: string;
          body: string;
          is_pinned?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          wedding_id?: string;
          title?: string;
          body?: string;
          is_pinned?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "announcements_wedding_id_fkey";
            columns: ["wedding_id"];
            isOneToOne: false;
            referencedRelation: "weddings";
            referencedColumns: ["id"];
          }
        ];
      };
      discussions: {
        Row: {
          id: string;
          wedding_id: string;
          author_id: string;
          body: string;
          parent_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          wedding_id: string;
          author_id: string;
          body: string;
          parent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          wedding_id?: string;
          author_id?: string;
          body?: string;
          parent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "discussions_wedding_id_fkey";
            columns: ["wedding_id"];
            isOneToOne: false;
            referencedRelation: "weddings";
            referencedColumns: ["id"];
          }
        ];
      };
      invitations: {
        Row: {
          id: string;
          wedding_id: string;
          email: string;
          role: 'admin' | 'member' | 'viewer';
          token_hash: string;
          expires_at: string;
          accepted_at: string | null;
          invited_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          wedding_id: string;
          email: string;
          role?: 'admin' | 'member' | 'viewer';
          token_hash: string;
          expires_at: string;
          accepted_at?: string | null;
          invited_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          wedding_id?: string;
          email?: string;
          role?: 'admin' | 'member' | 'viewer';
          token_hash?: string;
          expires_at?: string;
          accepted_at?: string | null;
          invited_by?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "invitations_wedding_id_fkey";
            columns: ["wedding_id"];
            isOneToOne: false;
            referencedRelation: "weddings";
            referencedColumns: ["id"];
          }
        ];
      };
      digital_invitations: {
        Row: {
          id: string;
          wedding_id: string;
          slug: string;
          template_key: string;
          theme_config: Json;
          content: Json;
          is_published: boolean;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          wedding_id: string;
          slug: string;
          template_key?: string;
          theme_config?: Json;
          content?: Json;
          is_published?: boolean;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          wedding_id?: string;
          slug?: string;
          template_key?: string;
          theme_config?: Json;
          content?: Json;
          is_published?: boolean;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "digital_invitations_wedding_id_fkey";
            columns: ["wedding_id"];
            isOneToOne: false;
            referencedRelation: "weddings";
            referencedColumns: ["id"];
          }
        ];
      };
      activity_logs: {
        Row: {
          id: string;
          wedding_id: string;
          actor_id: string | null;
          action: string;
          entity_type: string | null;
          entity_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          wedding_id: string;
          actor_id?: string | null;
          action: string;
          entity_type?: string | null;
          entity_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          wedding_id?: string;
          actor_id?: string | null;
          action?: string;
          entity_type?: string | null;
          entity_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "activity_logs_wedding_id_fkey";
            columns: ["wedding_id"];
            isOneToOne: false;
            referencedRelation: "weddings";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_wedding_member: {
        Args: { lookup_wedding_id: string };
        Returns: boolean;
      };
      has_wedding_role: {
        Args: { lookup_wedding_id: string; allowed_roles: string[] };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
