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
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  method: 'UPI' | 'Card' | 'Net Banking' | 'Wallet';
  date: string;
  service: string;
  plan: string;
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
const INITIAL_USERS: User[] = [
  { id: 'user_001', name: 'Rahul Sharma', email: 'rahul@techcorp.in', company: 'TechCorp India', phone: '+91 98765 43210', status: 'active', plan: 'Business', totalSpent: 45000, joinDate: '2025-06-15', lastActive: '2026-02-14', services: 3 },
  { id: 'user_002', name: 'Priya Patel', email: 'priya@startupx.io', company: 'StartupX', phone: '+91 87654 32109', status: 'active', plan: 'Pro', totalSpent: 28500, joinDate: '2025-08-22', lastActive: '2026-02-13', services: 2 },
  { id: 'user_003', name: 'Amit Kumar', email: 'amit@globalent.com', company: 'Global Enterprises', phone: '+91 76543 21098', status: 'inactive', plan: 'Basic', totalSpent: 8900, joinDate: '2025-11-10', lastActive: '2026-01-20', services: 1 },
  { id: 'user_004', name: 'Sneha Reddy', email: 'sneha@innovate.co', company: 'Innovate Labs', phone: '+91 65432 10987', status: 'active', plan: 'Business', totalSpent: 67200, joinDate: '2025-03-08', lastActive: '2026-02-14', services: 4 },
  { id: 'user_005', name: 'Vikram Singh', email: 'vikram@nexus.tech', company: 'Nexus Technologies', phone: '+91 54321 09876', status: 'suspended', plan: 'Pro', totalSpent: 15600, joinDate: '2025-09-01', lastActive: '2026-01-05', services: 2 },
  { id: 'dev-user', name: 'Dev User', email: 'dev@volosist.com', company: 'Volosist Technologies', phone: '+91 99999 99999', status: 'active', plan: 'Business', totalSpent: 0, joinDate: '2026-02-01', lastActive: '2026-02-14', services: 0 },
];

const INITIAL_PAYMENTS: Payment[] = [
  { id: 'pay_001', orderId: 'ORD-2026-1001', userId: 'user_001', userName: 'Rahul Sharma', userEmail: 'rahul@techcorp.in', amount: 2990, status: 'completed', method: 'UPI', date: '2026-02-14T10:30:00Z', service: 'Marketing & Content', plan: 'Business' },
  { id: 'pay_002', orderId: 'ORD-2026-1002', userId: 'user_002', userName: 'Priya Patel', userEmail: 'priya@startupx.io', amount: 1490, status: 'completed', method: 'Card', date: '2026-02-13T15:45:00Z', service: 'Sales Automation', plan: 'Pro' },
  { id: 'pay_003', orderId: 'ORD-2026-1003', userId: 'user_004', userName: 'Sneha Reddy', userEmail: 'sneha@innovate.co', amount: 4480, status: 'pending', method: 'Net Banking', date: '2026-02-14T09:20:00Z', service: 'Full Suite', plan: 'Business' },
  { id: 'pay_004', orderId: 'ORD-2026-1004', userId: 'user_003', userName: 'Amit Kumar', userEmail: 'amit@globalent.com', amount: 790, status: 'failed', method: 'UPI', date: '2026-02-12T14:10:00Z', service: 'Customer Support', plan: 'Basic' },
  { id: 'pay_005', orderId: 'ORD-2026-1005', userId: 'user_005', userName: 'Vikram Singh', userEmail: 'vikram@nexus.tech', amount: 1290, status: 'refunded', method: 'Wallet', date: '2026-02-10T11:55:00Z', service: 'Voice AI', plan: 'Pro' },
];

const INITIAL_INVOICES: Invoice[] = [];

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: 'notif_admin_001', type: 'payment', title: 'New Payment Received', message: 'Rahul Sharma paid ₹2,990 for Marketing & Content', read: false, timestamp: '2026-02-14T10:30:00Z' },
  { id: 'notif_admin_002', type: 'user', title: 'New User Registered', message: 'Sneha Reddy from Innovate Labs joined the platform', read: false, timestamp: '2026-02-14T09:15:00Z' },
  { id: 'notif_admin_003', type: 'alert', title: 'Payment Pending', message: 'Payment from Sneha Reddy is pending verification', read: true, timestamp: '2026-02-14T09:20:00Z' },
];

