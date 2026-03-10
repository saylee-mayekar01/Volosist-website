// Global Store for Real-time Data Sync between User Dashboard and Admin Panel
// This simulates a backend database with localStorage persistence

export interface User {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  status: 'active' | 'inactive' | 'suspended';
  plan: string;
  totalSpent: number;
  joinDate: string;
  lastActive: string;
  services: number;
  avatar?: string;
}

export interface Payment {
  id: string;
  orderId: string;
  cashfreeOrderId?: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed' | 'refunded' | 'refund_pending' | 'refund_cancelled';
  method: 'UPI' | 'Card' | 'Net Banking' | 'Wallet';
  date: string;
  service: string;
  plan: string;
  refundReason?: string;
  refundNotes?: string;
  refundRequestedAt?: string;
  refundResolvedAt?: string;
  items?: PaymentItem[];
}

export interface PaymentItem {
  name: string;
  plan: string;
  price: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  paymentId: string;
  userId: string;
  userName: string;
  userEmail: string;
  date: string;
  dueDate: string;
  items: { name: string; plan: string; quantity: number; unitPrice: number; total: number }[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'paid' | 'pending' | 'overdue';
  paidDate?: string;
  customerInfo: {
    name: string;
    email: string;
    company: string;
    address: string;
    gst?: string;
  };
}

export interface ServiceSubscription {
  id: string;
  userId: string;
  serviceId: string;
  serviceName: string;
  plan: string;
  status: 'active' | 'expiring' | 'expired';
  startDate: string;
  expiryDate: string;
  monthlyPrice: number;
  renewalCost: number;
}

export interface ServiceCatalogPlan {
  name: string;
  price: number;
  features: string[];
  limit: number;
}

export interface ServiceCatalogItem {
  id: string;
  name: string;
  description: string;
  plans: ServiceCatalogPlan[];
}

export interface Notification {
  id: string;
  userId?: string; // null for admin notifications
  type: 'payment' | 'subscription' | 'user' | 'system' | 'alert';
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  action?: { label: string; url: string };
}

export interface ActivityLog {
  id: string;
  userId?: string;
  adminId?: string;
  action: string;
  details: string;
  timestamp: string;
  type: 'user' | 'admin' | 'system';
}

// Initial sample data
const INITIAL_USERS: User[] = [];

const INITIAL_PAYMENTS: Payment[] = [];

const INITIAL_INVOICES: Invoice[] = [];

const INITIAL_NOTIFICATIONS: Notification[] = [];

const INITIAL_ACTIVITY_LOG: ActivityLog[] = [];

const INITIAL_SERVICE_CATALOG: ServiceCatalogItem[] = [
  {
    id: 'sales',
    name: 'Sales & Lead Automation',
    description: 'AI-powered lead capture, CRM automation & outbound calling.',
    plans: [
      { name: 'Basic', price: 490, features: ['5,000 leads/month', 'Email Follow-ups', 'Basic CRM Sync'], limit: 5000 },
      { name: 'Pro', price: 1490, features: ['20,000 leads/month', 'Email + WhatsApp + Calls', 'Full CRM Automation', 'AI Chatbot'], limit: 20000 },
      { name: 'Business', price: 4990, features: ['Unlimited leads', 'All channels', 'Priority Support', 'Custom Integration'], limit: 100000 },
    ],
  },
  {
    id: 'voice',
    name: 'AI Voice & Calling',
    description: 'Intelligent voice automation for inbound/outbound calls.',
    plans: [
      { name: 'Basic', price: 790, features: ['1,000 minutes/month', 'Inbound Only', 'Basic Transcription'], limit: 1000 },
      { name: 'Pro', price: 1990, features: ['5,000 minutes/month', 'Inbound + Outbound', 'Full Transcription', 'Sentiment Analysis'], limit: 5000 },
      { name: 'Business', price: 4990, features: ['Unlimited minutes', 'All features', 'Human Handoff', 'Custom Voice'], limit: 50000 },
    ],
  },
  {
    id: 'marketing',
    name: 'Marketing & Content',
    description: 'AI content generation, social media & ads automation.',
    plans: [
      { name: 'Basic', price: 490, features: ['50 posts/month', 'AI Content Gen', '2 Social Accounts'], limit: 50 },
      { name: 'Pro', price: 1290, features: ['200 posts/month', 'All content types', '10 Social Accounts', 'Ad Automation'], limit: 200 },
      { name: 'Business', price: 3990, features: ['Unlimited posts', 'Full automation', 'Unlimited accounts', 'SEO Suite'], limit: 1000 },
    ],
  },
  {
    id: 'business',
    name: 'Business Solutions',
    description: 'Web development, design, virtual assistants & more.',
    plans: [
      { name: 'Basic', price: 990, features: ['1 Website', 'Basic Design', 'Email Support'], limit: 1 },
      { name: 'Pro', price: 2490, features: ['3 Websites', 'Premium Design', 'Virtual Assistant', 'Priority Support'], limit: 3 },
      { name: 'Business', price: 6990, features: ['Unlimited Sites', 'Full VA Suite', 'Dedicated Manager', 'Custom Solutions'], limit: 10 },
    ],
  },
];

// Store class with event system for real-time updates
type StoreListener = () => void;

const isRevenueContributingStatus = (status: Payment['status']) =>
  status === 'completed' || status === 'refund_pending' || status === 'refund_cancelled';

const normalizeStoredPaymentStatus = (status: unknown): Payment['status'] => {
  const normalized = String(status || '').trim().toLowerCase();

  if (normalized === 'completed' || normalized === 'success' || normalized === 'paid') {
    return 'completed';
  }
  if (normalized === 'pending') {
    return 'pending';
  }
  if (normalized === 'failed') {
    return 'failed';
  }
  if (normalized === 'refund_pending' || normalized === 'refund_requested' || normalized === 'requested') {
    return 'refund_pending';
  }
  if (normalized === 'refund_cancelled' || normalized === 'refund_canceled' || normalized === 'cancelled') {
    return 'refund_cancelled';
  }
  if (normalized === 'refunded' || normalized === 'refund') {
    return 'refunded';
  }

  return 'failed';
};

const getPaymentNotificationTitle = (status: Payment['status']) => {
  if (status === 'completed') return 'Payment Received';
  if (status === 'pending') return 'Payment Pending';
  if (status === 'failed') return 'Payment Failed';
  if (status === 'refund_pending') return 'Refund Requested';
  if (status === 'refund_cancelled') return 'Refund Request Cancelled';
  return 'Payment Refunded';
};

class GlobalStore {
  private users: User[] = [];
  private payments: Payment[] = [];
  private invoices: Invoice[] = [];
  private notifications: Notification[] = [];
  private activityLog: ActivityLog[] = [];
  private serviceCatalog: ServiceCatalogItem[] = [];
  private listeners: Set<StoreListener> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private removeLegacyDemoData() {
    const DEMO_USER_IDS = new Set(['user_001', 'user_002', 'user_003', 'user_004', 'user_005', 'dev-user']);
    const DEMO_PAYMENT_IDS = new Set(['pay_001', 'pay_002', 'pay_003', 'pay_004', 'pay_005']);
    const DEMO_NOTIFICATION_IDS = new Set(['notif_admin_001', 'notif_admin_002', 'notif_admin_003']);
    const DEMO_ACTIVITY_IDS = new Set(['log_001', 'log_002', 'log_003']);

    const usersBefore = this.users.length;
    const paymentsBefore = this.payments.length;
    const notificationsBefore = this.notifications.length;
    const activityBefore = this.activityLog.length;

    this.users = this.users.filter((user) => !DEMO_USER_IDS.has(user.id));
    this.payments = this.payments.filter((payment) => !DEMO_PAYMENT_IDS.has(payment.id));
    this.notifications = this.notifications.filter((notification) => !DEMO_NOTIFICATION_IDS.has(notification.id));
    this.activityLog = this.activityLog.filter((log) => !DEMO_ACTIVITY_IDS.has(log.id));

    return (
      usersBefore !== this.users.length ||
      paymentsBefore !== this.payments.length ||
      notificationsBefore !== this.notifications.length ||
      activityBefore !== this.activityLog.length
    );
  }

