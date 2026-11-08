import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { Wedding, Expense, Task, WeddingEvent, Announcement, Guest, DigitalInvitation } from '@/types';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import {
  weddingService,
  expenseService,
  taskService,
  eventService,
  guestService,
  announcementService,
  invitationService,
} from '@/services';

interface WeddingContextType {
  wedding: Wedding;
  expenses: Expense[];
  tasks: Task[];
  events: WeddingEvent[];
  announcements: Announcement[];
  guests: Guest[];
  invitation: DigitalInvitation;
  setInvitation: React.Dispatch<React.SetStateAction<DigitalInvitation>>;
  
  // Dashboard Calculations (PRD Section 8 / superbase.md Section 11)
  metrics: {
    totalBudget: number;
    recordedExpenses: number;
    totalPaid: number;
    outstandingPayments: number;
    remainingBudget: number;
    budgetUtilization: number;
    groomExpenses: number;
    brideExpenses: number;
  };

  // Actions
  updateWedding: (updates: Partial<Wedding>) => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt' | 'weddingId'>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'weddingId'>) => Promise<void>;
  toggleTaskStatus: (id: string) => Promise<void>;
  addGuest: (guest: Omit<Guest, 'id' | 'createdAt' | 'weddingId'>) => Promise<void>;
  addAnnouncement: (title: string, content: string, isPinned?: boolean) => Promise<void>;
  refreshData: () => Promise<void>;
}

const initialWedding: Wedding = {
  id: 'wed_udaipur_2026',
  creatorId: 'usr_demo_admin_01',
  brideName: 'Priya Sharma',
  groomName: 'Rahul Verma',
  weddingDate: '2026-12-12',
  weddingTime: '18:00',
  venueName: 'The Leela Palace',
  venueAddress: 'Lake Pichola, Udaipur, Rajasthan 313001',
  mapUrl: 'https://maps.google.com/?q=The+Leela+Palace+Udaipur',
  totalBudget: 2000000,
  currency: 'INR',
  timezone: 'Asia/Kolkata',
  description: 'A grand royal celebration bringing together the Sharma and Verma families.',
  createdAt: '2026-01-10T10:00:00Z',
  updatedAt: '2026-01-10T10:00:00Z',
};

const initialExpenses: Expense[] = [
  {
    id: 'exp_1',
    weddingId: 'wed_udaipur_2026',
    categoryId: 'cat_venue',
    categoryName: 'Venue & Decoration',
    name: 'Leela Palace Banquet Advance',
    totalAmount: 800000,
    amountPaid: 500000,
    familySide: 'groom',
    creatorId: 'usr_demo_admin_01',
    vendorName: 'The Leela Palace Udaipur',
    expenseDate: '2026-02-15',
    paymentMethod: 'Bank Transfer',
    status: 'partially_paid',
    createdAt: '2026-02-15T10:00:00Z',
    updatedAt: '2026-02-15T10:00:00Z',
  },
  {
    id: 'exp_2',
    weddingId: 'wed_udaipur_2026',
    categoryId: 'cat_catering',
    categoryName: 'Catering & Food',
    name: 'Royal Rajasthan Caterers Booking',
    totalAmount: 400000,
    amountPaid: 250000,
    familySide: 'groom',
    creatorId: 'usr_demo_admin_01',
    vendorName: 'Royal Rajasthan Caterers',
    expenseDate: '2026-03-01',
    paymentMethod: 'UPI',
    status: 'partially_paid',
    createdAt: '2026-03-01T12:00:00Z',
    updatedAt: '2026-03-01T12:00:00Z',
  },
  {
    id: 'exp_3',
    weddingId: 'wed_udaipur_2026',
    categoryId: 'cat_photo',
    categoryName: 'Photography & Videography',
    name: 'Pre-wedding & Candid Photography',
    totalAmount: 150000,
    amountPaid: 150000,
    familySide: 'bride',
    creatorId: 'usr_bride_side',
    vendorName: 'Wedding Sutra Studios',
    expenseDate: '2026-03-10',
    paymentMethod: 'Credit Card',
    status: 'paid',
    createdAt: '2026-03-10T14:00:00Z',
    updatedAt: '2026-03-10T14:00:00Z',
  },
];

