import * as React from 'react';
import { useState, createContext, useContext, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package,
  Shield, 
  Settings, 
  LogOut, 
  Bell, 
  ChevronRight,
  Plus,
  Calendar,
  CreditCard,
  Users,
  UserPlus,
  Mail,
  Phone,
  TrendingUp,
  Megaphone,
  Briefcase,
  Eye,
  Check,
  Clock,
  AlertCircle,
  RefreshCw,
  Edit3,
  Camera,
  Lock,
  Globe,
  Trash2,
  Crown,
  ShieldCheck,
  Key,
  X,
  CheckCircle,
  Download,
  FileText,
  ShoppingCart,
  Receipt,
  Loader2,
  Minus,
  Printer,
  Building2,
  MapPin,
  Hash,
  ArrowRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Wallet,
  IndianRupee,
  BadgeCheck,
  History
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { cn } from '../../lib/utils';
import {
  supabase,
  upsertPayment,
  requestRefundByOrder,
  cancelRefundByOrder,
  hasSupabaseConfig,
  type PaymentStatus as SupabasePaymentStatus,
} from '../../lib/supabase';
import { store as globalStore, ServiceCatalogItem, Payment } from '../../lib/store';
import { createCashfreeOrder, openCashfreeCheckout, verifyCashfreePayment } from '../../lib/cashfree';
import { downloadInvoicePdf } from '../../lib/invoice-pdf';
import {
  createTeamAccessInvite,
  listTeamAccessMembers,
  revokeTeamAccessMember,
  updateTeamAccessMemberRole,
  type TeamAccessMemberRecord,
  type TeamAccessRole,
} from '../../lib/team-access';

// Types
interface Service {
  id: number;
  serviceId?: string;
  cashfreeOrderId?: string;
  name: string;
  plan: string;
  status: string;
  icon: React.ReactNode;
  color: string;
  purchaseDate: string;
  expiryDate: string;
  lastUsageSyncDate?: string;
  renewalCost: number;
  features: string[];
  usage: { used: number; limit: number; unit: string };
}

interface TeamMember {
  id: string | number;
  invitationId?: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  status: string;
  lastActive: string;
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  read: boolean;
  timestamp: string;
  action?: { label: string; onClick: () => void };
}

interface CartItem {
  id: string;
  serviceId: string;
  serviceName: string;
  plan: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  serviceColor: string;
  icon: React.ReactNode;
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'completed' | 'pending' | 'failed';
  paymentMethod: string;
  paymentId?: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
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

interface DashboardContextType {
  currentUser: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  purchasedServices: Service[];
  setPurchasedServices: React.Dispatch<React.SetStateAction<Service[]>>;
  teamMembers: TeamMember[];
  setTeamMembers: React.Dispatch<React.SetStateAction<TeamMember[]>>;
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  orders: Order[];
  addOrder: (order: Order) => void;
  invoices: Invoice[];
  addInvoice: (invoice: Invoice) => void;
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  openModal: (modal: string, data?: any) => void;
  closeModal: () => void;
}

// Context
const DashboardContext = createContext<DashboardContextType | null>(null);

const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) throw new Error('useDashboard must be used within DashboardProvider');
  return context;
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const getStartOfDay = (value?: string | Date) => {
  const parsed = value ? new Date(value) : new Date();
  const safeDate = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  return new Date(safeDate.getFullYear(), safeDate.getMonth(), safeDate.getDate());
};

const formatDateStamp = (date: Date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const getElapsedFullDays = (from?: string, to: Date = new Date()) => {
  const fromDay = getStartOfDay(from);
  const toDay = getStartOfDay(to);
  const diff = Math.floor((toDay.getTime() - fromDay.getTime()) / DAY_IN_MS);
  return Math.max(0, diff);
};

const getDailyUsageIncrement = (service: Service) => {
  const usageLimit = Number.isFinite(service.usage?.limit) ? Math.max(0, Math.round(service.usage.limit)) : 0;
  if (usageLimit <= 0) return 0;

  const unit = String(service.usage?.unit || '').toLowerCase();
  if (unit.includes('/day')) return Math.max(1, usageLimit);
  if (unit.includes('/month')) return Math.max(1, Math.ceil(usageLimit / 30));
  return Math.max(1, Math.ceil(usageLimit / 45));
};

const toSupabasePaymentStatus = (status: Payment['status']): SupabasePaymentStatus => {
  if (status === 'refund_pending') return 'refund_requested';
  if (status === 'refunded') return 'refunded';
  if (status === 'pending') return 'pending';
  if (status === 'failed') return 'failed';
  return 'success';
};

const TEAM_ACCESS_ROLES: TeamAccessRole[] = ['Admin', 'Editor', 'Viewer'];

const normalizeTeamAccessRole = (role: unknown): TeamAccessRole => {
  const normalized = String(role || '').trim().toLowerCase();
  if (normalized === 'admin') return 'Admin';
  if (normalized === 'editor') return 'Editor';
  return 'Viewer';
};

const formatTeamMemberActivity = (member: TeamAccessMemberRecord) => {
  if (member.status === 'pending') return 'Invitation sent';
  if (member.status === 'active') {
    if (!member.acceptedAt) return 'Active';

    const acceptedDate = new Date(member.acceptedAt);
    if (Number.isNaN(acceptedDate.getTime())) return 'Active';
    return `Joined ${acceptedDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })}`;
  }

  if (member.status === 'revoked') return 'Access revoked';
  if (member.status === 'expired') return 'Invite expired';
  return 'Updated recently';
};

const mapTeamAccessRecordToMember = (member: TeamAccessMemberRecord): TeamMember => {
  const safeName = String(member.memberName || '').trim() || String(member.memberEmail || '').split('@')[0] || 'Team Member';
  const safeEmail = String(member.memberEmail || '').trim().toLowerCase();

  return {
    id: member.id,
    invitationId: member.id,
    name: safeName,
    email: safeEmail,
    role: normalizeTeamAccessRole(member.role),
    avatar: null,
    status: String(member.status || '').trim().toLowerCase() || 'pending',
    lastActive: formatTeamMemberActivity(member),
  };
};

const getDashboardUserIdentity = (user: any) => {
  const userId = String(user?.id || '').trim();
  const email = String(user?.email || '').trim().toLowerCase();
  const fullName = String(user?.user_metadata?.full_name || '').trim();
  const firstName = String(user?.user_metadata?.first_name || '').trim();
  const lastName = String(user?.user_metadata?.last_name || '').trim();
  const fallbackName = email.split('@')[0] || 'User';
  const name = fullName || `${firstName} ${lastName}`.trim() || fallbackName;
  return { userId, email, name };
};

// Provider Component
const DashboardProvider = ({ children, user }: { children: React.ReactNode; user: any }) => {
  const DASHBOARD_STORAGE_NAMESPACE = 'volosist_dashboard_state_v1';
  const userStorageSuffix = useMemo(() => {
    const rawIdentity = String(user?.id || user?.email || 'anonymous').trim().toLowerCase();
    const normalized = rawIdentity.replace(/[^a-z0-9_-]/g, '_');
    return normalized || 'anonymous';
  }, [user?.email, user?.id]);
  const DASHBOARD_STORAGE_KEY = `${DASHBOARD_STORAGE_NAMESPACE}_${userStorageSuffix}`;
  const [activeTab, setActiveTab] = useState('overview');
  const [purchasedServices, setPurchasedServices] = useState<Service[]>(INITIAL_SERVICES);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(INITIAL_TEAM_MEMBERS);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [modal, setModal] = useState<{ type: string; data?: any } | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [hydratedStorageKey, setHydratedStorageKey] = useState('');

  const inferServiceIdFromName = useCallback((name: string) => {
    const normalized = String(name || '').toLowerCase();
    if (normalized.includes('sales')) return 'sales';
    if (normalized.includes('voice')) return 'voice';
    if (normalized.includes('marketing')) return 'marketing';
    if (normalized.includes('business')) return 'business';
    return 'sales';
  }, []);

  const progressUsageByDate = useCallback((services: Service[]) => {
    if (!Array.isArray(services) || services.length === 0) return services;

    const today = getStartOfDay();
    const todayStamp = formatDateStamp(today);
    let hasChanges = false;

    const progressed = services.map((service) => {
      const safeLimit = Number.isFinite(service.usage?.limit) ? Math.max(0, Math.round(service.usage.limit)) : 0;
      const safeUsed = Number.isFinite(service.usage?.used) ? Math.max(0, Math.round(service.usage.used)) : 0;
      const normalizedUsed = Math.min(safeUsed, safeLimit);

      const anchorDate = service.lastUsageSyncDate || service.purchaseDate || todayStamp;
      const elapsedDays = getElapsedFullDays(anchorDate, today);
      const increment = getDailyUsageIncrement(service);
      const progressedUsed = elapsedDays > 0
        ? Math.min(safeLimit, normalizedUsed + increment * elapsedDays)
        : normalizedUsed;

      const shouldUpdateUsage = progressedUsed !== safeUsed || safeLimit !== service.usage.limit;
      const shouldUpdateSyncDate = service.lastUsageSyncDate !== todayStamp;

      if (!shouldUpdateUsage && !shouldUpdateSyncDate) {
        return service;
      }

      hasChanges = true;
      return {
        ...service,
        usage: {
          ...service.usage,
          used: progressedUsed,
          limit: safeLimit,
        },
        lastUsageSyncDate: todayStamp,
      };
    });

    return hasChanges ? progressed : services;
  }, []);

  useEffect(() => {
    setHasHydrated(false);
    setHydratedStorageKey('');
    setPurchasedServices(INITIAL_SERVICES);
    setTeamMembers(INITIAL_TEAM_MEMBERS);
    setCart([]);
    setOrders(INITIAL_ORDERS);
    setInvoices(INITIAL_INVOICES);
    setNotifications(INITIAL_NOTIFICATIONS);

    try {
      let raw = localStorage.getItem(DASHBOARD_STORAGE_KEY);
      if (!raw) {
        const legacyRaw = localStorage.getItem(DASHBOARD_STORAGE_NAMESPACE);
        if (legacyRaw) {
          raw = legacyRaw;
          localStorage.setItem(DASHBOARD_STORAGE_KEY, legacyRaw);
        }
      }

      if (raw) {
        const data = JSON.parse(raw) as {
          purchasedServices?: Array<Omit<Service, 'icon'> & { serviceId?: string }>;
          teamMembers?: TeamMember[];
          cart?: Array<Omit<CartItem, 'icon'>>;
          orders?: Array<Omit<Order, 'items'> & { items: Array<Omit<CartItem, 'icon'>> }>;
          invoices?: Invoice[];
          notifications?: Notification[];
        };

        if (Array.isArray(data.purchasedServices)) {
          const hydratedServices = data.purchasedServices
            .filter((service) => {
              const isLegacyDemoSeed =
                (service.id === 1 && service.purchaseDate === '2025-08-15') ||
                (service.id === 2 && service.purchaseDate === '2025-06-01');
              return !isLegacyDemoSeed;
            })
            .map((service) => {
              const serviceId = service.serviceId || inferServiceIdFromName(service.name);
              return {
                ...service,
                serviceId,
                icon: SERVICE_VISUALS[serviceId]?.icon || <Package className="size-5 text-white" />,
                color: service.color || SERVICE_VISUALS[serviceId]?.serviceColor || 'bg-slate-600',
              };
            });

          setPurchasedServices(progressUsageByDate(hydratedServices));
        }

        if (Array.isArray(data.teamMembers)) setTeamMembers(data.teamMembers);

        if (Array.isArray(data.cart)) {
          setCart(
            data.cart.map((item) => ({
              ...item,
              icon: SERVICE_VISUALS[item.serviceId]?.icon || <Package className="size-6" />,
            }))
          );
        }

        if (Array.isArray(data.orders)) {
          setOrders(
            data.orders.map((order) => ({
              ...order,
              items: order.items.map((item) => ({
                ...item,
                icon: SERVICE_VISUALS[item.serviceId]?.icon || <Package className="size-6" />,
              })),
            }))
          );
        }

        if (Array.isArray(data.invoices)) setInvoices(data.invoices);
        if (Array.isArray(data.notifications)) setNotifications(data.notifications);
      }
    } catch (error) {
      console.warn('[dashboard] failed to hydrate persisted state', error);
    } finally {
      setHydratedStorageKey(DASHBOARD_STORAGE_KEY);
      setHasHydrated(true);
    }
  }, [DASHBOARD_STORAGE_KEY, DASHBOARD_STORAGE_NAMESPACE, inferServiceIdFromName, progressUsageByDate]);

  useEffect(() => {
    if (!hasHydrated || hydratedStorageKey !== DASHBOARD_STORAGE_KEY) return;

    try {
      localStorage.setItem(
        DASHBOARD_STORAGE_KEY,
        JSON.stringify({
          purchasedServices: purchasedServices.map(({ icon, ...service }) => service),
          teamMembers,
          cart: cart.map(({ icon, ...item }) => item),
          orders: orders.map((order) => ({
            ...order,
            items: order.items.map(({ icon, ...item }) => item),
          })),
          invoices,
          notifications,
        })
      );
    } catch (error) {
      console.warn('[dashboard] failed to persist state', error);
    }
  }, [DASHBOARD_STORAGE_KEY, hasHydrated, hydratedStorageKey, purchasedServices, teamMembers, cart, orders, invoices, notifications]);

  useEffect(() => {
    if (!hasHydrated) return;

    const syncUsageByDay = () => {
      setPurchasedServices((prev) => progressUsageByDate(prev));
    };

    syncUsageByDay();

    const handleWindowFocus = () => syncUsageByDay();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncUsageByDay();
      }
    };

    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    const intervalId = window.setInterval(syncUsageByDay, 60 * 60 * 1000);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [hasHydrated, progressUsageByDate]);

  useEffect(() => {
    const userId = String(user?.id || '').trim();
    const userEmail = String(user?.email || '').trim().toLowerCase();
    if (!userId || !userEmail) return;

    const firstName = String(user?.user_metadata?.first_name || '').trim();
    const lastName = String(user?.user_metadata?.last_name || '').trim();
    const fullName = String(user?.user_metadata?.full_name || '').trim();
    const fallbackName = userEmail.split('@')[0] || 'User';

    globalStore.upsertUserProfile({
      id: userId,
      email: userEmail,
      name: fullName || `${firstName} ${lastName}`.trim() || fallbackName,
      company: String(user?.user_metadata?.company || '').trim() || undefined,
      phone: String(user?.user_metadata?.phone || '').trim() || undefined,
      plan: 'Basic',
    });
  }, [user]);

  useEffect(() => {
    const { userId, email } = getDashboardUserIdentity(user);
    if (!hasHydrated || !userId || !email) return;

    let cancelled = false;

    listTeamAccessMembers(userId, email)
      .then((members) => {
        if (cancelled) return;

        const mappedMembers = Array.isArray(members)
          ? members.map((member) => mapTeamAccessRecordToMember(member))
          : [];

        setTeamMembers(mappedMembers);
      })
      .catch((error) => {
        console.warn('[dashboard] failed to load team access members:', error);
      });

    return () => {
      cancelled = true;
    };
  }, [hasHydrated, user?.email, user?.id]);

  useEffect(() => {
    const userId = String(user?.id || '').trim();
    const userEmail = String(user?.email || '').trim().toLowerCase();
    if (!hasHydrated || !hasSupabaseConfig || !userId || !userEmail) return;

    const fullName = String(user?.user_metadata?.full_name || '').trim();
    const firstName = String(user?.user_metadata?.first_name || '').trim();
    const lastName = String(user?.user_metadata?.last_name || '').trim();
    const userName = fullName || `${firstName} ${lastName}`.trim() || userEmail.split('@')[0] || 'User';
    const userPhone = String(user?.user_metadata?.phone || user?.phone || '').trim();

    let cancelled = false;

    const syncLocalPaymentsToSupabase = async () => {
      const localPayments = globalStore.getPayments();
      const candidatePayments = localPayments.filter((payment) => {
        const safeOrderId = String(payment.cashfreeOrderId || '').trim();
        if (!safeOrderId) return false;

        const paymentUserId = String(payment.userId || '').trim();
        const paymentEmail = String(payment.userEmail || '').trim().toLowerCase();
        return paymentUserId === userId || paymentEmail === userEmail;
      });

      for (const payment of candidatePayments) {
        if (cancelled) return;

        try {
          await upsertPayment({
            user_id: userId,
            user_name: String(payment.userName || '').trim() || userName,
            user_email: userEmail,
            user_phone: userPhone || undefined,
            plan_id: inferServiceIdFromName(payment.service || payment.plan || 'service'),
            plan_name: `${payment.service || 'Service'} (${payment.plan || 'Plan'})`,
            amount: Math.max(0, Math.round(Number(payment.amount || 0) * 100)),
            currency: 'INR',
            cashfree_order_id: String(payment.cashfreeOrderId || '').trim(),
            status: toSupabasePaymentStatus(payment.status),
            created_at: String(payment.date || '').trim() || new Date().toISOString(),
            updated_at: new Date().toISOString(),
            refund_reason: payment.refundReason || undefined,
            refund_note: payment.refundNotes || undefined,
            refund_requested_at: payment.refundRequestedAt || undefined,
            refund_completed_at: payment.refundResolvedAt || undefined,
          });
        } catch (error) {
          console.warn('[dashboard] failed to sync local payment with Supabase:', payment.cashfreeOrderId, error);
        }
      }
    };

    syncLocalPaymentsToSupabase();

    return () => {
      cancelled = true;
    };
  }, [
    hasHydrated,
    inferServiceIdFromName,
    user?.email,
    user?.id,
    user?.phone,
    user?.user_metadata?.first_name,
    user?.user_metadata?.full_name,
    user?.user_metadata?.last_name,
    user?.user_metadata?.phone,
  ]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const openModal = useCallback((modalType: string, data?: any) => {
    setModal({ type: modalType, data });
  }, []);

  const closeModal = useCallback(() => {
    setModal(null);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('cf_return') === '1' && params.get('cf_order_id')) {
      setModal({ type: 'checkout' });
    }
  }, []);

  const addToCart = useCallback((item: CartItem) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) return prev;
      return [...prev, item];
    });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const addOrder = useCallback((order: Order) => {
    setOrders(prev => [order, ...prev]);
  }, []);

  const addInvoice = useCallback((invoice: Invoice) => {
    setInvoices(prev => [invoice, ...prev]);
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <DashboardContext.Provider value={{
      currentUser: user,
      activeTab,
      setActiveTab,
      purchasedServices,
      setPurchasedServices,
      teamMembers,
      setTeamMembers,
      cart,
      addToCart,
      removeFromCart,
      clearCart,
      orders,
      addOrder,
      invoices,
      addInvoice,
      notifications,
      markNotificationRead,
      clearAllNotifications,
      showToast,
      openModal,
      closeModal
    }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
      
      {/* Global Modals */}
      <CartModal
        isOpen={modal?.type === 'cart'}
        onClose={closeModal}
      />
      <CheckoutModal
        isOpen={modal?.type === 'checkout'}
        onClose={closeModal}
      />
      <SubscribeModal
        isOpen={modal?.type === 'subscribe'}
        onClose={closeModal}
        service={modal?.data?.service}
        selectedPlan={modal?.data?.plan}
      />
      <RenewModal
        isOpen={modal?.type === 'renew'}
        onClose={closeModal}
        service={modal?.data}
      />
      <RefundRequestModal
        isOpen={modal?.type === 'refund'}
        onClose={closeModal}
        service={modal?.data}
      />
      <InviteMemberModal
        isOpen={modal?.type === 'invite'}
        onClose={closeModal}
      />
      <BillingModal
        isOpen={modal?.type === 'billing'}
        onClose={closeModal}
      />
      <InvoiceModal
        isOpen={modal?.type === 'invoice'}
        onClose={closeModal}
        invoice={modal?.data}
      />
      <OrderDetailsModal
        isOpen={modal?.type === 'orderDetails'}
        onClose={closeModal}
        order={modal?.data}
      />
      <NotificationsModal
        isOpen={modal?.type === 'notifications'}
        onClose={closeModal}
      />
    </DashboardContext.Provider>
  );
};

const resolveServiceIdFromName = (name: string) => {
  const normalized = String(name || '').toLowerCase();
  if (normalized.includes('sales')) return 'sales';
  if (normalized.includes('voice')) return 'voice';
  if (normalized.includes('marketing')) return 'marketing';
  if (normalized.includes('business')) return 'business';
  return 'sales';
};

interface DashboardPageProps {
  user: any;
  onNavigate: (view: any) => void;
  onSignOut: () => void;
}

const SIDEBAR_ITEMS = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={20} /> },
  { id: 'services', label: 'Services', icon: <Package size={20} /> },
  { id: 'orders', label: 'Orders & Invoices', icon: <Receipt size={20} /> },
  { id: 'security', label: 'Team Access', icon: <Shield size={20} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
];