const INITIAL_ACTIVITY_LOG: ActivityLog[] = [
  { id: 'log_001', userId: 'user_001', action: 'payment_completed', details: 'Paid ₹2,990 for Marketing & Content - Business Plan', timestamp: '2026-02-14T10:30:00Z', type: 'user' },
  { id: 'log_002', userId: 'user_002', action: 'payment_completed', details: 'Paid ₹1,490 for Sales Automation - Pro Plan', timestamp: '2026-02-13T15:45:00Z', type: 'user' },
  { id: 'log_003', action: 'system_update', details: 'System maintenance completed successfully', timestamp: '2026-02-13T02:00:00Z', type: 'system' },
];

// Store class with event system for real-time updates
type StoreListener = () => void;

class GlobalStore {
  private users: User[] = [];
  private payments: Payment[] = [];
  private invoices: Invoice[] = [];
  private notifications: Notification[] = [];
  private activityLog: ActivityLog[] = [];
  private listeners: Set<StoreListener> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('volosist_store');
      if (stored) {
        const data = JSON.parse(stored);
        this.users = data.users || INITIAL_USERS;
        this.payments = data.payments || INITIAL_PAYMENTS;
        this.invoices = data.invoices || INITIAL_INVOICES;
        this.notifications = data.notifications || INITIAL_NOTIFICATIONS;
        this.activityLog = data.activityLog || INITIAL_ACTIVITY_LOG;
      } else {
        this.users = [...INITIAL_USERS];
        this.payments = [...INITIAL_PAYMENTS];
        this.invoices = [...INITIAL_INVOICES];
        this.notifications = [...INITIAL_NOTIFICATIONS];
        this.activityLog = [...INITIAL_ACTIVITY_LOG];
        this.saveToStorage();
      }
    } catch {
      this.users = [...INITIAL_USERS];
      this.payments = [...INITIAL_PAYMENTS];
      this.invoices = [...INITIAL_INVOICES];
      this.notifications = [...INITIAL_NOTIFICATIONS];
      this.activityLog = [...INITIAL_ACTIVITY_LOG];
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
    this.saveToStorage();
    this.notify();
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
    const newPayment: Payment = {
      ...payment,
      id: `pay_${Date.now()}`,
      orderId: `ORD-2026-${orderNum}`,
    };
    this.payments.unshift(newPayment);

    // Update user stats
    if (payment.status === 'completed') {
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
      title: payment.status === 'completed' ? 'Payment Received' : 
             payment.status === 'pending' ? 'Payment Pending' : 
             payment.status === 'failed' ? 'Payment Failed' : 'Payment Refunded',
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

  updatePaymentStatus(paymentId: string, status: Payment['status']) {
    const payment = this.payments.find(p => p.id === paymentId);
    if (payment) {
      const oldStatus = payment.status;
      payment.status = status;

      // If marking as completed, create invoice
      if (status === 'completed' && oldStatus !== 'completed') {
        this.createInvoiceFromPayment(payment);
        const user = this.users.find(u => u.id === payment.userId);
        if (user) {
          user.totalSpent += payment.amount;
          user.services += 1;
        }
      }

      // If refunding, adjust user stats
      if (status === 'refunded' && oldStatus === 'completed') {
        const user = this.users.find(u => u.id === payment.userId);
        if (user) {
          user.totalSpent -= payment.amount;
        }
      }

      this.addActivity({
        adminId: 'admin',
        action: `payment_status_updated`,
        details: `Payment ${payment.orderId} status changed from ${oldStatus} to ${status}`,
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
    const pendingPayments = this.payments.filter(p => p.status === 'pending');
    const activeUsers = this.users.filter(u => u.status === 'active');

    return {
      totalRevenue: completedPayments.reduce((sum, p) => sum + p.amount, 0),
      pendingRevenue: pendingPayments.reduce((sum, p) => sum + p.amount, 0),
      totalPayments: this.payments.length,
      completedPayments: completedPayments.length,
      pendingPayments: pendingPayments.length,
      failedPayments: this.payments.filter(p => p.status === 'failed').length,
      refundedPayments: this.payments.filter(p => p.status === 'refunded').length,
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
    return unsubscribe;
  }, []);

  return store;
}