const initialTasks: Task[] = [
  {
    id: 'tsk_1',
    weddingId: 'wed_udaipur_2026',
    title: 'Finalize Mehendi artist contracts and itinerary',
    creatorId: 'usr_demo_admin_01',
    assigneeName: 'Sunita Sharma (Bride Side)',
    dueDate: '2026-11-01',
    priority: 'urgent',
    status: 'in_progress',
    createdAt: '2026-03-01T10:00:00Z',
  },
  {
    id: 'tsk_2',
    weddingId: 'wed_udaipur_2026',
    title: 'Book luxury transport buses for guests from Udaipur Airport',
    creatorId: 'usr_demo_admin_01',
    assigneeName: 'Vikram Verma (Groom Side)',
    dueDate: '2026-11-15',
    priority: 'high',
    status: 'to_do',
    createdAt: '2026-03-05T10:00:00Z',
  },
  {
    id: 'tsk_3',
    weddingId: 'wed_udaipur_2026',
    title: 'Order traditional sweets (mithai) hampers for invitation boxes',
    creatorId: 'usr_demo_admin_01',
    assigneeName: 'Arjun Verma',
    dueDate: '2026-10-25',
    priority: 'medium',
    status: 'completed',
    createdAt: '2026-02-20T10:00:00Z',
  },
];

const initialEvents: WeddingEvent[] = [
  {
    id: 'evt_1',
    weddingId: 'wed_udaipur_2026',
    name: 'Mehendi & Sangeet Night',
    eventType: 'sangeet',
    description: 'An evening of dance, music, henna, and royal Rajasthani folk fusion.',
    startTime: '2026-12-11T17:00:00',
    endTime: '2026-12-11T23:00:00',
    venueName: 'Courtyard Lawn, The Leela Palace',
    venueAddress: 'Udaipur, Rajasthan',
    createdAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 'evt_2',
    weddingId: 'wed_udaipur_2026',
    name: 'Wedding Ceremony (Pheras)',
    eventType: 'wedding_ceremony',
    description: 'Vedic rituals and sacred vows by the lake at sunset.',
    startTime: '2026-12-12T17:30:00',
    endTime: '2026-12-12T21:30:00',
    venueName: 'Mandap by Lake Pichola',
    venueAddress: 'Udaipur, Rajasthan',
    createdAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 'evt_3',
    weddingId: 'wed_udaipur_2026',
    name: 'Grand Reception Dinner',
    eventType: 'reception',
    description: 'Celebration dinner with family, friends, live orchestra, and royal banquet.',
    startTime: '2026-12-13T19:00:00',
    venueName: 'The Grand Ballroom',
    venueAddress: 'Udaipur, Rajasthan',
    createdAt: '2026-02-01T10:00:00Z',
  },
];

const initialAnnouncements: Announcement[] = [
  {
    id: 'ann_1',
    weddingId: 'wed_udaipur_2026',
    title: 'Dress Code Guide for Sangeet & Reception',
    content: 'For Sangeet: Royal Velvet & Mirror Work; For Reception: Indo-Western Tuxedos and Silk Sarees.',
    authorId: 'usr_demo_admin_01',
    authorName: 'Arjun Verma (Groom)',
    isPinned: true,
    createdAt: '2026-03-01T11:00:00Z',
  },
  {
    id: 'ann_2',
    weddingId: 'wed_udaipur_2026',
    title: 'Room Allotment List Updated in Udaipur',
    content: 'All outstation guests have their room allocations confirmed at Leela Palace. Check with the coordinator desk.',
    authorId: 'usr_demo_admin_01',
    authorName: 'Sunita Sharma (Bride Side)',
    isPinned: false,
    createdAt: '2026-03-12T09:30:00Z',
  },
];