// Initial Data - Sample data for demo (replace with Supabase in production)
const INITIAL_SERVICES: Service[] = [];

const INITIAL_TEAM_MEMBERS: TeamMember[] = [];

const SERVICE_VISUALS: Record<string, { icon: React.ReactNode; color: string; bgColor: string; serviceColor: string }> = {
  sales: {
    icon: <TrendingUp className="size-6" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    serviceColor: 'bg-blue-600',
  },
  voice: {
    icon: <Phone className="size-6" />,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    serviceColor: 'bg-emerald-600',
  },
  marketing: {
    icon: <Megaphone className="size-6" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    serviceColor: 'bg-purple-600',
  },
  business: {
    icon: <Briefcase className="size-6" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    serviceColor: 'bg-orange-600',
  },
};

// Invoice Data - Start empty (orders and invoices are created on purchase)
const INITIAL_ORDERS: Order[] = [];
const INITIAL_INVOICES: Invoice[] = [];

// Initial Notifications
const INITIAL_NOTIFICATIONS: Notification[] = [];

// --- Modal Components ---

const Modal = ({ isOpen, onClose, title, children, size = 'md' }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; size?: 'sm' | 'md' | 'lg' }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={cn(
          "relative bg-white rounded-2xl shadow-2xl z-10 max-h-[90vh] overflow-auto",
          size === 'sm' ? 'w-full max-w-md' : size === 'lg' ? 'w-full max-w-3xl' : 'w-full max-w-xl'
        )}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="size-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </div>
  );
};