  refreshFromStorage() {
    this.loadFromStorage();
    this.notify();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('volosist_store');
      if (stored) {
        const data = JSON.parse(stored);
        this.users = data.users || INITIAL_USERS;
        this.payments = (Array.isArray(data.payments) ? data.payments : INITIAL_PAYMENTS).map((payment: any) => ({
          ...payment,
          status: normalizeStoredPaymentStatus(payment?.status),
        })) as Payment[];
        this.invoices = data.invoices || INITIAL_INVOICES;
        this.notifications = data.notifications || INITIAL_NOTIFICATIONS;
        this.activityLog = data.activityLog || INITIAL_ACTIVITY_LOG;
        this.serviceCatalog = data.serviceCatalog || INITIAL_SERVICE_CATALOG;

        const removedDemoData = this.removeLegacyDemoData();
        if (removedDemoData) {
          this.saveToStorage();
        }
      } else {
        this.users = [...INITIAL_USERS];
        this.payments = [...INITIAL_PAYMENTS];
        this.invoices = [...INITIAL_INVOICES];
        this.notifications = [...INITIAL_NOTIFICATIONS];
        this.activityLog = [...INITIAL_ACTIVITY_LOG];
        this.serviceCatalog = [...INITIAL_SERVICE_CATALOG];
        this.saveToStorage();
      }
    } catch {
      this.users = [...INITIAL_USERS];
      this.payments = [...INITIAL_PAYMENTS];
      this.invoices = [...INITIAL_INVOICES];
      this.notifications = [...INITIAL_NOTIFICATIONS];
      this.activityLog = [...INITIAL_ACTIVITY_LOG];
      this.serviceCatalog = [...INITIAL_SERVICE_CATALOG];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('volosist_store', JSON.stringify({
        users: this.users,
        payments: this.payments,
        invoices: this.invoices,
        notifications: this.notifications,
        activityLog: this.activityLog,
        serviceCatalog: this.serviceCatalog,
      }));
    } catch (e) {
      console.error('Failed to save to storage:', e);
    }
  }