const initialGuests: Guest[] = [
  {
    id: 'gst_1',
    weddingId: 'wed_udaipur_2026',
    fullName: 'Rajesh & Kavita Singhania',
    phone: '+91 98200 11223',
    email: 'rajesh.singhania@example.com',
    familySide: 'groom',
    groupName: 'Singhania Family (4)',
    invitationStatus: 'shared',
    createdAt: '2026-02-10T10:00:00Z',
  },
  {
    id: 'gst_2',
    weddingId: 'wed_udaipur_2026',
    fullName: 'Dr. Anand & Meera Kapoor',
    phone: '+91 98111 22334',
    email: 'anand.kapoor@example.com',
    familySide: 'bride',
    groupName: 'Kapoor Family (2)',
    invitationStatus: 'shared',
    createdAt: '2026-02-12T10:00:00Z',
  },
  {
    id: 'gst_3',
    weddingId: 'wed_udaipur_2026',
    fullName: 'Rohit & Shreya Malhotra',
    phone: '+91 97110 55667',
    familySide: 'groom',
    groupName: 'College Friends',
    invitationStatus: 'not_sent',
    createdAt: '2026-02-15T10:00:00Z',
  },
];

const initialInvitation: DigitalInvitation = {
  id: 'inv_1',
  weddingId: 'wed_udaipur_2026',
  slug: 'priya-rahul-wedding',
  templateKey: 'royal_indian',
  themeConfig: {
    primaryColor: '#722F37',
    accentColor: '#D4AF37',
    fontFamily: 'Playfair Display',
  },
  content: {
    welcomeMessage: 'Together with their families, Priya & Rahul request the honour of your presence at their wedding celebration.',
    brideParents: 'Mr. & Mrs. R.K. Sharma',
    groomParents: 'Mr. & Mrs. O.P. Verma',
    rsvpDeadline: '2026-11-20',
    customNote: 'No boxed gifts please, your blessings are our greatest treasure.',
  },
  isPublished: true,
  publishedAt: '2026-02-01T12:00:00Z',
  createdAt: '2026-02-01T10:00:00Z',
};

const WeddingContext = createContext<WeddingContextType | undefined>(undefined);