// Subscribe Modal
const SubscribeModal = ({ isOpen, onClose, service, selectedPlan }: { isOpen: boolean; onClose: () => void; service: any; selectedPlan: any }) => {
  const { purchasedServices, setPurchasedServices, showToast } = useDashboard();
  const [processing, setProcessing] = useState(false);

  const handleSubscribe = async () => {
    setProcessing(true);
    await new Promise(r => setTimeout(r, 1500));
    
    const today = new Date();
    const expiryDate = new Date(today);
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    const iconMap: Record<string, React.ReactNode> = {
      'sales': <TrendingUp className="size-5 text-white" />,
      'voice': <Phone className="size-5 text-white" />,
      'marketing': <Megaphone className="size-5 text-white" />,
      'business': <Briefcase className="size-5 text-white" />
    };

    const unitMap: Record<string, string> = {
      'sales': 'leads/month',
      'voice': 'minutes/month',
      'marketing': 'posts/month',
      'business': 'projects'
    };

    const newService: Service = {
      id: Date.now(),
      serviceId: service.id,
      name: service.name,
      plan: selectedPlan.name,
      status: 'active',
      icon: iconMap[service.id],
      color: service.serviceColor,
      purchaseDate: today.toISOString().split('T')[0],
      expiryDate: expiryDate.toISOString().split('T')[0],
      lastUsageSyncDate: today.toISOString().split('T')[0],
      renewalCost: selectedPlan.price * 12,
      features: selectedPlan.features,
      usage: { used: 0, limit: selectedPlan.limit, unit: unitMap[service.id] }
    };

    setPurchasedServices(prev => [...prev, newService]);
    setProcessing(false);
    showToast(`Successfully subscribed to ${service.name} - ${selectedPlan.name}!`, 'success');
    onClose();
  };

  if (!service || !selectedPlan) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Subscription">
      <div className="space-y-6">
        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
          <div className={cn("size-14 rounded-2xl flex items-center justify-center", service.bgColor, service.color)}>
            {service.icon}
          </div>
          <div>
            <h3 className="font-bold text-slate-900">{service.name}</h3>
            <p className="text-sm text-slate-500">{selectedPlan.name} Plan</p>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Plan Features</h4>
          <ul className="space-y-2">
            {selectedPlan.features.map((f: string, i: number) => (
              <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                <Check className="size-4 text-emerald-500" /> {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Monthly Cost</span>
            <span className="text-2xl font-black text-slate-900">₹{selectedPlan.price}</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-slate-400">Annual Total</span>
            <span className="text-sm font-bold text-slate-600">₹{selectedPlan.price * 12}/year</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSubscribe} loading={processing} className="flex-1 gap-2">
            <CreditCard size={18} /> Subscribe Now
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Renew Modal
const RenewModal = ({ isOpen, onClose, service }: { isOpen: boolean; onClose: () => void; service: Service | null }) => {
  const { clearCart, addToCart, openModal, showToast, setActiveTab } = useDashboard();
  const [processing, setProcessing] = useState(false);

  const handleRenew = async () => {
    if (!service) return;
    setProcessing(true);

    try {
      const serviceId = service.serviceId || resolveServiceIdFromName(service.name);
      const normalizedPlanName =
        String(service.plan || '')
          .trim()
          .toLowerCase()
          .replace(/^\w/, (char) => char.toUpperCase()) || 'Basic';
      const renewalCartItem: Omit<CartItem, 'icon'> = {
        id: `renew_${service.id}_${Date.now()}`,
        serviceId,
        serviceName: service.name,
        plan: normalizedPlanName,
        price: Number(service.renewalCost.toFixed(2)),
        billingCycle: 'yearly',
        features: service.features,
        serviceColor: service.color,
      };

      localStorage.setItem('volosist_pending_renewal_service', String(service.id));
      clearCart();
      addToCart({
        ...renewalCartItem,
        icon: SERVICE_VISUALS[serviceId]?.icon || <Package className="size-6" />,
      });

      showToast('Review billing details and continue to Cashfree renewal payment.', 'info');
      openModal('checkout');
    } catch (error: any) {
      showToast(error?.message || 'Unable to prepare renewal checkout. Please try again.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  if (!service) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Renew Subscription">
      <div className="space-y-6">
        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
          <div className={cn("size-14 rounded-2xl flex items-center justify-center", service.color)}>
            {service.icon}
          </div>
          <div>
            <h3 className="font-bold text-slate-900">{service.name}</h3>
            <Badge className={cn(
              "text-[10px] mt-1",
              service.plan === 'Business' ? 'bg-amber-100 text-amber-700' :
              service.plan === 'Pro' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
            )}>{service.plan} Plan</Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl">
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Current Expiry</div>
            <div className="font-bold text-slate-900">{new Date(service.expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
          </div>
          <div className="p-4 bg-emerald-50 rounded-xl">
            <div className="text-xs text-emerald-600 uppercase tracking-wider mb-1">New Expiry</div>
            <div className="font-bold text-emerald-700">
              {new Date(new Date(service.expiryDate).setFullYear(new Date(service.expiryDate).getFullYear() + 1)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Renewal Cost</span>
            <span className="text-2xl font-black text-slate-900">₹{service.renewalCost}</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">for 1 year</div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button onClick={handleRenew} loading={processing} className="flex-1 gap-2">
              <RefreshCw size={18} /> Renew Subscription
            </Button>
          </div>
          <Button 
            variant="ghost" 
            className="w-full text-blue-600 hover:bg-blue-50 gap-2"
            onClick={() => {
              onClose();
              setActiveTab('services');
            }}
          >
            <Package size={16} /> View All Plans & Upgrade
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const REFUND_REASON_OPTIONS = [
  { value: 'accidental_purchase', label: 'Accidental purchase' },
  { value: 'duplicate_payment', label: 'Duplicate payment' },
  { value: 'wrong_plan_selected', label: 'Wrong plan selected' },
  { value: 'service_not_used', label: 'Service not used' },
  { value: 'technical_issue', label: 'Technical issue / service issue' },
  { value: 'other', label: 'Other' },
];

const RefundRequestModal = ({ isOpen, onClose, service }: { isOpen: boolean; onClose: () => void; service: Service | null }) => {
  const { showToast, currentUser } = useDashboard();
  const [reason, setReason] = useState(REFUND_REASON_OPTIONS[0].value);
  const [notes, setNotes] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [backendError, setBackendError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [payments, setPayments] = useState<Payment[]>(globalStore.getPayments());

  const currentUserId = String(currentUser?.id || '').trim();
  const currentUserEmail = String(currentUser?.email || '').trim().toLowerCase();

  const normalizeLookupKey = (value: string) =>
    String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');

  const resolveServiceBucket = (value: string) => {
    const normalized = normalizeLookupKey(value);
    if (normalized.includes('sales')) return 'sales';
    if (normalized.includes('voice') || normalized.includes('call')) return 'voice';
    if (normalized.includes('marketing') || normalized.includes('content')) return 'marketing';
    if (normalized.includes('business')) return 'business';
    return '';
  };

  const normalizeRefundStatus = (status: string | undefined | null): Payment['status'] => {
    const normalized = String(status || '').trim().toLowerCase();
    if (normalized === 'completed' || normalized === 'success' || normalized === 'paid') return 'completed';
    if (normalized === 'refund_pending' || normalized === 'refund_requested' || normalized === 'requested') return 'refund_pending';
    if (normalized === 'refund_cancelled' || normalized === 'refund_canceled' || normalized === 'cancelled') return 'refund_cancelled';
    if (normalized === 'refunded' || normalized === 'refund') return 'refunded';
    if (normalized === 'pending') return 'pending';
    return 'failed';
  };

  const getRefundCandidatePriority = (status: Payment['status']) => {
    if (status === 'completed') return 5;
    if (status === 'refund_cancelled') return 4;
    if (status === 'refund_pending') return 3;
    if (status === 'refunded') return 2;
    if (status === 'pending') return 1;
    return 0;
  };

  const getReasonLabel = (value: string) =>
    REFUND_REASON_OPTIONS.find((option) => option.value === value)?.label || 'Other';

  const validateRefundForm = () => {
    const nextErrors: Record<string, string> = {};
    const trimmedNotes = notes.trim();
    const trimmedContactEmail = contactEmail.trim().toLowerCase();
    const normalizedPhoneDigits = contactPhone.replace(/\D/g, '');

    if (!reason) {
      nextErrors.reason = 'Select a refund reason.';
    }

    if (trimmedNotes.length < 20) {
      nextErrors.notes = 'Please provide at least 20 characters describing the issue.';
    }

    if (reason === 'other' && trimmedNotes.length < 30) {
      nextErrors.notes = 'Please provide more detail (minimum 30 characters) for "Other" reason.';
    }

    if (!/^\S+@\S+\.\S+$/.test(trimmedContactEmail)) {
      nextErrors.contactEmail = 'Enter a valid contact email address.';
    }

    if (!/^\d{10,15}$/.test(normalizedPhoneDigits)) {
      nextErrors.contactPhone = 'Enter a valid contact phone number.';
    }

    if (!policyAccepted) {
      nextErrors.policy = 'Please acknowledge the refund policy before submitting.';
    }

    setFormErrors(nextErrors);
    return {
      isValid: Object.keys(nextErrors).length === 0,
      trimmedNotes,
      trimmedContactEmail,
      normalizedPhoneDigits,
    };
  };

  useEffect(() => {
    if (!isOpen) return;

    setReason(REFUND_REASON_OPTIONS[0].value);
    setNotes('');
    setContactEmail(currentUserEmail);
    setContactPhone(String(currentUser?.user_metadata?.phone || currentUser?.phone || '').trim());
    setPolicyAccepted(false);
    setFormErrors({});
    setBackendError('');
  }, [isOpen, service?.id, currentUserEmail, currentUser?.phone, currentUser?.user_metadata?.phone]);

  useEffect(() => {
    if (!isOpen) return;

    const syncPayments = () => {
      setPayments(globalStore.getPayments());
    };

    syncPayments();
    const unsubscribe = globalStore.subscribe(syncPayments);
    return unsubscribe;
  }, [isOpen]);

  const selectedPayment = useMemo(() => {
    if (!service || (!currentUserId && !currentUserEmail)) return null;
    const serviceName = String(service.name || '').trim();
    const serviceNameKey = normalizeLookupKey(serviceName);
    const serviceBucket = resolveServiceBucket(serviceName);
    const legacyUserIds = new Set(['current_user', 'dev-user', 'anonymous', 'guest']);
    const legacyEmails = new Set(['user@example.com', 'demo@example.com', 'test@example.com']);

    const getSafeTimestamp = (value: string) => {
      const parsed = new Date(value).getTime();
      return Number.isFinite(parsed) ? parsed : 0;
    };

    const isUserMatch = (payment: Payment) => {
      const paymentUserId = String(payment.userId || '').trim().toLowerCase();
      const paymentEmail = String(payment.userEmail || '').trim().toLowerCase();

      if (currentUserId && String(payment.userId || '').trim() === currentUserId) return true;
      if (currentUserEmail && paymentEmail === currentUserEmail) return true;

      if (currentUserEmail && legacyUserIds.has(paymentUserId) && (!paymentEmail || legacyEmails.has(paymentEmail))) {
        return true;
      }

      return false;
    };

    const isServiceMatch = (payment: Payment) => {
      const paymentServiceName = String(payment.service || '').trim();
      const paymentServiceKey = normalizeLookupKey(paymentServiceName);
      const paymentServiceBucket = resolveServiceBucket(paymentServiceName);
      const hasComparableKeys = Boolean(serviceNameKey && paymentServiceKey);

      const directMatch =
        hasComparableKeys && (
          paymentServiceKey === serviceNameKey ||
          paymentServiceKey.includes(serviceNameKey) ||
          serviceNameKey.includes(paymentServiceKey)
        );

      const bucketMatch = Boolean(serviceBucket && paymentServiceBucket && serviceBucket === paymentServiceBucket);

      const itemMatch = Array.isArray(payment.items)
        ? payment.items.some((item) => {
            if (!item || typeof item !== 'object') return false;

            const itemName = String((item as { name?: string }).name || '').trim();
            const itemKey = normalizeLookupKey(itemName);
            const itemBucket = resolveServiceBucket(itemName);
            const hasComparableItemKeys = Boolean(serviceNameKey && itemKey);

            return (
              (hasComparableItemKeys && (
                itemKey === serviceNameKey ||
                itemKey.includes(serviceNameKey) ||
                serviceNameKey.includes(itemKey)
              )) ||
              Boolean(serviceBucket && itemBucket && serviceBucket === itemBucket)
            );
          })
        : false;

      return directMatch || bucketMatch || itemMatch;
    };

    return (
      payments
        .filter((payment) => isUserMatch(payment) && isServiceMatch(payment))
        .sort((left, right) => {
          const rightPriority = getRefundCandidatePriority(normalizeRefundStatus((right as { status?: string }).status));
          const leftPriority = getRefundCandidatePriority(normalizeRefundStatus((left as { status?: string }).status));
          if (rightPriority !== leftPriority) return rightPriority - leftPriority;

          return getSafeTimestamp(right.date) - getSafeTimestamp(left.date);
        })[0] || null
    );
  }, [payments, service, currentUserEmail, currentUserId]);

  const selectedPaymentStatus = selectedPayment
    ? normalizeRefundStatus((selectedPayment as { status?: string }).status)
    : null;

  const canRequestRefund =
    selectedPaymentStatus === 'completed' || selectedPaymentStatus === 'refund_cancelled';
  const canCancelRequest = selectedPaymentStatus === 'refund_pending';
  const isAlreadyRefunded = selectedPaymentStatus === 'refunded';

  const handleSubmitRefundRequest = async () => {
    if (!service || !selectedPayment) {
      showToast('Unable to find payment details for this refund request.', 'error');
      return;
    }

    const validation = validateRefundForm();
    if (!validation.isValid) {
      showToast('Please complete all required refund details.', 'error');
      return;
    }

    if (!selectedPayment.cashfreeOrderId) {
      const missingOrderMessage = 'Refund cannot be submitted because backend payment reference is missing. Contact support.';
      setBackendError(missingOrderMessage);
      showToast(missingOrderMessage, 'error');
      return;
    }

    setSubmitting(true);
    setBackendError('');

    try {
      const reasonLabel = getReasonLabel(reason);
      const refundPayload = [
        `Reason: ${reasonLabel}`,
        `Details: ${validation.trimmedNotes}`,
        `Contact Email: ${validation.trimmedContactEmail}`,
        `Contact Phone: ${validation.normalizedPhoneDigits}`,
        'Policy Acknowledged: Yes',
      ].join(' | ');

      await requestRefundByOrder(selectedPayment.cashfreeOrderId, refundPayload);

      globalStore.updatePaymentStatus(selectedPayment.id, 'refund_pending', {
        reason: reasonLabel,
        notes: validation.trimmedNotes,
      });

      showToast('Refund request submitted successfully. Billing team review ETA: 3-5 business days.', 'success');
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Unable to submit refund request right now. Please try again.';
      setBackendError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRefundRequest = async () => {
    if (!selectedPayment) {
      showToast('No refund request is available to cancel.', 'error');
      return;
    }

    if (!selectedPayment.cashfreeOrderId) {
      const missingOrderMessage = 'Refund cancellation failed because backend payment reference is missing.';
      setBackendError(missingOrderMessage);
      showToast(missingOrderMessage, 'error');
      return;
    }

    setSubmitting(true);
    setBackendError('');
    try {
      await cancelRefundByOrder(selectedPayment.cashfreeOrderId);

      globalStore.updatePaymentStatus(selectedPayment.id, 'refund_cancelled', {
        notes: notes.trim(),
      });

      showToast('Refund request cancelled successfully.', 'info');
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Unable to cancel refund request right now. Please try again.';
      setBackendError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!service) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Refund Request" size="md">
      <div className="space-y-5">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Service Details</div>
          <div className="space-y-1 text-sm text-slate-700">
            <div className="font-bold text-slate-900">{service.name}</div>
            <div>Plan: {service.plan}</div>
            <div>Refund Amount (reference): ₹{service.renewalCost}</div>
            {selectedPayment?.orderId && (
              <div className="text-xs text-slate-500 pt-1">Order: {selectedPayment.orderId}</div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs text-blue-700">
          Refunds are reviewed by billing support. Provide complete reason, contact details, and policy acknowledgement for faster processing.
          <div className="mt-1">
            Once approved, the gateway processes a full refund to the original payment source (bank-linked account/card/UPI used for payment).
          </div>
        </div>

        {!selectedPayment && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700">
            No eligible payment found for this service under your account.
          </div>
        )}

        {selectedPayment && (
          <div className="rounded-xl bg-white border border-slate-200 p-3 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Refund Status</span>
            <Badge
              className={cn(
                'text-[10px] uppercase',
                selectedPaymentStatus === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                selectedPaymentStatus === 'refund_pending' ? 'bg-amber-100 text-amber-700' :
                selectedPaymentStatus === 'refund_cancelled' ? 'bg-slate-100 text-slate-700' :
                selectedPaymentStatus === 'refunded' ? 'bg-purple-100 text-purple-700' :
                'bg-red-100 text-red-700'
              )}
            >
              {(selectedPaymentStatus || 'failed').replace('_', ' ')}
            </Badge>
          </div>
        )}

        {backendError && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
            {backendError}
          </div>
        )}

        {canRequestRefund && (
          <>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Refund Reason</label>
              <select
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                className="w-full h-11 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {REFUND_REASON_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              {formErrors.reason && <p className="text-xs text-red-500 mt-1">{formErrors.reason}</p>}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Detailed Explanation</label>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Describe what happened and why you are requesting a refund"
                className="w-full min-h-[110px] px-3 py-2 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {formErrors.notes && <p className="text-xs text-red-500 mt-1">{formErrors.notes}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Contact Email</label>
                <Input
                  type="email"
                  value={contactEmail}
                  onChange={(event) => setContactEmail(event.target.value)}
                  className="h-11"
                />
                {formErrors.contactEmail && <p className="text-xs text-red-500">{formErrors.contactEmail}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Contact Phone</label>
                <Input
                  value={contactPhone}
                  onChange={(event) => setContactPhone(event.target.value)}
                  className="h-11"
                />
                {formErrors.contactPhone && <p className="text-xs text-red-500">{formErrors.contactPhone}</p>}
              </div>
            </div>

            <label className="flex items-start gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={policyAccepted}
                onChange={(event) => setPolicyAccepted(event.target.checked)}
                className="mt-0.5 size-4 rounded border-slate-300"
              />
              <span className="text-xs text-slate-600">
                I confirm that the refund details are accurate and understand that approval depends on billing policy verification.
              </span>
            </label>
            {formErrors.policy && <p className="text-xs text-red-500 -mt-2">{formErrors.policy}</p>}
          </>
        )}

        {canCancelRequest && (
          <div className="rounded-xl bg-blue-50 border border-blue-100 p-3 text-xs text-blue-700">
            Your refund request is currently pending. You can cancel it from here.
          </div>
        )}

        {isAlreadyRefunded && (
          <div className="rounded-xl bg-purple-50 border border-purple-100 p-3 text-xs text-purple-700">
            This payment is already refunded and cannot be modified.
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">Close</Button>

          {canRequestRefund && (
            <Button onClick={handleSubmitRefundRequest} loading={submitting} className="flex-1 gap-2">
              <History size={16} /> Submit Refund
            </Button>
          )}

          {canCancelRequest && (
            <Button variant="outline" onClick={handleCancelRefundRequest} loading={submitting} className="flex-1 gap-2">
              <X size={16} /> Cancel Request
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

// Invite Member Modal
const InviteMemberModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { setTeamMembers, showToast, currentUser } = useDashboard();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<TeamAccessRole>('Viewer');
  const [sending, setSending] = useState(false);

  const handleInvite = async () => {
    const safeEmail = String(email || '').trim().toLowerCase();
    const safeName = String(name || '').trim();
    if (!safeEmail || !safeName) return;

    if (!/^\S+@\S+\.\S+$/.test(safeEmail)) {
      showToast('Enter a valid email address before sending the invite.', 'error');
      return;
    }

    const { userId: ownerUserId, email: ownerEmail, name: ownerName } = getDashboardUserIdentity(currentUser);
    if (!ownerUserId || !ownerEmail) {
      showToast('Your session is missing owner details. Please sign in again.', 'error');
      return;
    }

    if (safeEmail === ownerEmail) {
      showToast('You cannot invite your own account as a team member.', 'error');
      return;
    }

    setSending(true);

    try {
      const result = await createTeamAccessInvite({
        ownerUserId,
        ownerEmail,
        ownerName,
        memberEmail: safeEmail,
        memberName: safeName,
        role,
      });

      const mappedMember = mapTeamAccessRecordToMember(result.invitation);

      setTeamMembers((prev) => {
        const existingIndex = prev.findIndex((member) => {
          const memberKey = String(member.invitationId || member.id || '').trim();
          return memberKey === String(mappedMember.invitationId || '') || member.email.toLowerCase() === mappedMember.email;
        });

        if (existingIndex === -1) {
          return [mappedMember, ...prev];
        }

        const next = [...prev];
        next[existingIndex] = mappedMember;
        return next;
      });

      if (result.delivery === 'sent') {
        showToast(`Invitation email sent to ${safeEmail}.`, 'success');
      } else if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(result.acceptUrl);
          showToast('Invite created in preview mode. Accept link copied to clipboard.', 'info');
        } catch {
          showToast('Invite created in preview mode. Configure email provider keys to send real emails.', 'info');
        }
      } else {
        showToast('Invite created in preview mode. Configure email provider keys to send real emails.', 'info');
      }

      setEmail('');
      setName('');
      setRole('Viewer');
      onClose();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to send invitation right now.', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invite Team Member">
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="h-12" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@company.com" className="h-12" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Role</label>
            <select 
              value={role} 
              onChange={(e) => setRole(normalizeTeamAccessRole(e.target.value))}
              className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {TEAM_ACCESS_ROLES.map((teamRole) => (
                <option key={teamRole} value={teamRole}>
                  {teamRole} {teamRole === 'Admin' ? '- Full access' : teamRole === 'Editor' ? '- Limited access' : '- View only'}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleInvite} loading={sending} disabled={!email.trim() || !name.trim()} className="flex-1 gap-2">
            <Mail size={18} /> Send Invitation
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Edit Member Modal
const EditMemberModal = ({ isOpen, onClose, member }: { isOpen: boolean; onClose: () => void; member: TeamMember | null }) => {
  const { setTeamMembers, showToast, currentUser } = useDashboard();
  const [role, setRole] = useState<TeamAccessRole>(normalizeTeamAccessRole(member?.role || 'Viewer'));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setRole(normalizeTeamAccessRole(member?.role || 'Viewer'));
  }, [member?.id, member?.role]);

  const handleSave = async () => {
    if (!member) return;

    const nextRole = normalizeTeamAccessRole(role);
    setSaving(true);

    try {
      if (member.invitationId) {
        const { userId: ownerUserId, email: ownerEmail } = getDashboardUserIdentity(currentUser);
        if (!ownerUserId) {
          throw new Error('Missing owner identity. Please sign in again.');
        }

        const updatedMember = await updateTeamAccessMemberRole(member.invitationId, {
          ownerUserId,
          ownerEmail: ownerEmail || undefined,
          role: nextRole,
        });

        const mappedMember = mapTeamAccessRecordToMember(updatedMember);
        setTeamMembers((prev) =>
          prev.map((item) => {
            const itemKey = String(item.invitationId || item.id || '').trim();
            return itemKey === String(mappedMember.invitationId || '').trim() ? mappedMember : item;
          })
        );
      } else {
        setTeamMembers((prev) => prev.map((item) => (item.id === member.id ? { ...item, role: nextRole } : item)));
      }

      showToast(`${member.name}'s role updated to ${nextRole}`, 'success');
      onClose();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to update member role right now.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!member) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Team Member">
      <div className="space-y-6">
        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
          <div className="size-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
            {member.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h3 className="font-bold text-slate-900">{member.name}</h3>
            <p className="text-sm text-slate-500">{member.email}</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Role</label>
          <select 
            value={role} 
            onChange={(e) => setRole(normalizeTeamAccessRole(e.target.value))}
            className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {TEAM_ACCESS_ROLES.map((teamRole) => (
              <option key={teamRole} value={teamRole}>
                {teamRole} {teamRole === 'Admin' ? '- Full access' : teamRole === 'Editor' ? '- Limited access' : '- View only'}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSave} loading={saving} className="flex-1 gap-2">
            <Check size={18} /> Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Delete Confirmation Modal
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, title, message }: { isOpen: boolean; onClose: () => void; onConfirm: () => void | Promise<void>; title: string; message: string }) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);

    try {
      await Promise.resolve(onConfirm());
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-6">
        <p className="text-slate-600">{message}</p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleDelete} loading={deleting} className="flex-1 bg-red-600 hover:bg-red-700 gap-2">
            <Trash2 size={18} /> Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Billing Modal
const BillingModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { purchasedServices, invoices, openModal } = useDashboard();
  const totalMonthly = purchasedServices.reduce((acc, s) => acc + (s.renewalCost / 12), 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Billing & Invoices" size="lg">
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-xl">
            <div className="text-xs text-blue-600 uppercase tracking-wider mb-1">Monthly Spend</div>
            <div className="text-2xl font-black text-slate-900">₹{Math.round(totalMonthly)}</div>
          </div>
          <div className="p-4 bg-emerald-50 rounded-xl">
            <div className="text-xs text-emerald-600 uppercase tracking-wider mb-1">Active Services</div>
            <div className="text-2xl font-black text-slate-900">{purchasedServices.length}</div>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl">
            <div className="text-xs text-purple-600 uppercase tracking-wider mb-1">Next Payment</div>
            <div className="text-2xl font-black text-slate-900">Mar 15</div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="size-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center">
              <CreditCard className="size-6 text-slate-600" />
            </div>
            <div>
              <div className="font-bold text-slate-900">•••• •••• •••• 4242</div>
              <div className="text-xs text-slate-400">Expires 12/2027</div>
            </div>
          </div>
          <Button variant="outline" size="sm">Update</Button>
        </div>

        {/* Invoices */}
        <div>
          <h3 className="font-bold text-slate-900 mb-4">Recent Invoices</h3>
          <div className="space-y-2">
            {invoices.slice(0, 4).map(invoice => (
              <div 
                key={invoice.id} 
                className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => openModal('invoice', invoice)}
              >
                <div className="flex items-center gap-4">
                  <FileText className="size-5 text-slate-400" />
                  <div>
                    <div className="font-medium text-slate-900">{invoice.invoiceNumber}</div>
                    <div className="text-xs text-slate-400">{new Date(invoice.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className={cn(
                    "text-xs capitalize",
                    invoice.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 
                    invoice.status === 'pending' ? 'bg-orange-100 text-orange-700' : 
                    'bg-red-100 text-red-700'
                  )}>{invoice.status}</Badge>
                  <span className="font-bold text-slate-900">₹{invoice.total.toFixed(2)}</span>
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-600">
                    <Download size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button variant="outline" onClick={onClose} className="w-full">Close</Button>
      </div>
    </Modal>
  );
};

// Notifications Modal
const NotificationsModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { notifications, markNotificationRead, clearAllNotifications, showToast } = useDashboard();
  
  const unreadCount = notifications.filter(n => !n.read).length;

  const getTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertCircle className="size-5 text-orange-500" />;
      case 'success': return <CheckCircle className="size-5 text-emerald-500" />;
      case 'alert': return <AlertCircle className="size-5 text-red-500" />;
      default: return <Bell className="size-5 text-blue-500" />;
    }
  };

  const getTypeBg = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-orange-50';
      case 'success': return 'bg-emerald-50';
      case 'alert': return 'bg-red-50';
      default: return 'bg-blue-50';
    }
  };

  const handleMarkAllRead = () => {
    notifications.forEach(n => markNotificationRead(n.id));
    showToast('All notifications marked as read', 'success');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Notifications" size="md">
      <div className="space-y-4">
        {/* Header Actions */}
        {notifications.length > 0 && (
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Badge className="bg-blue-100 text-blue-700">{unreadCount} unread</Badge>
              )}
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
                  Mark all read
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => {
                  clearAllNotifications();
                  showToast('All notifications cleared', 'info');
                }}
              >
                Clear all
              </Button>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="max-h-96 overflow-y-auto space-y-2">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="size-16 mx-auto mb-4 text-slate-300" />
              <p className="text-slate-500 font-medium">No notifications</p>
              <p className="text-sm text-slate-400 mt-1">You're all caught up!</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  "p-4 rounded-xl cursor-pointer transition-all hover:shadow-md",
                  notif.read ? 'bg-slate-50' : getTypeBg(notif.type),
                  !notif.read && 'border-l-4 border-l-blue-500'
                )}
                onClick={() => markNotificationRead(notif.id)}
              >
                <div className="flex gap-3">
                  <div className={cn("size-10 rounded-xl flex items-center justify-center shrink-0", getTypeBg(notif.type))}>
                    {getTypeIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={cn("font-bold text-sm", notif.read ? 'text-slate-600' : 'text-slate-900')}>
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 shrink-0">{getTimeAgo(notif.timestamp)}</span>
                    </div>
                    <p className={cn("text-sm mt-1", notif.read ? 'text-slate-400' : 'text-slate-600')}>
                      {notif.message}
                    </p>
                    {!notif.read && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="size-2 bg-blue-500 rounded-full" />
                        <span className="text-[10px] font-medium text-blue-600">Unread</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};

// Cart Modal
const CartModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { cart, removeFromCart, openModal, clearCart } = useDashboard();
  
  const subtotal = cart.reduce((acc, item) => acc + item.price, 0);
  const tax = subtotal * 0.18; // 18% GST
  const total = subtotal + tax;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Shopping Cart" size="lg">
      <div className="space-y-6">
        {cart.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="size-16 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-500 font-medium">Your cart is empty</p>
            <p className="text-sm text-slate-400 mt-1">Browse services to add subscriptions</p>
            <Button className="mt-4" onClick={onClose}>
              Browse Services
            </Button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {cart.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl"
                >
                  <div className={cn("size-12 rounded-xl flex items-center justify-center shrink-0", item.serviceColor)}>
                    <Package className="size-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 truncate">{item.serviceName}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="text-[10px] bg-blue-100 text-blue-700">{item.plan}</Badge>
                      <span className="text-xs text-slate-400">{item.billingCycle === 'yearly' ? 'Annual' : 'Monthly'}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900">₹{item.price}</div>
                    <div className="text-xs text-slate-400">/month</div>
                  </div>
                  <button 
                    className="size-8 rounded-lg hover:bg-red-100 flex items-center justify-center text-slate-400 hover:text-red-600 transition-colors"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="border-t border-slate-200 pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal ({cart.length} items)</span>
                <span className="font-medium text-slate-900">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">GST (18%)</span>
                <span className="font-medium text-slate-900">₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-slate-200 pt-3">
                <span className="text-slate-900">Total</span>
                <span className="text-blue-600">₹{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="outline" onClick={clearCart} className="flex-1 text-red-600 hover:bg-red-50 hover:border-red-200">
                Clear Cart
              </Button>
              <Button 
                className="flex-1 gap-2"
                onClick={() => {
                  onClose();
                  setTimeout(() => openModal('checkout'), 100);
                }}
              >
                <CreditCard size={18} /> Proceed to Checkout
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

// Checkout Modal
const CheckoutModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { cart, addToCart, clearCart, addOrder, addInvoice, setPurchasedServices, showToast, invoices, currentUser } = useDashboard();
  const [step, setStep] = useState<'summary' | 'billing' | 'processing' | 'success'>('summary');
  const [billingInfo, setBillingInfo] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'India',
    gst: ''
  });
  const [paymentMethod] = useState<'card' | 'upi' | 'netbanking'>('card');
  const [processing, setProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState<Order | null>(null);
  const [activeCashfreeOrderId, setActiveCashfreeOrderId] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const subtotal = cart.reduce((acc, item) => acc + item.price, 0);
  const tax = subtotal * 0.18;
  const total = subtotal + tax;
  const currentUserId = String(currentUser?.id || '').trim();
  const currentUserEmail = String(currentUser?.email || '').trim().toLowerCase();
  const currentUserName =
    String(currentUser?.user_metadata?.full_name || '').trim() ||
    `${String(currentUser?.user_metadata?.first_name || '').trim()} ${String(currentUser?.user_metadata?.last_name || '').trim()}`.trim() ||
    (currentUserEmail ? currentUserEmail.split('@')[0] : 'User');

  const normalizeDigits = (value: string) => value.replace(/\D/g, '');

  const validateCheckoutInput = () => {
    const errors: Record<string, string> = {};

    if (!billingInfo.name.trim() || billingInfo.name.trim().length < 2) {
      errors.name = 'Enter a valid full name.';
    } else if (!/^[a-zA-Z\s.'-]+$/.test(billingInfo.name.trim())) {
      errors.name = 'Name can only contain letters and spaces.';
    }

    if (!/^\S+@\S+\.\S+$/.test(billingInfo.email.trim())) {
      errors.email = 'Enter a valid email address.';
    }

    const phoneDigits = normalizeDigits(billingInfo.phone);
    if (!/^\d{10,15}$/.test(phoneDigits)) {
      errors.phone = 'Enter a valid phone number.';
    }

    if (!billingInfo.company.trim()) {
      errors.company = 'Company name is required.';
    }
    if (!billingInfo.address.trim()) {
      errors.address = 'Address is required.';
    }
    if (!billingInfo.city.trim()) {
      errors.city = 'City is required.';
    }
    if (!billingInfo.zip.trim() || billingInfo.zip.trim().length < 4) {
      errors.zip = 'Enter a valid ZIP/PIN code.';
    }

    setValidationErrors(errors);
    return { isValid: Object.keys(errors).length === 0, phoneDigits };
  };

  useEffect(() => {
    if (!isOpen) return;

    setBillingInfo((previous) => ({
      ...previous,
      name: previous.name || currentUserName,
      email: previous.email || currentUserEmail,
    }));
  }, [isOpen, currentUserEmail, currentUserName]);

  const getCartWithIcons = (items: Omit<CartItem, 'icon'>[]): CartItem[] => {
    return items.map(item => ({
      ...item,
      icon: SERVICE_VISUALS[item.serviceId]?.icon || <Package className="size-6" />,
    }));
  };

  const normalizePaymentMethod = (method: 'card' | 'upi' | 'netbanking') => {
    return method === 'card' ? 'Card' : method === 'upi' ? 'UPI' : 'Net Banking';
  };

  const addPurchasedServicesFromItems = (items: Omit<CartItem, 'icon'>[], cashfreeOrderId?: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'sales': <TrendingUp className="size-5 text-white" />,
      'voice': <Phone className="size-5 text-white" />,
      'marketing': <Megaphone className="size-5 text-white" />,
      'business': <Briefcase className="size-5 text-white" />
    };

    const unitMap: Record<string, string> = {
      'sales': 'leads/month',
      'voice': 'minutes/month',
      'marketing': 'posts/month',
      'business': 'projects'
    };

    const today = new Date();
    const expiryDate = new Date(today);
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    items.forEach(item => {
      const newService: Service = {
        id: Date.now() + Math.random(),
        serviceId: item.serviceId,
        cashfreeOrderId,
        name: item.serviceName,
        plan: item.plan,
        status: 'active',
        icon: iconMap[item.serviceId] || <Package className="size-5 text-white" />,
        color: item.serviceColor,
        purchaseDate: today.toISOString().split('T')[0],
        expiryDate: expiryDate.toISOString().split('T')[0],
        lastUsageSyncDate: today.toISOString().split('T')[0],
        renewalCost: item.price * 12,
        features: item.features,
        usage: { used: 0, limit: 10000, unit: unitMap[item.serviceId] || 'units/month' }
      };
      setPurchasedServices(prev => [...prev, newService]);
    });
  };

  const finalizeSuccessfulPayment = async (
    orderId: string,
    paymentId: string | undefined,
    method: 'card' | 'upi' | 'netbanking',
    checkoutData: {
      cart: Omit<CartItem, 'icon'>[];
      subtotal: number;
      tax: number;
      total: number;
      billingInfo: typeof billingInfo;
    },
    options?: {
      intent?: 'purchase' | 'renewal';
      renewalServiceId?: number;
    }
  ) => {
    const orderNumber = `ORD-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;
    const hydratedCart = getCartWithIcons(checkoutData.cart);
    const effectiveUserId = currentUserId || checkoutData.billingInfo.email.trim().toLowerCase();
    const effectiveUserEmail = (currentUserEmail || checkoutData.billingInfo.email).trim().toLowerCase();
    const effectiveUserName = checkoutData.billingInfo.name?.trim() || currentUserName;

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      orderNumber,
      date: new Date().toISOString(),
      items: hydratedCart,
      subtotal: checkoutData.subtotal,
      tax: checkoutData.tax,
      total: checkoutData.total,
      status: 'completed',
      paymentMethod: `Cashfree - ${method.toUpperCase()}`,
      paymentId: paymentId || orderId
    };

    globalStore.addPayment({
      userId: effectiveUserId,
      cashfreeOrderId: orderId,
      userName: effectiveUserName || 'User',
      userEmail: effectiveUserEmail || 'user@example.com',
      amount: checkoutData.total,
      status: 'completed',
      method: normalizePaymentMethod(method),
      date: new Date().toISOString(),
      service: hydratedCart[0]?.serviceName || 'Service Bundle',
      plan: hydratedCart[0]?.plan || 'Custom',
      items: hydratedCart.map(item => ({
        name: item.serviceName,
        plan: item.plan,
        price: item.price
      }))
    });

    if (options?.intent === 'renewal' && typeof options.renewalServiceId === 'number') {
      let renewed = false;
      const today = new Date();
      setPurchasedServices((prev) =>
        prev.map((service) => {
          if (service.id !== options.renewalServiceId) return service;

          renewed = true;
          const currentExpiry = new Date(service.expiryDate);
          const baseDate = Number.isNaN(currentExpiry.getTime()) || currentExpiry < today ? today : currentExpiry;
          const newExpiry = new Date(baseDate);
          newExpiry.setFullYear(newExpiry.getFullYear() + 1);

          return {
            ...service,
            status: 'active',
            expiryDate: newExpiry.toISOString().split('T')[0],
            cashfreeOrderId: orderId,
          };
        })
      );

      if (!renewed) {
        addPurchasedServicesFromItems(checkoutData.cart, orderId);
      }
    } else {
      addPurchasedServicesFromItems(checkoutData.cart, orderId);
    }

    addOrder(newOrder);

    const paidAt = new Date().toISOString();
    const invoiceDate = new Date(paidAt);
    const dueDate = new Date(invoiceDate);
    dueDate.setDate(dueDate.getDate() + 1);
    const newInvoice: Invoice = {
      id: `inv_${Date.now()}`,
      invoiceNumber: `INV-${invoiceDate.getFullYear()}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`,
      date: invoiceDate.toISOString(),
      dueDate: dueDate.toISOString(),
      items: hydratedCart.map((item) => ({
        name: item.serviceName,
        plan: item.plan,
        quantity: 1,
        unitPrice: item.price,
        total: item.price,
      })),
      subtotal: checkoutData.subtotal,
      tax: checkoutData.tax,
      total: checkoutData.total,
      status: 'paid',
      paidDate: paidAt,
      customerInfo: {
        name: checkoutData.billingInfo.name,
        email: checkoutData.billingInfo.email,
        company: checkoutData.billingInfo.company,
        address: `${checkoutData.billingInfo.address}, ${checkoutData.billingInfo.city}, ${checkoutData.billingInfo.zip}`,
        gst: checkoutData.billingInfo.gst || undefined,
      },
    };
    addInvoice(newInvoice);

    localStorage.setItem('volosist_last_billing_info', JSON.stringify(checkoutData.billingInfo));

    setOrderComplete(newOrder);
    setStep('success');

    try {
      const normalizedBillingPhone = normalizeDigits(checkoutData.billingInfo.phone);

      await upsertPayment({
        user_id: currentUserId || effectiveUserId,
        user_name: effectiveUserName || 'User',
        user_email: effectiveUserEmail || undefined,
        user_phone: normalizedBillingPhone || undefined,
        plan_id: hydratedCart[0]?.serviceId || 'bundle',
        plan_name: hydratedCart.map(i => `${i.serviceName} (${i.plan})`).join(', '),
        amount: Math.round(checkoutData.total * 100),
        currency: 'INR',
        cashfree_order_id: orderId,
        cashfree_payment_id: paymentId,
        status: 'success',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.warn('[checkout] payment upsert skipped:', error);
    }
  };

  const handlePayment = async () => {
    if (!currentUserId || !currentUserEmail) {
      showToast('Your session was not detected. Please sign in again to continue.', 'error');
      return;
    }

    const { isValid, phoneDigits } = validateCheckoutInput();
    if (!isValid) {
      showToast('Please enter valid billing and payment details before checkout.', 'error');
      setStep('billing');
      return;
    }

    setStep('processing');
    setProcessing(true);

    try {
      const orderId = `cf_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      const returnUrl = `${window.location.origin}/dashboard?cf_return=1&cf_order_id={order_id}`;
      const cartForStorage = cart.map(({ icon, ...rest }) => rest);
      const renewalServiceIdRaw = localStorage.getItem('volosist_pending_renewal_service');
      const renewalServiceId = renewalServiceIdRaw ? Number(renewalServiceIdRaw) : undefined;
      const isRenewalIntent = typeof renewalServiceId === 'number' && Number.isFinite(renewalServiceId);

      const cfOrder = await createCashfreeOrder({
        orderId,
        currency: 'INR',
        customerName: billingInfo.name,
        customerEmail: billingInfo.email,
        customerPhone: phoneDigits,
        planId: cartForStorage[0]?.serviceId || 'bundle',
        planName: cartForStorage.map(i => `${i.serviceName} (${i.plan})`).join(', '),
        returnUrl,
        cartItems: cartForStorage.map((item) => ({
          serviceId: item.serviceId,
          plan: item.plan,
          billingCycle: item.billingCycle,
          quantity: isRenewalIntent && item.billingCycle === 'yearly' ? 12 : 1,
        })),
      });

      const serverSubtotal = Number((cfOrder.subtotal ?? subtotal).toFixed(2));
      const serverTax = Number((cfOrder.tax ?? tax).toFixed(2));
      const serverTotal = Number((cfOrder.order_amount ?? total).toFixed(2));

      localStorage.setItem('cashfree_pending_checkout', JSON.stringify({
        orderId: cfOrder.order_id,
        paymentMethod,
        billingInfo,
        subtotal: serverSubtotal,
        tax: serverTax,
        total: serverTotal,
        cart: cartForStorage,
        intent: isRenewalIntent ? 'renewal' : 'purchase',
        renewalServiceId: isRenewalIntent ? renewalServiceId : undefined,
        createdAt: new Date().toISOString(),
      }));

      if (isRenewalIntent) {
        localStorage.removeItem('volosist_pending_renewal_service');
      }

      setActiveCashfreeOrderId(cfOrder.order_id);
      await openCashfreeCheckout(cfOrder.payment_session_id, returnUrl, cfOrder.payment_link);
    } catch (error: any) {
      setProcessing(false);
      setStep('billing');
      showToast(error?.message || 'Failed to start payment. Please try again.', 'error');
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const params = new URLSearchParams(window.location.search);
    const orderIdFromReturn = params.get('cf_order_id');
    const isCashfreeReturn = params.get('cf_return') === '1' && Boolean(orderIdFromReturn);

    if (!isCashfreeReturn || processing) return;

    const verifyAndFinalize = async () => {
      setStep('processing');
      setProcessing(true);

      try {
        const verification = await verifyCashfreePayment(orderIdFromReturn as string);
        const pendingRaw = localStorage.getItem('cashfree_pending_checkout');

        if (!pendingRaw) {
          throw new Error('Checkout session expired. Please try payment again.');
        }

        const pending = JSON.parse(pendingRaw) as {
          orderId: string;
          paymentMethod: 'card' | 'upi' | 'netbanking';
          billingInfo: typeof billingInfo;
          subtotal: number;
          tax: number;
          total: number;
          cart: Omit<CartItem, 'icon'>[];
          intent?: 'purchase' | 'renewal';
          renewalServiceId?: number;
        };

        const isSuccessful = verification.payment_status === 'SUCCESS' || verification.order_status === 'PAID';
        if (!isSuccessful) {
          throw new Error(`Payment not completed. Current status: ${verification.payment_status || verification.order_status}`);
        }

        clearCart();
        pending.cart.forEach(item => addToCart({ ...item, icon: SERVICE_VISUALS[item.serviceId]?.icon || <Package className="size-6" /> }));

        await finalizeSuccessfulPayment(
          verification.order_id,
          verification.payment_id,
          pending.paymentMethod,
          {
            cart: pending.cart,
            subtotal: pending.subtotal,
            tax: pending.tax,
            total: pending.total,
            billingInfo: pending.billingInfo,
          },
          {
            intent: pending.intent,
            renewalServiceId: pending.renewalServiceId,
          }
        );

        localStorage.removeItem('cashfree_pending_checkout');
        setActiveCashfreeOrderId(verification.order_id);
        showToast('Payment verified and subscription activated.', 'success');
      } catch (error: any) {
        setStep('billing');
        localStorage.removeItem('cashfree_pending_checkout');
        showToast(error?.message || 'Unable to verify payment. Please retry verification.', 'error');
      } finally {
        setProcessing(false);
        const url = new URL(window.location.href);
        url.searchParams.delete('cf_return');
        url.searchParams.delete('cf_order_id');
        window.history.replaceState({}, '', `${url.pathname}${url.search}`);
      }
    };

    verifyAndFinalize();
  }, [isOpen]);

  const handleClose = () => {
    if (step === 'success') {
      clearCart();
      setStep('summary');
      setOrderComplete(null);
      setActiveCashfreeOrderId(null);
    }
    onClose();
  };

  if (cart.length === 0 && step !== 'success') {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Checkout">
        <div className="text-center py-12">
          <ShoppingCart className="size-16 mx-auto mb-4 text-slate-300" />
          <p className="text-slate-500 font-medium">Your cart is empty</p>
          <Button className="mt-4" onClick={onClose}>Continue Shopping</Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={step === 'success' ? 'Order Confirmed!' : 'Checkout'} size="lg">
      {/* Progress Steps */}
      {step !== 'success' && step !== 'processing' && (
        <div className="flex items-center justify-center gap-2 mb-6">
          {['summary', 'billing'].map((s, idx) => (
            <React.Fragment key={s}>
              <div className={cn(
                "size-8 rounded-full flex items-center justify-center text-sm font-bold",
                step === s ? 'bg-blue-600 text-white' : 
                ['summary', 'billing'].indexOf(step) > idx ? 'bg-emerald-500 text-white' : 
                'bg-slate-100 text-slate-400'
              )}>
                {['summary', 'billing'].indexOf(step) > idx ? <Check size={16} /> : idx + 1}
              </div>
              {idx < 1 && <div className={cn(
                "w-16 h-0.5",
                ['summary', 'billing'].indexOf(step) > idx ? 'bg-emerald-500' : 'bg-slate-200'
              )} />}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Step: Summary */}
      {step === 'summary' && (
        <div className="space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
              <ShoppingCart size={18} /> Order Summary
            </h3>
            <div className="space-y-3">
              {cart.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={cn("size-10 rounded-lg flex items-center justify-center", item.serviceColor)}>
                      <Package className="size-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">{item.serviceName}</div>
                      <div className="text-xs text-slate-400">{item.plan} Plan • Monthly</div>
                    </div>
                  </div>
                  <div className="font-bold text-slate-900">₹{item.price}/mo</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-medium">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">GST (18%)</span>
              <span className="font-medium">₹{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-blue-200 pt-2 mt-2">
              <span>Total</span>
              <span className="text-blue-600">₹{total.toFixed(2)}</span>
            </div>
          </div>

          <Button className="w-full gap-2" onClick={() => setStep('billing')}>
            Continue to Billing <ArrowRight size={18} />
          </Button>
        </div>
      )}

      {/* Step: Billing Info */}
      {step === 'billing' && (
        <div className="space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Building2 size={18} /> Billing Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1 space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Full Name</label>
                <Input value={billingInfo.name} onChange={e => setBillingInfo({...billingInfo, name: e.target.value})} className="h-11" />
              </div>
              <div className="col-span-2 sm:col-span-1 space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Email</label>
                <Input type="email" value={billingInfo.email} onChange={e => setBillingInfo({...billingInfo, email: e.target.value})} className="h-11" />
                {validationErrors.email && <p className="text-xs text-red-500">{validationErrors.email}</p>}
              </div>
              <div className="col-span-2 sm:col-span-1 space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Phone</label>
                <Input type="tel" value={billingInfo.phone} onChange={e => setBillingInfo({...billingInfo, phone: e.target.value})} className="h-11" />
                {validationErrors.phone && <p className="text-xs text-red-500">{validationErrors.phone}</p>}
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Company</label>
                <Input value={billingInfo.company} onChange={e => setBillingInfo({...billingInfo, company: e.target.value})} className="h-11" />
                {validationErrors.company && <p className="text-xs text-red-500">{validationErrors.company}</p>}
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Address</label>
                <Input value={billingInfo.address} onChange={e => setBillingInfo({...billingInfo, address: e.target.value})} className="h-11" />
                {validationErrors.address && <p className="text-xs text-red-500">{validationErrors.address}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">City</label>
                <Input value={billingInfo.city} onChange={e => setBillingInfo({...billingInfo, city: e.target.value})} className="h-11" />
                {validationErrors.city && <p className="text-xs text-red-500">{validationErrors.city}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">ZIP Code</label>
                <Input value={billingInfo.zip} onChange={e => setBillingInfo({...billingInfo, zip: e.target.value})} className="h-11" />
                {validationErrors.zip && <p className="text-xs text-red-500">{validationErrors.zip}</p>}
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">GST Number (Optional)</label>
                <Input value={billingInfo.gst} onChange={e => setBillingInfo({...billingInfo, gst: e.target.value})} placeholder="GSTIN12345678" className="h-11" />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep('summary')} className="flex-1">Back</Button>
            <Button className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700" onClick={handlePayment}>
              <Lock size={16} />
              Continue to Payment <ArrowRight size={18} />
            </Button>
          </div>
        </div>
      )}

      {/* Step: Processing */}
      {step === 'processing' && (
        <div className="py-16 text-center space-y-6">
          <div className="relative">
            <div className="size-20 mx-auto rounded-full bg-blue-100 flex items-center justify-center">
              <Loader2 className="size-10 text-blue-600 animate-spin" />
            </div>
            <motion.div
              className="absolute inset-0 size-20 mx-auto rounded-full border-4 border-blue-600"
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Processing Payment...</h3>
            <p className="text-slate-500">Please wait while we process your payment securely.</p>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
            <Lock size={14} />
            <span>
              {activeCashfreeOrderId ? `Verifying order ${activeCashfreeOrderId}...` : 'Secured by Cashfree Payment Gateway'}
            </span>
          </div>
        </div>
      )}

      {/* Step: Success */}
      {step === 'success' && orderComplete && (
        <div className="py-8 space-y-6">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="size-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-4"
            >
              <CheckCircle className="size-10 text-emerald-600" />
            </motion.div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Payment Successful!</h3>
            <p className="text-slate-500">Your subscription is now active</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Order Number</span>
              <span className="font-bold text-slate-900">{orderComplete.orderNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Payment ID</span>
              <span className="font-mono text-xs text-slate-600">{orderComplete.paymentId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Amount Paid</span>
              <span className="font-bold text-emerald-600">₹{orderComplete.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Payment Method</span>
              <span className="text-slate-600">{orderComplete.paymentMethod}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={async () => {
                if (!invoices[0]) {
                  showToast('Invoice is being generated. Please try again in a moment.', 'info');
                  return;
                }
                try {
                  await downloadInvoiceReceipt(invoices[0]);
                } catch {
                  showToast('Unable to download invoice PDF right now. Please try again.', 'error');
                }
              }}
            >
              <Download size={16} /> Download Invoice
            </Button>
            <Button className="flex-1" onClick={handleClose}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

const INVOICE_LOGO_PATH = '/volosist-logo.svg';
const downloadInvoiceReceipt = async (invoice: Invoice) => {
  await downloadInvoicePdf(invoice, {
    logoPath: INVOICE_LOGO_PATH,
    supportPhone: '+91 9769789769',
    supportEmail: 'volosist.ai@gmail.com',
    supportLabel: 'Global Support',
    inquiryLabel: 'Email Inquiry',
    fileSuffix: 'volosist-receipt',
  });
};

// Invoice Modal
const InvoiceModal = ({ isOpen, onClose, invoice }: { isOpen: boolean; onClose: () => void; invoice: Invoice | null }) => {
  const { showToast } = useDashboard();
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    try {
      await downloadInvoiceReceipt(invoice);
    } catch {
      showToast('Unable to download invoice PDF right now. Please try again.', 'error');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="lg">
      <div className="space-y-6">
        {/* Invoice Header */}
        <div className="flex justify-between items-start border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <img src={INVOICE_LOGO_PATH} alt="Volosist" className="h-12 w-auto object-contain" />
            </div>
            <div className="text-sm text-slate-500 space-y-1">
              <p>AI Automation Solutions</p>
              <p>Global Support: +91 9769789769</p>
              <p>Email Inquiry: volosist.ai@gmail.com</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-black text-slate-900 mb-2">INVOICE</h2>
            <div className="text-sm space-y-1">
              <p><span className="text-slate-400">Invoice #:</span> <span className="font-bold">{invoice.invoiceNumber}</span></p>
              <p><span className="text-slate-400">Date:</span> {new Date(invoice.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              <p><span className="text-slate-400">Due:</span> {new Date(invoice.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
            <Badge className={cn(
              "mt-2 text-xs",
              invoice.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 
              invoice.status === 'pending' ? 'bg-orange-100 text-orange-700' : 
              'bg-red-100 text-red-700'
            )}>
              {invoice.status.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Bill To */}
        <div className="bg-slate-50 rounded-xl p-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Bill To</h4>
          <div className="text-sm space-y-1">
            <p className="font-bold text-slate-900">{invoice.customerInfo.name}</p>
            <p className="text-slate-600">{invoice.customerInfo.company}</p>
            <p className="text-slate-500">{invoice.customerInfo.email}</p>
            <p className="text-slate-500">{invoice.customerInfo.address}</p>
            {invoice.customerInfo.gst && (
              <p className="text-slate-500">GST: {invoice.customerInfo.gst}</p>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 bg-slate-50 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <div className="col-span-5">Service</div>
            <div className="col-span-2 text-center">Qty</div>
            <div className="col-span-2 text-right">Unit Price</div>
            <div className="col-span-3 text-right">Amount</div>
          </div>
          {invoice.items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-4 p-4 border-t border-slate-100 items-center">
              <div className="col-span-5">
                <p className="font-medium text-slate-900">{item.name}</p>
                <p className="text-xs text-slate-400">{item.plan}</p>
              </div>
              <div className="col-span-2 text-center text-slate-600">{item.quantity}</div>
              <div className="col-span-2 text-right text-slate-600">₹{item.unitPrice.toFixed(2)}</div>
              <div className="col-span-3 text-right font-bold text-slate-900">₹{item.total.toFixed(2)}</div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-72 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-medium">₹{invoice.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">GST (18%)</span>
              <span className="font-medium">₹{invoice.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-slate-200 pt-2">
              <span>Total</span>
              <span className="text-blue-600">₹{invoice.total.toFixed(2)}</span>
            </div>
            {invoice.paidDate && (
              <div className="flex justify-between text-sm pt-2 text-emerald-600">
                <span>Paid on</span>
                <span>{new Date(invoice.paidDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-slate-200">
          <Button variant="outline" onClick={handlePrint} className="flex-1 gap-2">
            <Printer size={16} /> Print
          </Button>
          <Button onClick={handleDownload} className="flex-1 gap-2">
            <Download size={16} /> Download PDF
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Order Details Modal
const OrderDetailsModal = ({ isOpen, onClose, order }: { isOpen: boolean; onClose: () => void; order: Order | null }) => {
  if (!order) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Order Details">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{order.orderNumber}</h3>
            <p className="text-sm text-slate-500">{new Date(order.date).toLocaleString()}</p>
          </div>
          <Badge className={cn(
            "text-xs",
            order.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 
            order.status === 'pending' ? 'bg-orange-100 text-orange-700' : 
            'bg-red-100 text-red-700'
          )}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Items</h4>
          {order.items.map(item => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className={cn("size-10 rounded-lg flex items-center justify-center", item.serviceColor)}>
                  <Package className="size-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">{item.serviceName}</p>
                  <p className="text-xs text-slate-400">{item.plan} Plan</p>
                </div>
              </div>
              <span className="font-bold text-slate-900">₹{item.price}/mo</span>
            </div>
          ))}
        </div>

        <div className="bg-slate-50 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Subtotal</span>
            <span className="font-medium">₹{order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Tax (GST 18%)</span>
            <span className="font-medium">₹{order.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t border-slate-200 pt-2">
            <span>Total</span>
            <span className="text-blue-600">₹{order.total.toFixed(2)}</span>
          </div>
        </div>

        <div className="bg-emerald-50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="size-5 text-emerald-600" />
            <div>
              <p className="font-medium text-emerald-700">Payment Successful</p>
              <p className="text-xs text-emerald-600">{order.paymentMethod} • {order.paymentId}</p>
            </div>
          </div>
        </div>

        <Button variant="outline" onClick={onClose} className="w-full">Close</Button>
      </div>
    </Modal>
  );
};

// Toast Component
const ToastContainer = ({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: number) => void }) => (
  <div className="fixed bottom-4 right-4 z-[60] space-y-2">
    <AnimatePresence>
      {toasts.map(toast => (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg min-w-[300px]",
            toast.type === 'success' ? 'bg-emerald-600 text-white' :
            toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-slate-800 text-white'
          )}
        >
          {toast.type === 'success' ? <CheckCircle size={20} /> : 
           toast.type === 'error' ? <AlertCircle size={20} /> : <Bell size={20} />}
          <span className="flex-1 text-sm font-medium">{toast.message}</span>
          <button onClick={() => removeToast(toast.id)} className="text-white/70 hover:text-white">
            <X size={16} />
          </button>
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

// --- Dashboard Sub-Views ---

const OverviewView = () => {
  const { purchasedServices, teamMembers, setActiveTab, openModal, clearCart, addToCart, showToast } = useDashboard();

  const getDaysRemaining = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diff = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const totalMonthlySpend = purchasedServices.reduce((acc, s) => acc + (s.renewalCost / 12), 0);

  const handleStartRenewalCheckout = (service: Service) => {
    try {
      const serviceId = service.serviceId || resolveServiceIdFromName(service.name);
      const normalizedPlanName =
        String(service.plan || '')
          .trim()
          .toLowerCase()
          .replace(/^\w/, (char) => char.toUpperCase()) || 'Basic';

      const annualRenewalCost = Number.isFinite(service.renewalCost)
        ? Number(service.renewalCost.toFixed(2))
        : 0;

      if (annualRenewalCost <= 0) {
        showToast('Unable to start renewal checkout for this plan. Please contact support.', 'error');
        return;
      }

      localStorage.setItem('volosist_pending_renewal_service', String(service.id));
      clearCart();
      addToCart({
        id: `renew_${service.id}_${Date.now()}`,
        serviceId,
        serviceName: service.name,
        plan: normalizedPlanName,
        price: annualRenewalCost,
        billingCycle: 'yearly',
        features: Array.isArray(service.features) ? service.features : [],
        serviceColor: service.color || 'bg-slate-600',
        icon: SERVICE_VISUALS[serviceId]?.icon || <Package className="size-6" />,
      });

      openModal('checkout');
      showToast('Checkout opened. Click Continue to Payment to proceed to Cashfree.', 'info');
    } catch (error: any) {
      showToast(error?.message || 'Unable to prepare renewal checkout. Please try again.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setActiveTab('services')}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="size-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Package className="size-4 text-blue-600" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900">{purchasedServices.length}</div>
          <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Active Services</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => openModal('billing')}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="size-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <CreditCard className="size-4 text-emerald-600" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900">₹{Math.round(totalMonthlySpend)}</div>
          <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Monthly Spend</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setActiveTab('security')}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="size-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <Users className="size-4 text-purple-600" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900">{teamMembers.length}</div>
          <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Team Members</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-4 rounded-2xl border border-orange-200 shadow-sm bg-orange-50 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setActiveTab('services')}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="size-8 rounded-lg bg-orange-100 flex items-center justify-center">
              <AlertCircle className="size-4 text-orange-600" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900">{purchasedServices.filter(s => s.status === 'expiring').length}</div>
          <div className="text-[10px] font-medium text-orange-600 uppercase tracking-wider">Expiring Soon</div>
        </motion.div>
      </div>

      {/* Quick Actions Row - Below Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button 
          className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl text-white text-left hover:from-blue-700 hover:to-blue-800 transition-all group"
          onClick={() => setActiveTab('services')}
        >
          <div className="size-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Plus className="size-5" />
          </div>
          <div className="flex-1">
            <div className="font-bold text-sm">Add New Service</div>
            <div className="text-xs text-blue-200">Browse plans</div>
          </div>
          <ChevronRight size={18} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </button>

        <button 
          className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200 text-left hover:border-blue-200 hover:shadow-md transition-all group"
          onClick={() => openModal('invite')}
        >
          <div className="size-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <UserPlus className="size-4 text-purple-600" />
          </div>
          <div className="flex-1">
            <div className="font-bold text-slate-900 text-sm">Invite Team</div>
            <div className="text-xs text-slate-400">Manage access</div>
          </div>
          <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
        </button>

        <button 
          className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200 text-left hover:border-blue-200 hover:shadow-md transition-all group"
          onClick={() => openModal('billing')}
        >
          <div className="size-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <CreditCard className="size-4 text-emerald-600" />
          </div>
          <div className="flex-1">
            <div className="font-bold text-slate-900 text-sm">Billing</div>
            <div className="text-xs text-slate-400">View invoices</div>
          </div>
          <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
        </button>
      </div>

      {/* Purchased Services */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-slate-900">Your Services</h2>
          <Button variant="ghost" size="sm" className="text-blue-600 gap-2 font-bold" onClick={() => setActiveTab('services')}>
            View All <ChevronRight size={16} />
          </Button>
        </div>
        <div className="space-y-4">
          {purchasedServices.map((service, idx) => {
            const daysRemaining = getDaysRemaining(service.expiryDate);
            const usagePercent = (service.usage.used / service.usage.limit) * 100;
            
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={cn(
                  "bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-all",
                  service.status === 'expiring' ? 'border-orange-200' : 'border-slate-200'
                )}
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Service Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className={cn("size-12 rounded-2xl flex items-center justify-center shrink-0", service.color)}>
                      {service.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-slate-900">{service.name}</h3>
                        <Badge className={cn(
                          "text-[10px]",
                          service.plan === 'Business' ? 'bg-amber-100 text-amber-700' :
                          service.plan === 'Pro' ? 'bg-blue-100 text-blue-700' :
                          'bg-slate-100 text-slate-600'
                        )}>
                          {service.plan}
                        </Badge>
                        {service.status === 'expiring' && (
                          <Badge className="bg-orange-100 text-orange-700 text-[10px]">
                            Expiring Soon
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {service.features.slice(0, 3).map((f, i) => (
                          <span key={i} className="text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded">
                            {f}
                          </span>
                        ))}
                        {service.features.length > 3 && (
                          <span className="text-[10px] font-medium text-slate-400">
                            +{service.features.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Usage */}
                  <div className="lg:w-48">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400 font-medium">Usage</span>
                      <span className="font-bold text-slate-600">{service.usage.used.toLocaleString()} / {service.usage.limit.toLocaleString()}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all",
                          usagePercent > 90 ? 'bg-red-500' : usagePercent > 70 ? 'bg-orange-500' : 'bg-blue-600'
                        )} 
                        style={{ width: `${Math.min(usagePercent, 100)}%` }} 
                      />
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">{service.usage.unit}</div>
                  </div>

                  {/* Validity & Renewal */}
                  <div className="lg:w-52 flex flex-col items-end">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="size-4 text-slate-400" />
                      <span className={cn(
                        "text-sm font-bold",
                        daysRemaining < 30 ? 'text-orange-600' : 'text-slate-600'
                      )}>
                        {daysRemaining} days remaining
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mb-3">
                      Expires: {new Date(service.expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <Button 
                      size="sm" 
                      type="button"
                      className={cn(
                        "gap-2 rounded-xl text-xs font-bold",
                        service.status === 'expiring' ? 'bg-orange-600 hover:bg-orange-700' : ''
                      )}
                      onClick={() => handleStartRenewalCheckout(service)}
                    >
                      <RefreshCw size={14} /> Renew ₹{service.renewalCost}/yr
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
          {purchasedServices.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Package className="size-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No active services yet</p>
              <Button className="mt-4" onClick={() => setActiveTab('services')}>
                Browse Services
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

const ServicesView = () => {
  const navigate = useNavigate();
  const { purchasedServices, cart, addToCart, removeFromCart, openModal, showToast } = useDashboard();
  const [serviceCatalog, setServiceCatalog] = useState<ServiceCatalogItem[]>(globalStore.getServiceCatalog());
  const [selectedPlans, setSelectedPlans] = useState<Record<string, number>>({});
  const [billingCycle, setBillingCycle] = useState<Record<string, 'monthly' | 'yearly'>>({});

  useEffect(() => {
    const syncCatalog = () => setServiceCatalog(globalStore.getServiceCatalog());
    syncCatalog();
    const unsubscribe = globalStore.subscribe(syncCatalog);
    return unsubscribe;
  }, []);

  useEffect(() => {
    setSelectedPlans((previous) => {
      const next = { ...previous };
      serviceCatalog.forEach((service) => {
        if (typeof next[service.id] !== 'number') {
          next[service.id] = Math.min(1, Math.max(0, service.plans.length - 1));
        } else if (next[service.id] > service.plans.length - 1) {
          next[service.id] = Math.max(0, service.plans.length - 1);
        }
      });
      return next;
    });

    setBillingCycle((previous) => {
      const next = { ...previous };
      serviceCatalog.forEach((service) => {
        if (!next[service.id]) {
          next[service.id] = 'monthly';
        }
      });
      return next;
    });
  }, [serviceCatalog]);

  const availableServices = useMemo(
    () =>
      serviceCatalog.map((service) => ({
        ...service,
        ...(SERVICE_VISUALS[service.id] ?? {
          icon: <Package className="size-6" />,
          color: 'text-slate-600',
          bgColor: 'bg-slate-100',
          serviceColor: 'bg-slate-600',
        }),
      })),
    [serviceCatalog]
  );

  const isAlreadySubscribed = (serviceName: string) => {
    return purchasedServices.some(s => s.name === serviceName);
  };

  const getCartItem = (serviceId: string, planName: string) => {
    return cart.find(i => i.serviceId === serviceId && i.plan === planName);
  };

  const getPurchasedServiceByName = (serviceName: string) => {
    return purchasedServices.find((service) => service.name === serviceName) || null;
  };

  const handleAddToCart = (service: any, plan: any) => {
    const cartItem: CartItem = {
      id: `${service.id}_${plan.name}_${Date.now()}`,
      serviceId: service.id,
      serviceName: service.name,
      plan: plan.name,
      price: billingCycle[service.id] === 'yearly' ? Math.round(plan.price * 0.8) : plan.price,
      billingCycle: billingCycle[service.id],
      features: plan.features,
      serviceColor: service.serviceColor,
      icon: service.icon
    };
    addToCart(cartItem);
    showToast(`${service.name} - ${plan.name} added to cart!`, 'success');
    // Auto open cart modal
    openModal('cart');
  };

  const handleRemoveFromCart = (serviceId: string, planName: string) => {
    const item = getCartItem(serviceId, planName);
    if (item) {
      removeFromCart(item.id);
      showToast(`Removed from cart`, 'info');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with Cart Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Available Services</h2>
          <p className="text-slate-500 text-sm mt-1">Browse and subscribe to our automation services</p>
        </div>
        <Button 
          variant="outline" 
          className="gap-2 relative"
          onClick={() => openModal('cart')}
        >
          <ShoppingCart size={18} />
          <span>Cart</span>
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 size-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {cart.length}
            </span>
          )}
        </Button>
      </div>

      {/* Cart Preview Banner */}
      {cart.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-4 text-white">
            <ShoppingCart size={24} />
            <div>
              <p className="font-bold">{cart.length} item{cart.length > 1 ? 's' : ''} in cart</p>
              <p className="text-sm text-blue-200">
                Total: ₹{cart.reduce((acc, i) => acc + i.price, 0).toFixed(2)}/month
              </p>
            </div>
          </div>
          <Button 
            className="bg-white text-blue-600 hover:bg-blue-50"
            onClick={() => openModal('checkout')}
          >
            Proceed to Checkout
          </Button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {availableServices.map((service) => {
          const subscribed = isAlreadySubscribed(service.name);
          const hasPlans = service.plans.length > 0;
          const selectedIdxRaw = selectedPlans[service.id];
          const selectedIdx = hasPlans
            ? (typeof selectedIdxRaw === 'number' && selectedIdxRaw >= 0 && selectedIdxRaw < service.plans.length ? selectedIdxRaw : 0)
            : -1;
          const currentPlan = hasPlans ? service.plans[selectedIdx] : null;
          const cartItem = currentPlan ? getCartItem(service.id, currentPlan.name) : undefined;
          const inCart = !!cartItem;
          const cycle = billingCycle[service.id] ?? 'monthly';
          
          return (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "bg-white rounded-2xl border overflow-hidden transition-shadow",
                subscribed ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200 hover:shadow-lg"
              )}
            >
              {/* Service Header */}
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-start gap-4">
                  <div className={cn("size-14 rounded-2xl flex items-center justify-center", service.bgColor, service.color)}>
                    {service.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900">{service.name}</h3>
                      {subscribed && (
                        <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">
                          <Check size={12} className="mr-1" /> Active
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{service.description}</p>
                  </div>
                </div>

                {/* Billing Toggle */}
                {!subscribed && (
                  <div className="flex items-center justify-center gap-3 mt-4 p-1 bg-slate-100 rounded-lg">
                    <button
                      onClick={() => setBillingCycle(prev => ({ ...prev, [service.id]: 'monthly' }))}
                      className={cn(
                        "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all",
                        cycle === 'monthly' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'
                      )}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => setBillingCycle(prev => ({ ...prev, [service.id]: 'yearly' }))}
                      className={cn(
                        "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all relative",
                        cycle === 'yearly' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'
                      )}
                    >
                      Yearly
                      <Badge className="absolute -top-3 -right-2 bg-emerald-500 text-white text-[9px] px-1.5">-20%</Badge>
                    </button>
                  </div>
                )}
              </div>

              {/* Pricing Plans */}
              <div className="p-6 bg-slate-50">
                {hasPlans ? (
                <>
                <div className="grid grid-cols-3 gap-3">
                  {service.plans.map((plan, idx) => {
                    const planPrice = cycle === 'yearly' ? Math.round(plan.price * 0.8) : plan.price;
                    return (
                      <button
                        key={plan.name}
                        onClick={() => setSelectedPlans(prev => ({ ...prev, [service.id]: idx }))}
                        disabled={subscribed}
                        className={cn(
                          "p-4 rounded-xl text-center transition-all",
                          selectedIdx === idx && !subscribed
                            ? "bg-blue-600 text-white shadow-lg scale-105" 
                            : subscribed 
                              ? "bg-slate-100 border border-slate-200 cursor-not-allowed opacity-60"
                              : "bg-white border border-slate-200 hover:border-blue-300"
                        )}
                      >
                        <div className={cn(
                          "text-xs font-bold uppercase tracking-wider mb-2", 
                          selectedIdx === idx && !subscribed ? 'text-blue-200' : 'text-slate-400'
                        )}>
                          {plan.name}
                        </div>
                        <div className={cn(
                          "text-2xl font-black mb-1", 
                          selectedIdx === idx && !subscribed ? 'text-white' : 'text-slate-900'
                        )}>
                          ₹{planPrice}
                        </div>
                        <div className={cn(
                          "text-[10px]", 
                          selectedIdx === idx && !subscribed ? 'text-blue-200' : 'text-slate-400'
                        )}>per month</div>
                      </button>
                    );
                  })}
                </div>

                {/* Features Preview */}
                <div className="mt-4 p-3 bg-white rounded-lg border border-slate-100">
                  <div className="text-xs font-bold text-slate-400 uppercase mb-2">Includes:</div>
                  <div className="grid grid-cols-2 gap-1">
                    {currentPlan?.features.slice(0, 4).map((f, i) => (
                      <div key={i} className="flex items-center gap-1 text-xs text-slate-600">
                        <Check size={12} className="text-emerald-500 shrink-0" />
                        <span className="truncate">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  {subscribed ? (
                    <>
                      <Button className="flex-1 gap-2 bg-emerald-600" disabled>
                        <Check size={18} /> Already Subscribed
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 gap-2 border-orange-200 text-orange-700 hover:bg-orange-50"
                        onClick={() => {
                          try {
                            const purchasedService = getPurchasedServiceByName(service.name);
                            if (!purchasedService) {
                              showToast('Unable to load refund details for this service.', 'error');
                              return;
                            }

                            const params = new URLSearchParams({
                              serviceId: String(purchasedService.serviceId || ''),
                              serviceName: String(purchasedService.name || ''),
                              plan: String(purchasedService.plan || ''),
                              orderId: String(purchasedService.cashfreeOrderId || ''),
                              amount: String(
                                Number.isFinite(purchasedService.renewalCost)
                                  ? purchasedService.renewalCost
                                  : 0
                              ),
                            });

                            navigate(`/dashboard/refund?${params.toString()}`, {
                              state: {
                                service: {
                                  serviceId: String(purchasedService.serviceId || ''),
                                  name: String(purchasedService.name || ''),
                                  plan: String(purchasedService.plan || ''),
                                  cashfreeOrderId: String(purchasedService.cashfreeOrderId || ''),
                                  renewalCost: Number.isFinite(purchasedService.renewalCost)
                                    ? purchasedService.renewalCost
                                    : 0,
                                },
                              },
                            });
                          } catch (error) {
                            console.error('[refund] failed to open refund page:', error);
                            showToast('Refund page could not be opened. Please refresh and try again.', 'error');
                          }
                        }}
                      >
                        <History size={16} /> Refund
                      </Button>
                    </>
                  ) : inCart ? (
                    <>
                      <Button 
                        variant="outline"
                        className="flex-1 gap-2 border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => currentPlan && handleRemoveFromCart(service.id, currentPlan.name)}
                      >
                        <X size={16} /> Remove
                      </Button>
                      <Button 
                        className="flex-1 gap-2"
                        onClick={() => openModal('checkout')}
                      >
                        <ShoppingCart size={16} /> Checkout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="outline"
                        className="flex-1 gap-2"
                        onClick={() => currentPlan && handleAddToCart(service, currentPlan)}
                      >
                        <ShoppingCart size={16} /> Add to Cart
                      </Button>
                      <Button 
                        className="flex-1 gap-2"
                        onClick={() => {
                          if (!currentPlan) return;
                          handleAddToCart(service, currentPlan);
                          openModal('checkout');
                        }}
                      >
                        <Sparkles size={16} /> Buy Now
                      </Button>
                    </>
                  )}
                </div>
                </>
                ) : (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-700 text-sm p-4">
                    No plans configured for this service yet. Ask admin to add Basic/Pro/Business pricing.
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

const SecurityView = () => {
  const { teamMembers, setTeamMembers, openModal, showToast, currentUser } = useDashboard();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30 minutes');
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
  const [memberToEdit, setMemberToEdit] = useState<TeamMember | null>(null);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'bg-red-100 text-red-700';
      case 'Editor': return 'bg-blue-100 text-blue-700';
      case 'Viewer': return 'bg-slate-100 text-slate-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getStatusColor = (status: string) => {
    const normalized = String(status || '').toLowerCase();
    if (normalized === 'pending') return 'text-orange-600';
    if (normalized === 'active') return 'text-emerald-600';
    if (normalized === 'revoked') return 'text-red-600';
    if (normalized === 'expired') return 'text-slate-500';
    return 'text-slate-500';
  };

  const handleDeleteMember = async () => {
    if (!memberToDelete) return;

    try {
      if (memberToDelete.invitationId) {
        const { userId: ownerUserId, email: ownerEmail } = getDashboardUserIdentity(currentUser);
        if (!ownerUserId) {
          throw new Error('Missing owner identity. Please sign in again.');
        }

        await revokeTeamAccessMember(memberToDelete.invitationId, {
          ownerUserId,
          ownerEmail: ownerEmail || undefined,
        });
      }

      setTeamMembers((prev) => prev.filter((member) => member.id !== memberToDelete.id));
      showToast(`${memberToDelete.name} has been removed from the team`, 'success');
      setMemberToDelete(null);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to remove member right now.', 'error');
    }
  };

  const handleToggle2FA = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    showToast(
      twoFactorEnabled ? 'Two-factor authentication disabled' : 'Two-factor authentication enabled',
      'success'
    );
  };

  return (
    <div className="space-y-8">
      {/* Team Access Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Team Access</h2>
          <p className="text-slate-500 text-sm mt-1">Manage who has access to your dashboard and services</p>
        </div>
        <Button className="gap-2 rounded-xl" onClick={() => openModal('invite')}>
          <UserPlus size={18} /> Invite Member
        </Button>
      </div>

      {/* Access Roles Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="size-10 rounded-xl bg-red-100 flex items-center justify-center">
              <Crown className="size-5 text-red-600" />
            </div>
            <div>
              <div className="font-bold text-slate-900">Admin</div>
              <div className="text-xs text-slate-400">Full access</div>
            </div>
          </div>
          <p className="text-xs text-slate-500">Can manage billing, invite users, and access all services.</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="size-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Edit3 className="size-5 text-blue-600" />
            </div>
            <div>
              <div className="font-bold text-slate-900">Editor</div>
              <div className="text-xs text-slate-400">Limited access</div>
            </div>
          </div>
          <p className="text-xs text-slate-500">Can use services and view reports, but cannot manage billing.</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="size-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <Eye className="size-5 text-slate-600" />
            </div>
            <div>
              <div className="font-bold text-slate-900">Viewer</div>
              <div className="text-xs text-slate-400">View only</div>
            </div>
          </div>
          <p className="text-xs text-slate-500">Can only view dashboards and reports. No editing access.</p>
        </div>
      </div>

      {/* Team Members List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <div className="col-span-4">Member</div>
          <div className="col-span-3">Role</div>
          <div className="col-span-3">Last Active</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>
        {teamMembers.map((member) => (
          <div key={member.id} className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 last:border-0 items-center hover:bg-slate-50 transition-colors">
            <div className="col-span-4 flex items-center gap-3">
              <div className="size-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                {member.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div className="font-bold text-slate-900">{member.name}</div>
                <div className="text-xs text-slate-400">{member.email}</div>
              </div>
            </div>
            <div className="col-span-3">
              <Badge className={cn("text-xs", getRoleColor(member.role))}>
                {member.role}
              </Badge>
            </div>
            <div className="col-span-3">
              <span className={cn('text-sm', getStatusColor(member.status))}>
                {member.lastActive}
              </span>
            </div>
            <div className="col-span-2 flex justify-end gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-slate-400 hover:text-blue-600"
                onClick={() => setMemberToEdit(member)}
              >
                <Edit3 size={16} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-slate-400 hover:text-red-600"
                onClick={() => setMemberToDelete(member)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        ))}
        {teamMembers.length === 0 && (
          <div className="p-8 text-center text-slate-400">
            <Users className="size-10 mx-auto mb-3 opacity-50" />
            <p>No team members yet</p>
          </div>
        )}
      </div>

      {/* Security Settings */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200">
        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <ShieldCheck className="size-5 text-blue-600" /> Security Settings
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <Lock className="size-5 text-slate-400" />
              <div>
                <div className="font-medium text-slate-900">Two-Factor Authentication</div>
                <div className="text-xs text-slate-400">Add an extra layer of security</div>
              </div>
            </div>
            <Button 
              variant={twoFactorEnabled ? "default" : "outline"} 
              size="sm"
              onClick={handleToggle2FA}
              className={twoFactorEnabled ? "bg-emerald-600 hover:bg-emerald-700" : ""}
            >
              {twoFactorEnabled ? <><Check size={14} className="mr-1" /> Enabled</> : 'Enable'}
            </Button>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <Key className="size-5 text-slate-400" />
              <div>
                <div className="font-medium text-slate-900">API Access Keys</div>
                <div className="text-xs text-slate-400">Manage your API keys</div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => showToast('API Keys management coming soon', 'info')}>Manage</Button>
          </div>
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Clock className="size-5 text-slate-400" />
              <div>
                <div className="font-medium text-slate-900">Session Timeout</div>
                <div className="text-xs text-slate-400">Auto-logout after inactivity</div>
              </div>
            </div>
            <select 
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
              value={sessionTimeout}
              onChange={(e) => {
                setSessionTimeout(e.target.value);
                showToast(`Session timeout updated to ${e.target.value}`, 'success');
              }}
            >
              <option>30 minutes</option>
              <option>1 hour</option>
              <option>4 hours</option>
              <option>Never</option>
            </select>
          </div>
        </div>
      </div>

      {/* Edit Member Modal */}
      <EditMemberModal 
        isOpen={!!memberToEdit} 
        onClose={() => setMemberToEdit(null)} 
        member={memberToEdit} 
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!memberToDelete}
        onClose={() => setMemberToDelete(null)}
        onConfirm={handleDeleteMember}
        title="Remove Team Member"
        message={`Are you sure you want to remove ${memberToDelete?.name} from your team? They will lose access to all services immediately.`}
      />
    </div>
  );
};

// Orders & Invoices View
const OrdersView = () => {
  const { orders, invoices, openModal } = useDashboard();
  const [activeTab, setActiveTab] = useState<'orders' | 'invoices'>('invoices');

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Orders & Invoices</h2>
          <p className="text-slate-500 text-sm mt-1">View your purchase history and download invoices</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Receipt className="size-5 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{orders.length}</div>
          <div className="text-xs font-medium text-slate-400 uppercase">Total Orders</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <FileText className="size-5 text-emerald-600" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{invoices.length}</div>
          <div className="text-xs font-medium text-slate-400 uppercase">Invoices</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <CheckCircle className="size-5 text-purple-600" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{invoices.filter(i => i.status === 'paid').length}</div>
          <div className="text-xs font-medium text-slate-400 uppercase">Paid Invoices</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <History className="size-5 text-orange-600" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            ₹{invoices.reduce((acc, i) => acc + i.total, 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs font-medium text-slate-400 uppercase">Total Spent</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('invoices')}
          className={cn(
            "px-6 py-2.5 rounded-lg text-sm font-medium transition-all",
            activeTab === 'invoices' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'
          )}
        >
          <FileText size={16} className="inline mr-2" />
          Invoices
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={cn(
            "px-6 py-2.5 rounded-lg text-sm font-medium transition-all",
            activeTab === 'orders' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'
          )}
        >
          <Receipt size={16} className="inline mr-2" />
          Orders
        </button>
      </div>

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <div className="col-span-3">Invoice</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-2">Due Date</div>
            <div className="col-span-2 text-right">Amount</div>
            <div className="col-span-2 text-center">Status</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>
          {invoices.map((invoice) => (
            <div 
              key={invoice.id} 
              className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 last:border-0 items-center hover:bg-slate-50 transition-colors cursor-pointer"
              onClick={() => openModal('invoice', invoice)}
            >
              <div className="col-span-3">
                <div className="font-bold text-slate-900">{invoice.invoiceNumber}</div>
                <div className="text-xs text-slate-400">{invoice.items.length} item{invoice.items.length > 1 ? 's' : ''}</div>
              </div>
              <div className="col-span-2 text-slate-600 text-sm">{formatDate(invoice.date)}</div>
              <div className="col-span-2 text-slate-600 text-sm">{formatDate(invoice.dueDate)}</div>
              <div className="col-span-2 text-right font-bold text-slate-900">₹{invoice.total.toFixed(2)}</div>
              <div className="col-span-2 text-center">
                <Badge className={cn(
                  "text-xs",
                  invoice.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 
                  invoice.status === 'pending' ? 'bg-orange-100 text-orange-700' : 
                  'bg-red-100 text-red-700'
                )}>
                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </Badge>
              </div>
              <div className="col-span-1 flex justify-end gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="size-8 text-slate-400 hover:text-blue-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    openModal('invoice', invoice);
                  }}
                >
                  <Eye size={14} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="size-8 text-slate-400 hover:text-emerald-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadInvoiceReceipt(invoice);
                  }}
                >
                  <Download size={14} />
                </Button>
              </div>
            </div>
          ))}
          {invoices.length === 0 && (
            <div className="p-12 text-center text-slate-400">
              <FileText className="size-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No invoices yet</p>
              <p className="text-sm mt-1">Your invoices will appear here after your first purchase</p>
            </div>
          )}
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <div className="col-span-3">Order</div>
            <div className="col-span-3">Date</div>
            <div className="col-span-2">Items</div>
            <div className="col-span-2 text-right">Total</div>
            <div className="col-span-2 text-center">Status</div>
          </div>
          {orders.map((order) => (
            <div 
              key={order.id} 
              className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 last:border-0 items-center hover:bg-slate-50 transition-colors cursor-pointer"
              onClick={() => openModal('orderDetails', order)}
            >
              <div className="col-span-3">
                <div className="font-bold text-slate-900">{order.orderNumber}</div>
                <div className="text-xs text-slate-400">{order.paymentId}</div>
              </div>
              <div className="col-span-3 text-slate-600 text-sm">
                {new Date(order.date).toLocaleString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
              <div className="col-span-2">
                <div className="flex -space-x-2">
                  {order.items.slice(0, 3).map((item, idx) => (
                    <div 
                      key={idx}
                      className={cn("size-8 rounded-lg flex items-center justify-center border-2 border-white", item.serviceColor)}
                    >
                      <Package className="size-3 text-white" />
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className="size-8 rounded-lg bg-slate-200 flex items-center justify-center border-2 border-white text-xs font-bold text-slate-600">
                      +{order.items.length - 3}
                    </div>
                  )}
                </div>
              </div>
              <div className="col-span-2 text-right font-bold text-slate-900">₹{order.total.toFixed(2)}</div>
              <div className="col-span-2 text-center">
                <Badge className={cn(
                  "text-xs",
                  order.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 
                  order.status === 'pending' ? 'bg-orange-100 text-orange-700' : 
                  'bg-red-100 text-red-700'
                )}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <div className="p-12 text-center text-slate-400">
              <Receipt className="size-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No orders yet</p>
              <p className="text-sm mt-1">Your orders will appear here after your first purchase</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const SettingsView = ({ user }: { user: any }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showToast } = useDashboard();
  
  // Extract user metadata
  const userMeta = user?.user_metadata || {};
  const userName = userMeta.full_name || userMeta.first_name 
    ? `${userMeta.first_name || ''} ${userMeta.last_name || ''}`.trim() 
    : user?.email?.split('@')[0] || 'User';
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  
  const [formData, setFormData] = useState({
    name: userName,
    email: user?.email || '',
    phone: userMeta.phone || '',
    company: userMeta.company || '',
    timezone: userMeta.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  
  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: formData.name,
        phone: formData.phone,
        company: formData.company,
        timezone: formData.timezone,
      }
    });

    if (error) {
      setSaving(false);
      showToast(error.message, 'error');
      return;
    }

    setSaving(false);
    showToast('Profile updated successfully', 'success');
    setIsEditing(false);

    globalStore.upsertUserProfile({
      id: String(user?.id || '').trim(),
      email: String(user?.email || '').trim().toLowerCase(),
      name: formData.name,
      company: formData.company,
      phone: formData.phone,
      plan: 'Basic',
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Account Settings</h2>
        <p className="text-slate-500 text-sm mt-1">Manage your profile and preferences</p>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-900">Profile Information</h3>
          <Button 
            variant={isEditing ? "default" : "outline"} 
            size="sm" 
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className="gap-2"
            loading={saving}
          >
            {isEditing ? <Check size={16} /> : <Edit3 size={16} />}
            {isEditing ? 'Save Changes' : 'Edit Profile'}
          </Button>
        </div>
        <div className="p-6">
          <div className="flex items-start gap-6 mb-8">
            <div className="relative">
              <div className="size-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                {userInitials}
              </div>
              {isEditing && (
                <button className="absolute -bottom-2 -right-2 size-8 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-700">
                  <Camera size={16} />
                </button>
              )}
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-bold text-slate-900">{formData.name}</h4>
              <p className="text-slate-500">{formData.email}</p>
              <Badge className="bg-blue-100 text-blue-700 mt-2">Pro Plan</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!isEditing}
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!isEditing}
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!isEditing}
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Company</label>
              <Input
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                disabled={!isEditing}
                className="h-12"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">Preferences</h3>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="size-5 text-slate-400" />
              <div>
                <div className="font-medium text-slate-900">Timezone</div>
                <div className="text-xs text-slate-400">Set your local timezone</div>
              </div>
            </div>
            <select className="px-4 py-2 border border-slate-200 rounded-lg text-sm min-w-[200px]">
              <option>America/New_York (EST)</option>
              <option>America/Los_Angeles (PST)</option>
              <option>Europe/London (GMT)</option>
              <option>Asia/Tokyo (JST)</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="size-5 text-slate-400" />
              <div>
                <div className="font-medium text-slate-900">Email Notifications</div>
                <div className="text-xs text-slate-400">Receive updates about your services</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="size-5 text-slate-400" />
              <div>
                <div className="font-medium text-slate-900">Marketing Emails</div>
                <div className="text-xs text-slate-400">Get tips and product updates</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl border border-red-200 overflow-hidden">
        <div className="p-6 border-b border-red-100 bg-red-50">
          <h3 className="font-bold text-red-900">Danger Zone</h3>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-slate-900">Delete Account</div>
              <div className="text-sm text-slate-400">Permanently delete your account and all data</div>
            </div>
            <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export function DashboardPage({ user, onNavigate, onSignOut }: DashboardPageProps) {
  return (
    <DashboardProvider user={user}>
      <DashboardContent user={user} onNavigate={onNavigate} onSignOut={onSignOut} />
    </DashboardProvider>
  );
}

function DashboardContent({ user, onNavigate, onSignOut }: DashboardPageProps) {
  const navigate = useNavigate();
  const { activeTab, setActiveTab, cart, notifications, openModal } = useDashboard();

  const unreadCount = notifications.filter(n => !n.read).length;

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewView />;
      case 'services': return <ServicesView />;
      case 'orders': return <OrdersView />;
      case 'security': return <SecurityView />;
      case 'settings': return <SettingsView user={user} />;
      default: return <OverviewView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 fixed left-0 top-0 bottom-0 z-40 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-slate-100">
          <button onClick={() => navigate('/')} className="flex items-center gap-3">
            <img src="/favicon.ico" alt="Volosist" className="w-10 h-10" />
            <span className="text-lg font-bold text-slate-900 tracking-tight">VOLOSIST</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {SIDEBAR_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-all",
                activeTab === item.id
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-600 hover:bg-slate-50"
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 rounded-xl">
            <div className="size-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-slate-900 text-sm truncate">{user?.email || 'User'}</div>
              <div className="text-xs text-slate-400">Pro Plan</div>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-slate-500 hover:text-red-600 hover:bg-red-50"
            onClick={onSignOut}
          >
            <LogOut size={18} /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900 capitalize">
                {activeTab === 'security' ? 'Team Access' : 
                 activeTab === 'orders' ? 'Orders & Invoices' : 
                 activeTab}
              </h1>
              <p className="text-sm text-slate-400">Welcome back, {user?.email?.split('@')[0] || 'User'}</p>
            </div>
            <div className="flex items-center gap-4">
              <button 
                className="size-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors relative"
                onClick={() => openModal('cart')}
              >
                <ShoppingCart size={20} />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 size-5 bg-blue-600 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                    {cart.length}
                  </span>
                )}
              </button>
              <button 
                className="size-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors relative"
                onClick={() => openModal('notifications')}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 size-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