  private notify() {
    this.listeners.forEach(listener => listener());
  }

  // Subscribe to store changes
  subscribe(listener: StoreListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Reset to initial data
  reset() {
    this.users = [...INITIAL_USERS];
    this.payments = [...INITIAL_PAYMENTS];
    this.invoices = [];
    this.notifications = [...INITIAL_NOTIFICATIONS];
    this.activityLog = [...INITIAL_ACTIVITY_LOG];
    this.serviceCatalog = [...INITIAL_SERVICE_CATALOG];
    this.saveToStorage();
    this.notify();
  }

  // Service Catalog
  getServiceCatalog(): ServiceCatalogItem[] {
    return this.serviceCatalog.map((service) => ({
      ...service,
      plans: service.plans.map((plan) => ({ ...plan })),
    }));
  }

  updateServiceCatalogItem(serviceId: string, updates: Partial<Pick<ServiceCatalogItem, 'name' | 'description'>> & { plans?: ServiceCatalogPlan[] }) {
    const serviceIndex = this.serviceCatalog.findIndex((service) => service.id === serviceId);
    if (serviceIndex === -1) return;

    this.serviceCatalog[serviceIndex] = {
      ...this.serviceCatalog[serviceIndex],
      ...updates,
      plans: updates.plans ? updates.plans.map((plan) => ({ ...plan })) : this.serviceCatalog[serviceIndex].plans,
    };

    this.addActivity({
      adminId: 'admin',
      action: 'service_catalog_updated',
      details: `Updated service catalog for ${this.serviceCatalog[serviceIndex].name}`,
      type: 'admin',
    });

    this.saveToStorage();
    this.notify();
  }

  addServiceCatalogItem(service: Omit<ServiceCatalogItem, 'id'> & { id?: string }) {
    const baseId = (service.id || service.name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let nextId = baseId || `service-${Date.now()}`;
    let counter = 1;
    while (this.serviceCatalog.some((item) => item.id === nextId)) {
      nextId = `${baseId || 'service'}-${counter++}`;
    }

    const newService: ServiceCatalogItem = {
      id: nextId,
      name: service.name,
      description: service.description,
      plans: service.plans.map((plan) => ({ ...plan })),
    };

    this.serviceCatalog.push(newService);

    this.addActivity({
      adminId: 'admin',
      action: 'service_catalog_created',
      details: `Created new service catalog item: ${newService.name}`,
      type: 'admin',
    });

    this.saveToStorage();
    this.notify();

    return newService;
  }

  deleteServiceCatalogItem(serviceId: string) {
    const target = this.serviceCatalog.find((service) => service.id === serviceId);
    if (!target) return;

    this.serviceCatalog = this.serviceCatalog.filter((service) => service.id !== serviceId);

    this.addActivity({
      adminId: 'admin',
      action: 'service_catalog_deleted',
      details: `Deleted service catalog item: ${target.name}`,
      type: 'admin',
    });

    this.saveToStorage();
    this.notify();
  }

  upsertUserProfile(profile: {
    id: string;
    email: string;
    name?: string;
    company?: string;
    phone?: string;
    plan?: string;
  }) {
    const safeId = String(profile.id || '').trim();
    const safeEmail = String(profile.email || '').trim().toLowerCase();
    if (!safeId || !safeEmail) return null;

    const existingIndex = this.users.findIndex(
      (user) => user.id === safeId || user.email.toLowerCase() === safeEmail
    );

    const fallbackName = safeEmail.split('@')[0] || 'User';
    const nowIso = new Date().toISOString();

    if (existingIndex === -1) {
      const newUser: User = {
        id: safeId,
        name: profile.name?.trim() || fallbackName,
        email: safeEmail,
        company: profile.company?.trim() || 'N/A',
        phone: profile.phone?.trim() || 'N/A',
        status: 'active',
        plan: profile.plan?.trim() || 'Basic',
        totalSpent: 0,
        joinDate: nowIso,
        lastActive: nowIso,
        services: 0,
      };

      this.users.push(newUser);
      this.addActivity({
        userId: newUser.id,
        action: 'user_synced_from_auth',
        details: `Synced profile for ${newUser.email}`,
        type: 'user',
      });
      this.saveToStorage();
      this.notify();
      return newUser;
    }

    const existingUser = this.users[existingIndex];
    const updatedUser: User = {
      ...existingUser,
      id: safeId,
      email: safeEmail,
      name: profile.name?.trim() || existingUser.name || fallbackName,
      company: profile.company?.trim() || existingUser.company || 'N/A',
      phone: profile.phone?.trim() || existingUser.phone || 'N/A',
      plan: profile.plan?.trim() || existingUser.plan || 'Basic',
      status: 'active',
      lastActive: nowIso,
    };

    this.users[existingIndex] = updatedUser;
    this.saveToStorage();
    this.notify();
    return updatedUser;
  }

  // Users
  getUsers(): User[] {
    return [...this.users];
  }

  getUser(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  addUser(user: Omit<User, 'id'>): User {
    const newUser: User = { ...user, id: `user_${Date.now()}` };
    this.users.push(newUser);
    this.addNotification({
      type: 'user',
      title: 'New User Registered',
      message: `${user.name} from ${user.company} joined the platform`,
      read: false,
    });
    this.addActivity({
      userId: newUser.id,
      action: 'user_registered',
      details: `${user.name} registered with ${user.plan} plan`,
      type: 'user',
    });
    this.saveToStorage();
    this.notify();
    return newUser;
  }

  updateUser(id: string, updates: Partial<User>) {
    const index = this.users.findIndex(u => u.id === id);
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...updates };
      this.saveToStorage();
      this.notify();
    }
  }

  // Payments
  getPayments(): Payment[] {
    return [...this.payments];
  }

  getPaymentsByUser(userId: string): Payment[] {
    return this.payments.filter(p => p.userId === userId);
  }

  addPayment(payment: Omit<Payment, 'id' | 'orderId'>): Payment {
    const orderNum = this.payments.length + 1001;

    this.upsertUserProfile({
      id: payment.userId,
      email: payment.userEmail,
      name: payment.userName,
      plan: payment.plan,
    });

    const newPayment: Payment = {
      ...payment,
      id: `pay_${Date.now()}`,
      orderId: `ORD-2026-${orderNum}`,
    };
    this.payments.unshift(newPayment);

    // Update user stats
    if (isRevenueContributingStatus(payment.status)) {
      const user = this.users.find(u => u.id === payment.userId);
      if (user) {
        user.totalSpent += payment.amount;
        user.services += 1;
        user.lastActive = new Date().toISOString();
      }
    }

    // Create invoice for completed payments
    if (payment.status === 'completed') {
      this.createInvoiceFromPayment(newPayment);
    }

    // Add notification
    this.addNotification({
      type: 'payment',
      title: getPaymentNotificationTitle(payment.status),
      message: `${payment.userName} - ₹${payment.amount.toLocaleString()} for ${payment.service}`,
      read: false,
    });

    this.addActivity({
      userId: payment.userId,
      action: `payment_${payment.status}`,
      details: `₹${payment.amount.toLocaleString()} for ${payment.service} - ${payment.plan} Plan`,
      type: 'user',
    });

    this.saveToStorage();
    this.notify();
    return newPayment;
  }

  updatePaymentStatus(
    paymentId: string,
    status: Payment['status'],
    options?: { reason?: string; notes?: string }
  ) {
    const payment = this.payments.find(p => p.id === paymentId);
    if (payment) {
      const oldStatus = payment.status;
      const nowIso = new Date().toISOString();
      const wasRevenueContributing = isRevenueContributingStatus(oldStatus);
      const isRevenueContributing = isRevenueContributingStatus(status);

      payment.status = status;

      if (status === 'refund_pending') {
        payment.refundReason = options?.reason?.trim() || payment.refundReason;
        payment.refundNotes = options?.notes?.trim() || payment.refundNotes;
        payment.refundRequestedAt = payment.refundRequestedAt || nowIso;
        payment.refundResolvedAt = undefined;
      }

      if (status === 'refund_cancelled') {
        payment.refundResolvedAt = nowIso;
      }

      if (status === 'refunded') {
        payment.refundResolvedAt = nowIso;
      }

      if (status === 'completed') {
        payment.refundResolvedAt = undefined;
      }

      // If marking as completed, create invoice
      if (status === 'completed' && oldStatus !== 'completed') {
        const existingInvoice = this.invoices.find((invoice) => invoice.paymentId === payment.id);
        if (!existingInvoice) {
          this.createInvoiceFromPayment(payment);
        }
      }

      if (wasRevenueContributing !== isRevenueContributing) {
        const user = this.users.find((u) => u.id === payment.userId);
        if (user) {
          if (isRevenueContributing) {
            user.totalSpent += payment.amount;
            user.services += 1;
          } else {
            user.totalSpent = Math.max(0, user.totalSpent - payment.amount);
            user.services = Math.max(0, user.services - 1);
          }
          user.lastActive = nowIso;
        }
      }

      const linkedInvoice = this.invoices.find((invoice) => invoice.paymentId === payment.id);
      if (linkedInvoice && status === 'refunded') {
        linkedInvoice.status = 'overdue';
        linkedInvoice.paidDate = undefined;
      }
      if (linkedInvoice && status === 'completed') {
        linkedInvoice.status = 'paid';
        linkedInvoice.paidDate = nowIso.split('T')[0];
      }

      this.addNotification({
        type: 'payment',
        title: getPaymentNotificationTitle(status),
        message: `${payment.userName} - ₹${payment.amount.toLocaleString()} for ${payment.service}`,
        read: false,
      });

      const reasonText = options?.reason ? ` (reason: ${options.reason})` : '';

      this.addActivity({
        adminId: 'admin',
        action: `payment_status_updated`,
        details: `Payment ${payment.orderId} status changed from ${oldStatus} to ${status}${reasonText}`,
        type: 'admin',
      });

      this.saveToStorage();
      this.notify();
    }
  }

  // Invoices
  getInvoices(): Invoice[] {
    return [...this.invoices];
  }

  getInvoicesByUser(userId: string): Invoice[] {
    return this.invoices.filter(i => i.userId === userId);
  }

  private createInvoiceFromPayment(payment: Payment): Invoice {
    const invoiceNum = this.invoices.length + 1;
    const user = this.users.find(u => u.id === payment.userId);
    
    // Convert PaymentItems to Invoice items format
    const invoiceItems = payment.items 
      ? payment.items.map(item => ({ 
          name: item.name, 
          plan: item.plan, 
          quantity: 1, 
          unitPrice: item.price, 
          total: item.price 
        }))
      : [{ name: payment.service, plan: payment.plan, quantity: 1, unitPrice: payment.amount, total: payment.amount }];
    
    const invoice: Invoice = {
      id: `inv_${Date.now()}`,
      invoiceNumber: `INV-2026-${String(invoiceNum).padStart(4, '0')}`,
      paymentId: payment.id,
      userId: payment.userId,
      userName: payment.userName,
      userEmail: payment.userEmail,
      date: payment.date.split('T')[0],
      dueDate: new Date(new Date(payment.date).getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: invoiceItems,
      subtotal: payment.amount,
      tax: Math.round(payment.amount * 0.18),
      total: Math.round(payment.amount * 1.18),
      status: 'paid',
      paidDate: payment.date.split('T')[0],
      customerInfo: {
        name: user?.name || payment.userName,
        email: user?.email || payment.userEmail,
        company: user?.company || '',
        address: '123 Business Park, Tech City',
        gst: 'GST' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      },
    };

    this.invoices.unshift(invoice);
    this.saveToStorage();
    return invoice;
  }

  // Notifications
  getNotifications(): Notification[] {
    return [...this.notifications];
  }

  getNotificationsByUser(userId: string): Notification[] {
    return this.notifications.filter(n => n.userId === userId || !n.userId);
  }

  addNotification(notification: Omit<Notification, 'id' | 'timestamp'>) {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    this.notifications.unshift(newNotification);
    // Keep only last 50 notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }
    this.saveToStorage();
    this.notify();
  }

  markNotificationRead(id: string) {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      this.saveToStorage();
      this.notify();
    }
  }

  markAllNotificationsRead() {
    this.notifications.forEach(n => n.read = true);
    this.saveToStorage();
    this.notify();
  }

  clearNotifications() {
    this.notifications = [];
    this.saveToStorage();
    this.notify();
  }

  // Activity Log
  getActivityLog(): ActivityLog[] {
    return [...this.activityLog];
  }

  addActivity(activity: Omit<ActivityLog, 'id' | 'timestamp'>) {
    const newActivity: ActivityLog = {
      ...activity,
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    this.activityLog.unshift(newActivity);
    // Keep only last 100 activities
    if (this.activityLog.length > 100) {
      this.activityLog = this.activityLog.slice(0, 100);
    }
    this.saveToStorage();
  }

  // Stats
  getStats() {
    const completedPayments = this.payments.filter(p => p.status === 'completed');
    const pendingPayments = this.payments.filter(
      p => p.status === 'pending' || p.status === 'refund_pending'
    );
    const activeUsers = this.users.filter(u => u.status === 'active');

    return {
      totalRevenue: completedPayments.reduce((sum, p) => sum + p.amount, 0),
      pendingRevenue: pendingPayments.reduce((sum, p) => sum + p.amount, 0),
      totalPayments: this.payments.length,
      completedPayments: completedPayments.length,
      pendingPayments: pendingPayments.length,
      failedPayments: this.payments.filter(p => p.status === 'failed').length,
      refundedPayments: this.payments.filter(p => p.status === 'refunded').length,
      refundPendingPayments: this.payments.filter(p => p.status === 'refund_pending').length,
      refundCancelledPayments: this.payments.filter(p => p.status === 'refund_cancelled').length,
      totalUsers: this.users.length,
      activeUsers: activeUsers.length,
      totalInvoices: this.invoices.length,
      unreadNotifications: this.notifications.filter(n => !n.read).length,
    };
  }
}

// Export singleton instance
export const store = new GlobalStore();

// React hook for using the store
import { useState, useEffect } from 'react';

export function useStore() {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const unsubscribe = store.subscribe(() => forceUpdate({}));

    const onStorage = (event: StorageEvent) => {
      if (event.key === 'volosist_store') {
        store.refreshFromStorage();
      }
    };

    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('storage', onStorage);
      unsubscribe();
    };
  }, []);

  return store;
}