export const WeddingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wedding, setWedding] = useState<Wedding>(initialWedding);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [events, setEvents] = useState<WeddingEvent[]>(initialEvents);
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [guests, setGuests] = useState<Guest[]>(initialGuests);
  const [invitation, setInvitation] = useState<DigitalInvitation>(initialInvitation);

  const refreshData = useCallback(async () => {
    if (!isSupabaseConfigured) return;

    try {
      const weddings = await weddingService.getUserWeddings();
      if (weddings.length > 0) {
        const w = weddings[0];
        setWedding({
          id: w.id,
          creatorId: w.created_by,
          brideName: w.partner_one_name || 'Bride',
          groomName: w.partner_two_name || 'Groom',
          weddingDate: w.wedding_date || '',
          weddingTime: w.wedding_time || undefined,
          venueName: w.venue_name || '',
          venueAddress: w.venue_address || '',
          mapUrl: w.map_url || undefined,
          totalBudget: Number(w.budget) || 0,
          currency: w.currency_code || 'INR',
          timezone: 'Asia/Kolkata',
          description: w.description || w.notes || undefined,
          couplePhotoUrl: w.couple_photo_url || undefined,
          createdAt: w.created_at,
          updatedAt: w.updated_at,
        });

        // Load related data for this wedding
        const [dbExpenses, dbTasks, dbEvents, dbGuests, dbAnnouncements, dbInvite] = await Promise.all([
          expenseService.getExpenses(w.id),
          taskService.getTasks(w.id),
          eventService.getEvents(w.id),
          guestService.getGuests(w.id),
          announcementService.getAnnouncements(w.id),
          invitationService.getDigitalInvitation(w.id),
        ]);

        if (dbExpenses.length > 0) {
          setExpenses(
            dbExpenses.map((e) => ({
              id: e.id,
              weddingId: e.wedding_id,
              categoryId: e.category,
              categoryName: e.category,
              name: e.title,
              description: e.notes || undefined,
              totalAmount: Number(e.amount),
              amountPaid: Number(e.paid_amount),
              familySide: (e.family_side as 'bride' | 'groom') || 'groom',
              creatorId: e.created_by || '',
              vendorName: e.vendor_name || undefined,
              expenseDate: e.expense_date,
              dueDate: e.due_date || undefined,
              paymentMethod: e.payment_method || undefined,
              receiptPath: e.receipt_url || undefined,
              status: e.payment_status === 'partially_paid' ? 'partially_paid' : e.payment_status === 'paid' ? 'paid' : 'pending',
              createdAt: e.created_at,
              updatedAt: e.updated_at,
            }))
          );
        }

        if (dbTasks.length > 0) {
          setTasks(
            dbTasks.map((t) => ({
              id: t.id,
              weddingId: t.wedding_id,
              title: t.title,
              description: t.description || undefined,
              assigneeId: t.assigned_to || undefined,
              creatorId: t.created_by || '',
              dueDate: t.due_date || '',
              priority: t.priority as any,
              status: t.status === 'in_progress' ? 'in_progress' : t.status === 'completed' ? 'completed' : 'to_do',
              createdAt: t.created_at,
            }))
          );
        }

        if (dbEvents.length > 0) {
          setEvents(
            dbEvents.map((ev) => ({
              id: ev.id,
              weddingId: ev.wedding_id,
              name: ev.title,
              eventType: (ev.event_type as any) || 'custom',
              description: ev.description || undefined,
              startTime: ev.start_at,
              endTime: ev.end_at || undefined,
              venueName: ev.venue_name || '',
              venueAddress: ev.venue_address || '',
              mapUrl: ev.map_url || undefined,
              organizer: ev.organizer || undefined,
              createdAt: ev.created_at,
            }))
          );
        }

        if (dbGuests.length > 0) {
          setGuests(
            dbGuests.map((g) => ({
              id: g.id,
              weddingId: g.wedding_id,
              fullName: g.full_name,
              phone: g.phone || undefined,
              email: g.email || undefined,
              familySide: (g.side as 'bride' | 'groom') || 'groom',
              groupName: g.group_name || undefined,
              notes: g.notes || undefined,
              invitationStatus: g.invitation_status === 'sent' || g.invitation_status === 'delivered' ? 'shared' : 'not_sent',
              createdAt: g.created_at,
            }))
          );
        }

        if (dbAnnouncements.length > 0) {
          setAnnouncements(
            dbAnnouncements.map((a) => ({
              id: a.id,
              weddingId: a.wedding_id,
              title: a.title,
              content: a.body,
              authorId: a.created_by || '',
              authorName: 'Family Member',
              isPinned: a.is_pinned,
              createdAt: a.created_at,
            }))
          );
        }

        if (dbInvite) {
          setInvitation({
            id: dbInvite.id,
            weddingId: dbInvite.wedding_id,
            slug: dbInvite.slug,
            templateKey: (dbInvite.template_key as any) || 'royal_indian',
            themeConfig: (dbInvite.theme_config as any) || initialInvitation.themeConfig,
            content: (dbInvite.content as any) || initialInvitation.content,
            isPublished: dbInvite.is_published,
            publishedAt: dbInvite.published_at || undefined,
            createdAt: dbInvite.created_at,
          });
        }
      }
    } catch (err) {
      console.warn('Could not sync with Supabase (using local demo cache):', err);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Exact calculations adhering strictly to PRD Section 1 & Section 8 & superbase.md Section 11
  const metrics = useMemo(() => {
    const totalBudget = wedding.totalBudget || 0;
    
    // Recorded Expenses: sum of expense amounts, regardless of payment status
    const recordedExpenses = expenses.reduce((acc, curr) => acc + (Number(curr.totalAmount) || 0), 0);
    
    // Total Paid: sum of actual paid amounts
    const totalPaid = expenses.reduce((acc, curr) => acc + (Number(curr.amountPaid) || 0), 0);
    
    // Outstanding: sum of unpaid balances
    const outstandingPayments = Math.max(0, recordedExpenses - totalPaid);
    
    // Remaining Budget: total budget minus recorded expenses
    const remainingBudget = totalBudget - recordedExpenses;
    
    // Budget Utilization: recorded expenses / budget * 100
    const budgetUtilization = totalBudget > 0 ? (recordedExpenses / totalBudget) * 100 : 0;

    // Groom's and Bride's family spending
    const groomExpenses = expenses
      .filter((e) => e.familySide === 'groom')
      .reduce((acc, curr) => acc + (Number(curr.totalAmount) || 0), 0);

    const brideExpenses = expenses
      .filter((e) => e.familySide === 'bride')
      .reduce((acc, curr) => acc + (Number(curr.totalAmount) || 0), 0);

    return {
      totalBudget,
      recordedExpenses,
      totalPaid,
      outstandingPayments,
      remainingBudget,
      budgetUtilization,
      groomExpenses,
      brideExpenses,
    };
  }, [wedding.totalBudget, expenses]);

  const updateWedding = async (updates: Partial<Wedding>) => {
    setWedding((prev) => ({ ...prev, ...updates }));

    if (isSupabaseConfigured && wedding.id && !wedding.id.startsWith('wed_demo')) {
      try {
        await weddingService.updateWedding(wedding.id, {
          name: `${updates.brideName || wedding.brideName} & ${updates.groomName || wedding.groomName}'s Wedding`,
          partner_one_name: updates.brideName || wedding.brideName,
          partner_two_name: updates.groomName || wedding.groomName,
          wedding_date: updates.weddingDate || wedding.weddingDate,
          wedding_time: updates.weddingTime || wedding.weddingTime,
          venue_name: updates.venueName || wedding.venueName,
          venue_address: updates.venueAddress || wedding.venueAddress,
          budget: updates.totalBudget !== undefined ? updates.totalBudget : wedding.totalBudget,
          description: updates.description !== undefined ? updates.description : wedding.description,
        });
      } catch (e) {
        console.warn('Failed to update wedding in Supabase:', e);
      }
    }
  };

  const addExpense = async (newExpense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt' | 'weddingId'>) => {
    const tempId = 'exp_' + Math.random().toString(36).substring(2, 9);
    const expenseItem: Expense = {
      ...newExpense,
      id: tempId,
      weddingId: wedding.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setExpenses((prev) => [expenseItem, ...prev]);

    if (isSupabaseConfigured && !wedding.id.startsWith('wed_demo') && !wedding.id.startsWith('wed_udaipur')) {
      try {
        const { data: user } = await supabase.auth.getUser();
        const created = await expenseService.createExpense({
          wedding_id: wedding.id,
          title: newExpense.name,
          category: newExpense.categoryName || 'General',
          amount: newExpense.totalAmount,
          paid_amount: newExpense.amountPaid,
          payment_status: newExpense.status === 'partially_paid' ? 'partially_paid' : newExpense.status === 'paid' ? 'paid' : 'pending',
          expense_date: newExpense.expenseDate,
          due_date: newExpense.dueDate || null,
          vendor_name: newExpense.vendorName || null,
          payment_method: newExpense.paymentMethod || null,
          notes: newExpense.description || null,
          family_side: newExpense.familySide,
          created_by: user?.user?.id || null,
        });
        setExpenses((prev) => prev.map((e) => (e.id === tempId ? { ...e, id: created.id } : e)));
      } catch (err) {
        console.warn('Failed to persist expense to Supabase:', err);
      }
    }
  };

  const deleteExpense = async (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));

    if (isSupabaseConfigured && !id.startsWith('exp_')) {
      try {
        await expenseService.deleteExpense(id);
      } catch (err) {
        console.warn('Failed to delete expense from Supabase:', err);
      }
    }
  };

  const addTask = async (newTask: Omit<Task, 'id' | 'createdAt' | 'weddingId'>) => {
    const tempId = 'tsk_' + Math.random().toString(36).substring(2, 9);
    const taskItem: Task = {
      ...newTask,
      id: tempId,
      weddingId: wedding.id,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [taskItem, ...prev]);

    if (isSupabaseConfigured && !wedding.id.startsWith('wed_demo') && !wedding.id.startsWith('wed_udaipur')) {
      try {
        const { data: user } = await supabase.auth.getUser();
        const created = await taskService.createTask({
          wedding_id: wedding.id,
          title: newTask.title,
          description: newTask.description || null,
          status: newTask.status === 'to_do' ? 'todo' : (newTask.status as any),
          priority: newTask.priority,
          due_date: newTask.dueDate || null,
          created_by: user?.user?.id || null,
        });
        setTasks((prev) => prev.map((t) => (t.id === tempId ? { ...t, id: created.id } : t)));
      } catch (err) {
        console.warn('Failed to persist task to Supabase:', err);
      }
    }
  };

  const toggleTaskStatus = async (id: string) => {
    const target = tasks.find((t) => t.id === id);
    const nextStatus = target?.status === 'completed' ? 'in_progress' : 'completed';

    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: nextStatus } : t))
    );

    if (isSupabaseConfigured && !id.startsWith('tsk_')) {
      try {
        await taskService.updateTask(id, {
          status: nextStatus === 'completed' ? 'completed' : 'in_progress',
        });
      } catch (err) {
        console.warn('Failed to update task status in Supabase:', err);
      }
    }
  };

  const addGuest = async (newGuest: Omit<Guest, 'id' | 'createdAt' | 'weddingId'>) => {
    const tempId = 'gst_' + Math.random().toString(36).substring(2, 9);
    const guestItem: Guest = {
      ...newGuest,
      id: tempId,
      weddingId: wedding.id,
      createdAt: new Date().toISOString(),
    };
    setGuests((prev) => [guestItem, ...prev]);

    if (isSupabaseConfigured && !wedding.id.startsWith('wed_demo') && !wedding.id.startsWith('wed_udaipur')) {
      try {
        const { data: user } = await supabase.auth.getUser();
        const created = await guestService.createGuest({
          wedding_id: wedding.id,
          full_name: newGuest.fullName,
          phone: newGuest.phone || null,
          email: newGuest.email || null,
          side: newGuest.familySide,
          group_name: newGuest.groupName || null,
          notes: newGuest.notes || null,
          guest_count: 1,
          invitation_status: newGuest.invitationStatus === 'shared' ? 'sent' : 'not_sent',
          created_by: user?.user?.id || null,
        });
        setGuests((prev) => prev.map((g) => (g.id === tempId ? { ...g, id: created.id } : g)));
      } catch (err) {
        console.warn('Failed to persist guest to Supabase:', err);
      }
    }
  };

  const addAnnouncement = async (title: string, content: string, isPinned = false) => {
    const tempId = 'ann_' + Math.random().toString(36).substring(2, 9);
    const ann: Announcement = {
      id: tempId,
      weddingId: wedding.id,
      title,
      content,
      authorId: 'usr_demo',
      authorName: 'Wedding Admin',
      isPinned,
      createdAt: new Date().toISOString(),
    };
    setAnnouncements((prev) => [ann, ...prev]);

    if (isSupabaseConfigured && !wedding.id.startsWith('wed_demo') && !wedding.id.startsWith('wed_udaipur')) {
      try {
        const { data: user } = await supabase.auth.getUser();
        const created = await announcementService.createAnnouncement({
          wedding_id: wedding.id,
          title,
          body: content,
          is_pinned: isPinned,
          created_by: user?.user?.id || null,
        });
        setAnnouncements((prev) => prev.map((a) => (a.id === tempId ? { ...a, id: created.id } : a)));
      } catch (err) {
        console.warn('Failed to persist announcement to Supabase:', err);
      }
    }
  };

  return (
    <WeddingContext.Provider
      value={{
        wedding,
        expenses,
        tasks,
        events,
        announcements,
        guests,
        invitation,
        setInvitation,
        metrics,
        updateWedding,
        addExpense,
        deleteExpense,
        addTask,
        toggleTaskStatus,
        addGuest,
        addAnnouncement,
        refreshData,
      }}
    >
      {children}
    </WeddingContext.Provider>
  );
};

export const useWedding = () => {
  const context = useContext(WeddingContext);
  if (!context) {
    throw new Error('useWedding must be used within a WeddingProvider');
  }
  return context;
};
