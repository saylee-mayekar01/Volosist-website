import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';
import { useStore, User, Payment, Invoice, Notification, ActivityLog, ServiceCatalogItem } from '../../lib/store';
import { downloadInvoicePdf } from '../../lib/invoice-pdf';
import { createCashfreeRefund } from '../../lib/cashfree';
import { requestRefundByOrder, cancelRefundByOrder, markRefundedByOrderWithMeta } from '../../lib/supabase';
import {
  Shield, LayoutDashboard, Users, CreditCard, Package, BarChart3, Settings,
  LogOut, Search, Bell, ChevronRight, ChevronDown, DollarSign, TrendingUp,
  TrendingDown, ArrowUpRight, Eye, Download, MoreHorizontal, RefreshCw,
  CheckCircle, XCircle, Clock, AlertCircle, Filter, Calendar, FileText,
  Mail, Phone, MapPin, Building, UserCheck, UserX, Edit, Trash2, Plus,
  X, Activity, PieChart, Target, Zap, ShoppingCart, Receipt, Globe, Lock,
  RotateCcw, History, Briefcase, ToggleLeft, ToggleRight, ChevronUp, Loader2
} from 'lucide-react';

// Types
interface AdminUser {
  email: string;
  role: string;
  loginTime: string;
}

interface ServiceStat {
  id: string;
  name: string;
  color: string;
  activeUsers: number;
  revenue: number;
}

const INVOICE_LOGO_PATH = '/volosist-logo.svg';
const GLOBAL_SUPPORT_PHONE = '+91 9769789769';
const GLOBAL_SUPPORT_EMAIL = 'volosist.ai@gmail.com';

const REVENUE_PAYMENT_STATUSES: Payment['status'][] = ['completed', 'refund_pending', 'refund_cancelled'];

const formatPaymentStatusLabel = (status: Payment['status']) =>
  status
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const getPaymentStatusBadgeClass = (status: Payment['status']) => {
  if (status === 'completed') return 'bg-emerald-100 text-emerald-700';
  if (status === 'pending') return 'bg-orange-100 text-orange-700';
  if (status === 'failed') return 'bg-red-100 text-red-700';
  if (status === 'refund_pending') return 'bg-amber-100 text-amber-700';
  if (status === 'refund_cancelled') return 'bg-slate-100 text-slate-700';
  return 'bg-purple-100 text-purple-700';
};

const getPaymentStatusIcon = (status: Payment['status']) => {
  if (status === 'completed') {
    return {
      containerClass: 'bg-emerald-100',
      icon: <CheckCircle className="size-5 text-emerald-600" />,
    };
  }

  if (status === 'pending') {
    return {
      containerClass: 'bg-orange-100',
      icon: <Clock className="size-5 text-orange-600" />,
    };
  }

  if (status === 'failed') {
    return {
      containerClass: 'bg-red-100',
      icon: <XCircle className="size-5 text-red-600" />,
    };
  }

  if (status === 'refund_pending') {
    return {
      containerClass: 'bg-amber-100',
      icon: <RefreshCw className="size-5 text-amber-600" />,
    };
  }

  if (status === 'refund_cancelled') {
    return {
      containerClass: 'bg-slate-100',
      icon: <RotateCcw className="size-5 text-slate-600" />,
    };
  }

  return {
    containerClass: 'bg-purple-100',
    icon: <RefreshCw className="size-5 text-purple-600" />,
  };
};

const downloadAdminInvoicePdf = async (invoice: Invoice) => {
  await downloadInvoicePdf(invoice, {
    logoPath: INVOICE_LOGO_PATH,
    supportPhone: GLOBAL_SUPPORT_PHONE,
    supportEmail: GLOBAL_SUPPORT_EMAIL,
    supportLabel: 'Global Support',
    inquiryLabel: 'Email Inquiry',
    fileSuffix: 'admin-invoice',
  });
};

// Modal Component
const Modal = ({ isOpen, onClose, title, children, size = 'md' }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; size?: 'sm' | 'md' | 'lg' }) => {
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-y-auto",
            size === 'sm' && 'max-w-md',
            size === 'md' && 'max-w-xl',
            size === 'lg' && 'max-w-4xl'
          )}
        >
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <X size={20} className="text-slate-400" />
            </button>
          </div>
          <div className="p-6">{children}</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Admin Dashboard Component
export function AdminDashboard() {
  const navigate = useNavigate();
  const store = useStore();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Get data from store (real-time updates)
  const users = store.getUsers();
  const payments = store.getPayments();
  const invoices = store.getInvoices();
  const notifications = store.getNotifications();
  const activityLog = store.getActivityLog();
  const serviceCatalog = store.getServiceCatalog();
  const stats = store.getStats();

  // Check auth on mount
  useEffect(() => {
    const auth = localStorage.getItem('adminAuth');
    if (!auth) {
      navigate('/admin');
      return;
    }
    setAdmin(JSON.parse(auth));
  }, [navigate]);

  const handleSignOut = () => {
    localStorage.removeItem('adminAuth');
    navigate('/admin');
  };

  const buildFallbackInvoiceFromPayment = (payment: Payment): Invoice => {
    const paymentDate = payment.date || new Date().toISOString();
    const dueDate = new Date(paymentDate);
    dueDate.setDate(dueDate.getDate() + 15);
    const fallbackInvoiceStatus: Invoice['status'] =
      payment.status === 'completed' || payment.status === 'refund_cancelled'
        ? 'paid'
        : payment.status === 'pending' || payment.status === 'refund_pending'
          ? 'pending'
          : 'overdue';

    const fallbackItems = payment.items?.length
      ? payment.items.map((item) => ({
          name: item.name,
          plan: item.plan,
          quantity: 1,
          unitPrice: item.price,
          total: item.price,
        }))
      : [{ name: payment.service, plan: payment.plan, quantity: 1, unitPrice: payment.amount, total: payment.amount }];

    return {
      id: `inv_fallback_${payment.id}`,
      invoiceNumber: `INV-${new Date(paymentDate).getFullYear()}-${payment.orderId}`,
      paymentId: payment.id,
      userId: payment.userId,
      userName: payment.userName,
      userEmail: payment.userEmail,
      date: paymentDate,
      dueDate: dueDate.toISOString(),
      items: fallbackItems,
      subtotal: payment.amount,
      tax: Math.round(payment.amount * 0.18),
      total: Math.round(payment.amount * 1.18),
      status: fallbackInvoiceStatus,
      paidDate: fallbackInvoiceStatus === 'paid' ? paymentDate : undefined,
      customerInfo: {
        name: payment.userName,
        email: payment.userEmail,
        company: '',
        address: 'Address not available',
      },
    };
  };

  const handleDownloadPaymentReceipt = async (payment: Payment) => {
    const linkedInvoice = invoices.find((invoice) => invoice.paymentId === payment.id);
    const invoiceForDownload = linkedInvoice || buildFallbackInvoiceFromPayment(payment);
    await downloadAdminInvoicePdf(invoiceForDownload);
  };

  const syncRefundStatusWithSupabase = async (
    payment: Payment,
    nextStatus: Payment['status'],
    reason = 'Admin review'
  ) => {
    if (!payment.cashfreeOrderId) {
      throw new Error('Missing Cashfree order reference for refund workflow.');
    }

    if (nextStatus === 'refund_pending') {
      await requestRefundByOrder(payment.cashfreeOrderId, reason);
      return { settled: false as const };
    } else if (nextStatus === 'refund_cancelled') {
      await cancelRefundByOrder(payment.cashfreeOrderId);
      return { settled: false as const };
    } else if (nextStatus === 'refunded') {
      const refundResponse = await createCashfreeRefund({
        orderId: payment.cashfreeOrderId,
        reason,
        refundAmount: payment.amount,
        refundSpeed: 'STANDARD',
      });

      const gatewayStatus = String(refundResponse.refund_status || '').toUpperCase();
      const settledStatuses = new Set(['SUCCESS', 'COMPLETED', 'PROCESSED', 'REFUNDED']);
      const isSettled = settledStatuses.has(gatewayStatus);
      const liquidityState = String(refundResponse.liquidity_state || '').toUpperCase() || undefined;

      if (isSettled) {
        await markRefundedByOrderWithMeta(payment.cashfreeOrderId, {
          refundId: refundResponse.refund_id,
          refundAmountPaise: Math.round(Number(refundResponse.refund_amount || payment.amount) * 100),
          refundStatus: gatewayStatus,
          refundNote: reason,
        });
      } else {
        await requestRefundByOrder(
          payment.cashfreeOrderId,
          `${reason} | Refund Ref: ${refundResponse.refund_id} | Gateway Status: ${gatewayStatus || 'PENDING'}${
            liquidityState ? ` | Liquidity: ${liquidityState}` : ''
          }`
        );
      }

      return {
        settled: isSettled,
        refundId: refundResponse.refund_id,
        refundStatus: gatewayStatus || 'PENDING',
        refundAmount: Number(refundResponse.refund_amount || payment.amount),
        bankReference: refundResponse.bank_reference || '',
        liquidityState,
      };
    }

    return { settled: false as const };
  };

  // Stats from store
  const totalRevenue = stats.totalRevenue;
  const pendingPayments = stats.pendingPayments;
  const activeUsers = stats.activeUsers;
  const totalUsers = stats.totalUsers;

  const serviceColors = ['bg-blue-600', 'bg-purple-600', 'bg-emerald-600', 'bg-cyan-600', 'bg-orange-600'];
  const serviceStats: ServiceStat[] = serviceCatalog.map((service, index) => {
    const relatedPayments = payments.filter((payment) => payment.service.toLowerCase() === service.name.toLowerCase());
    const revenuePayments = relatedPayments.filter((payment) => REVENUE_PAYMENT_STATUSES.includes(payment.status));
    const uniqueUsers = new Set(revenuePayments.map((payment) => payment.userId)).size;

    return {
      id: service.id,
      name: service.name,
      color: serviceColors[index % serviceColors.length],
      activeUsers: uniqueUsers,
      revenue: revenuePayments.reduce((sum, payment) => sum + payment.amount, 0),
    };
  });

  const SIDEBAR_ITEMS = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'activity', label: 'Activity Log', icon: History },
    { id: 'services', label: 'Services', icon: Package },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'careers', label: 'Careers', icon: Briefcase },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <aside className={cn(
        "bg-slate-900 text-white flex flex-col transition-all duration-300 sticky top-0 h-screen",
        sidebarCollapsed ? 'w-20' : 'w-64'
      )}>
        {/* Logo */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Shield className="size-5" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <div className="font-black text-lg">Volosist</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Admin Panel</div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left",
                  activeTab === item.id 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                )}
              >
                <Icon size={20} />
                {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Toggle & Sign Out */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <ChevronRight className={cn("transition-transform", sidebarCollapsed ? '' : 'rotate-180')} size={20} />
            {!sidebarCollapsed && <span className="flex-1 text-left font-medium">Collapse</span>}
          </button>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-white hover:bg-red-600/20 transition-all"
          >
            <LogOut size={20} />
            {!sidebarCollapsed && <span className="font-medium">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-900 capitalize">{activeTab.replace('-', ' ')}</h1>
              <p className="text-sm text-slate-500">
                {activeTab === 'overview' && 'Welcome back, Admin - Real-time dashboard'}
                {activeTab === 'users' && 'Manage all registered users'}
                {activeTab === 'payments' && 'Track and manage payments'}
                {activeTab === 'invoices' && 'View and manage invoices'}
                {activeTab === 'activity' && 'Monitor system activity'}
                {activeTab === 'services' && 'Monitor service performance'}
                {activeTab === 'analytics' && 'View detailed analytics'}
                {activeTab === 'careers' && 'Post and manage job openings'}
                {activeTab === 'settings' && 'Configure admin settings'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 h-10 bg-slate-100 border-0 rounded-xl"
                />
              </div>
              <button 
                className="relative size-10 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                onClick={() => setShowNotificationsModal(true)}
              >
                <Bell size={20} className="text-slate-600" />
                {stats.unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 size-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                    {stats.unreadNotifications}
                  </span>
                )}
              </button>
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                <div className="size-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
                  A
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-900">Admin</div>
                  <div className="text-xs text-slate-400">{admin.email}</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          {activeTab === 'overview' && (
            <OverviewView 
              totalRevenue={totalRevenue}
              pendingPayments={pendingPayments}
              activeUsers={activeUsers}
              totalUsers={totalUsers}
              recentPayments={payments.slice(0, 5)}
              serviceStats={serviceStats}
              activityLog={activityLog.slice(0, 5)}
            />
          )}
          {activeTab === 'users' && (
            <UsersView 
              users={users} 
              store={store}
              searchQuery={searchQuery}
              onSelectUser={(user) => {
                setSelectedUser(user);
                setShowUserModal(true);
              }}
            />
          )}
          {activeTab === 'payments' && (
            <PaymentsView 
              payments={payments}
              store={store}
              searchQuery={searchQuery}
              onSelectPayment={(payment) => {
                setSelectedPayment(payment);
                setShowPaymentModal(true);
              }}
            />
          )}
          {activeTab === 'invoices' && (
            <InvoicesView 
              invoices={invoices}
              searchQuery={searchQuery}
              onDownloadInvoice={downloadAdminInvoicePdf}
            />
          )}
          {activeTab === 'activity' && (
            <ActivityLogView 
              activityLog={activityLog}
              users={users}
            />
          )}
          {activeTab === 'services' && <ServicesView store={store} />}
          {activeTab === 'analytics' && <AnalyticsView payments={payments} users={users} stats={stats} />}
          {activeTab === 'careers' && <CareersView />}
          {activeTab === 'settings' && <SettingsView admin={admin} store={store} />}
        </div>
      </main>

      {/* User Detail Modal */}
      <Modal isOpen={showUserModal} onClose={() => setShowUserModal(false)} title="User Details" size="lg">
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="size-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedUser.name}</h3>
                  <p className="text-slate-500">{selectedUser.company}</p>
                  <Badge className={cn(
                    "mt-2",
                    selectedUser.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                    selectedUser.status === 'inactive' ? 'bg-slate-100 text-slate-600' :
                    'bg-red-100 text-red-700'
                  )}>
                    {selectedUser.status.charAt(0).toUpperCase() + selectedUser.status.slice(1)}
                  </Badge>
                </div>
              </div>
              <Badge className="bg-blue-100 text-blue-700">{selectedUser.plan} Plan</Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <Mail size={16} />
                  <span className="text-xs font-medium uppercase">Email</span>
                </div>
                <p className="text-slate-900 font-medium">{selectedUser.email}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <Phone size={16} />
                  <span className="text-xs font-medium uppercase">Phone</span>
                </div>
                <p className="text-slate-900 font-medium">{selectedUser.phone}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <Calendar size={16} />
                  <span className="text-xs font-medium uppercase">Join Date</span>
                </div>
                <p className="text-slate-900 font-medium">{new Date(selectedUser.joinDate).toLocaleDateString()}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <Activity size={16} />
                  <span className="text-xs font-medium uppercase">Last Active</span>
                </div>
                <p className="text-slate-900 font-medium">{new Date(selectedUser.lastActive).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-xl text-center">
                <div className="text-2xl font-black text-blue-600">{selectedUser.services}</div>
                <div className="text-xs text-blue-600 font-medium">Active Services</div>
              </div>
              <div className="p-4 bg-emerald-50 rounded-xl text-center">
                <div className="text-2xl font-black text-emerald-600">₹{selectedUser.totalSpent.toLocaleString()}</div>
                <div className="text-xs text-emerald-600 font-medium">Total Spent</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl text-center">
                <div className="text-2xl font-black text-purple-600">{Math.floor((Date.now() - new Date(selectedUser.joinDate).getTime()) / (1000 * 60 * 60 * 24))}</div>
                <div className="text-xs text-purple-600 font-medium">Days as Customer</div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 gap-2">
                <Mail size={16} /> Send Email
              </Button>
              <Button variant="outline" className="flex-1 gap-2 text-orange-600 border-orange-200 hover:bg-orange-50">
                <Lock size={16} /> {selectedUser.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
              </Button>
              <Button className="flex-1 gap-2">
                <Edit size={16} /> Edit User
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Payment Detail Modal */}
      <Modal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} title="Payment Details">
        {selectedPayment && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedPayment.orderId}</h3>
                <p className="text-sm text-slate-500">{new Date(selectedPayment.date).toLocaleString()}</p>
              </div>
              <Badge className={cn(getPaymentStatusBadgeClass(selectedPayment.status))}>
                {formatPaymentStatusLabel(selectedPayment.status)}
              </Badge>
            </div>

            <div className="p-6 bg-slate-50 rounded-xl">
              <div className="text-center">
                <div className="text-4xl font-black text-slate-900">₹{selectedPayment.amount.toLocaleString()}</div>
                <div className="text-sm text-slate-500 mt-1">via {selectedPayment.method}</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-400 uppercase">Customer Info</h4>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="font-bold text-slate-900">{selectedPayment.userName}</p>
                <p className="text-sm text-slate-500">{selectedPayment.userEmail}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-400 uppercase">Service Details</h4>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="font-bold text-slate-900">{selectedPayment.service}</p>
                <p className="text-sm text-slate-500">{selectedPayment.plan} Plan</p>
                {selectedPayment.cashfreeOrderId && (
                  <p className="text-xs text-slate-500 mt-2">Cashfree Order: {selectedPayment.cashfreeOrderId}</p>
                )}
                {selectedPayment.refundReason && (
                  <p className="text-xs text-slate-500 mt-1">Refund Reason: {selectedPayment.refundReason}</p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              {(selectedPayment.status === 'completed' || selectedPayment.status === 'refund_cancelled') && (
                <Button 
                  variant="outline" 
                  className="flex-1 gap-2 text-amber-700 border-amber-200 hover:bg-amber-50"
                  onClick={async () => {
                    try {
                      await syncRefundStatusWithSupabase(selectedPayment, 'refund_pending', 'Admin review initiated');
                      store.updatePaymentStatus(selectedPayment.id, 'refund_pending', { reason: 'Admin review initiated' });
                      setShowPaymentModal(false);
                    } catch (error) {
                      console.warn('[admin] unable to mark refund pending', error);
                      window.alert('Unable to sync refund request with Supabase. Please retry.');
                    }
                  }}
                >
                  <RefreshCw size={16} /> Mark Refund Pending
                </Button>
              )}

              {selectedPayment.status === 'refund_pending' && (
                <>
                  <Button 
                    variant="outline" 
                    className="flex-1 gap-2 text-purple-700 border-purple-200 hover:bg-purple-50"
                    onClick={async () => {
                      try {
                        const refundResult = await syncRefundStatusWithSupabase(
                          selectedPayment,
                          'refunded',
                          selectedPayment.refundReason || 'Admin approved refund request'
                        );

                        const refundNotes = [
                          refundResult.refundId ? `Refund Ref: ${refundResult.refundId}` : '',
                          refundResult.refundStatus ? `Gateway Status: ${refundResult.refundStatus}` : '',
                          refundResult.bankReference ? `Bank Ref: ${refundResult.bankReference}` : '',
                        ]
                          .filter(Boolean)
                          .join(' | ');

                        store.updatePaymentStatus(
                          selectedPayment.id,
                          refundResult.settled ? 'refunded' : 'refund_pending',
                          {
                            reason: selectedPayment.refundReason || 'Admin approved refund request',
                            notes: refundNotes || selectedPayment.refundNotes,
                          }
                        );

                        if (!refundResult.settled) {
                          const isOnHold =
                            String(refundResult.refundStatus || '').toUpperCase() === 'ONHOLD' ||
                            String(refundResult.liquidityState || '').toUpperCase() === 'ONHOLD';

                          window.alert(
                            isOnHold
                              ? 'Refund is ONHOLD due insufficient refund wallet/settlement balance. It will auto-process once funds are available.'
                              : `Refund initiated with status ${refundResult.refundStatus || 'PENDING'}. It will remain pending until gateway settlement is confirmed.`
                          );
                        }

                        setShowPaymentModal(false);
                      } catch (error) {
                        console.warn('[admin] unable to approve refund', error);
                        window.alert(
                          error instanceof Error
                            ? error.message
                            : 'Unable to process refund with gateway. Please retry.'
                        );
                      }
                    }}
                  >
                    <CheckCircle size={16} /> Approve Refund
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 gap-2 text-slate-700 border-slate-300 hover:bg-slate-50"
                    onClick={async () => {
                      try {
                        await syncRefundStatusWithSupabase(selectedPayment, 'refund_cancelled');
                        store.updatePaymentStatus(selectedPayment.id, 'refund_cancelled');
                        setShowPaymentModal(false);
                      } catch (error) {
                        console.warn('[admin] unable to cancel refund request', error);
                        window.alert('Unable to sync refund cancellation with Supabase. Please retry.');
                      }
                    }}
                  >
                    <XCircle size={16} /> Cancel Request
                  </Button>
                </>
              )}

              {selectedPayment.status === 'pending' && (
                <>
                  <Button 
                    variant="outline" 
                    className="flex-1 gap-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                    onClick={() => {
                      store.updatePaymentStatus(selectedPayment.id, 'completed');
                      setShowPaymentModal(false);
                    }}
                  >
                    <CheckCircle size={16} /> Mark Complete
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 gap-2 text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => {
                      store.updatePaymentStatus(selectedPayment.id, 'failed');
                      setShowPaymentModal(false);
                    }}
                  >
                    <XCircle size={16} /> Mark Failed
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                className="gap-2"
                onClick={async () => {
                  try {
                    await handleDownloadPaymentReceipt(selectedPayment);
                  } catch {
                    window.alert('Unable to download payment receipt PDF right now. Please try again.');
                  }
                }}
              >
                <Download size={16} /> Download Receipt
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Notifications Modal */}
      <Modal isOpen={showNotificationsModal} onClose={() => setShowNotificationsModal(false)} title="Notifications" size="md">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">{stats.unreadNotifications} unread</span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => store.markAllNotificationsRead()}>
                Mark all read
              </Button>
              <Button variant="ghost" size="sm" className="text-red-600" onClick={() => store.clearNotifications()}>
                Clear all
              </Button>
            </div>
          </div>
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={cn(
                  "p-4 transition-colors cursor-pointer hover:bg-slate-50",
                  !notif.read && "bg-blue-50/50"
                )}
                onClick={() => store.markNotificationRead(notif.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "size-8 rounded-lg flex items-center justify-center flex-shrink-0",
                    notif.type === 'payment' ? 'bg-emerald-100 text-emerald-600' :
                    notif.type === 'user' ? 'bg-blue-100 text-blue-600' :
                    notif.type === 'alert' ? 'bg-orange-100 text-orange-600' :
                    'bg-slate-100 text-slate-600'
                  )}>
                    {notif.type === 'payment' ? <CreditCard size={14} /> :
                     notif.type === 'user' ? <Users size={14} /> :
                     notif.type === 'alert' ? <AlertCircle size={14} /> :
                     <Bell size={14} />}
                  </div>
                  <div className="flex-1">
                    <p className={cn("text-sm font-medium", !notif.read && "text-slate-900")}>{notif.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{notif.message}</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {new Date(notif.timestamp).toLocaleString()}
                    </p>
                  </div>
                  {!notif.read && <div className="size-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />}
                </div>
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="p-8 text-center text-slate-400">
                <Bell className="size-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications</p>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}

// Overview View
const OverviewView = ({ totalRevenue, pendingPayments, activeUsers, totalUsers, recentPayments, serviceStats, activityLog }: {
  totalRevenue: number;
  pendingPayments: number;
  activeUsers: number;
  totalUsers: number;
  recentPayments: Payment[];
  serviceStats: ServiceStat[];
  activityLog: ActivityLog[];
}) => {
  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="size-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <DollarSign className="size-6 text-emerald-600" />
            </div>
            <Badge className="bg-emerald-100 text-emerald-700">Live</Badge>
          </div>
          <div className="text-3xl font-black text-slate-900">₹{totalRevenue.toLocaleString()}</div>
          <div className="text-sm text-slate-500 mt-1">Total Revenue</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="size-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Users className="size-6 text-blue-600" />
            </div>
            <Badge className="bg-blue-100 text-blue-700">Live</Badge>
          </div>
          <div className="text-3xl font-black text-slate-900">{activeUsers}/{totalUsers}</div>
          <div className="text-sm text-slate-500 mt-1">Active Users</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="size-12 rounded-xl bg-orange-100 flex items-center justify-center">
              <Clock className="size-6 text-orange-600" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{pendingPayments}</div>
          <div className="text-sm text-slate-500 mt-1">Pending Payments</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="size-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <Package className="size-6 text-purple-600" />
            </div>
            <Badge className="bg-purple-100 text-purple-700">Live</Badge>
          </div>
          <div className="text-3xl font-black text-slate-900">{serviceStats.length}</div>
          <div className="text-sm text-slate-500 mt-1">Total Services</div>
        </motion.div>
      </div>

      {/* Service Performance & Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Performance */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Service Performance</h3>
          <div className="space-y-4">
            {serviceStats.map((service) => (
              <div key={service.id} className="flex items-center gap-4">
                <div className={cn("size-10 rounded-xl flex items-center justify-center", service.color)}>
                  <Package className="size-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-slate-900">{service.name}</span>
                    <span className="text-xs font-semibold text-slate-500">Live</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>{service.activeUsers} users</span>
                    <span>₹{service.revenue.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Recent Payments</h3>
            <Button variant="ghost" size="sm" className="text-blue-600 gap-1">
              View All <ChevronRight size={16} />
            </Button>
          </div>
          <div className="space-y-3">
            {recentPayments.map((payment) => {
              const statusIcon = getPaymentStatusIcon(payment.status);

              return (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={cn("size-10 rounded-xl flex items-center justify-center", statusIcon.containerClass)}>
                      {statusIcon.icon}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{payment.userName}</p>
                      <p className="text-xs text-slate-500">{payment.service}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">₹{payment.amount.toLocaleString()}</p>
                    <p className="text-xs text-slate-500">{payment.method}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// Users View
const UsersView = ({ users, store, searchQuery, onSelectUser }: {
  users: User[];
  store: ReturnType<typeof useStore>;
  searchQuery: string;
  onSelectUser: (user: User) => void;
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {['all', 'active', 'inactive', 'suspended'].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
        </div>
        <Button className="gap-2">
          <Plus size={16} /> Add User
        </Button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <div className="col-span-3">User</div>
          <div className="col-span-2">Company</div>
          <div className="col-span-2">Plan</div>
          <div className="col-span-2 text-right">Total Spent</div>
          <div className="col-span-1 text-center">Services</div>
          <div className="col-span-1 text-center">Status</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>
        {filteredUsers.map((user) => (
          <div 
            key={user.id}
            className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 last:border-0 items-center hover:bg-slate-50 transition-colors cursor-pointer"
            onClick={() => onSelectUser(user)}
          >
            <div className="col-span-3 flex items-center gap-3">
              <div className="size-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
                {user.name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-slate-900">{user.name}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
            </div>
            <div className="col-span-2 text-slate-600">{user.company}</div>
            <div className="col-span-2">
              <Badge className={cn(
                user.plan === 'Business' ? 'bg-amber-100 text-amber-700' :
                user.plan === 'Pro' ? 'bg-blue-100 text-blue-700' :
                'bg-slate-100 text-slate-600'
              )}>{user.plan}</Badge>
            </div>
            <div className="col-span-2 text-right font-bold text-slate-900">₹{user.totalSpent.toLocaleString()}</div>
            <div className="col-span-1 text-center font-medium text-slate-600">{user.services}</div>
            <div className="col-span-1 text-center">
              <Badge className={cn(
                "text-xs",
                user.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                user.status === 'inactive' ? 'bg-slate-100 text-slate-600' :
                'bg-red-100 text-red-700'
              )}>
                {user.status}
              </Badge>
            </div>
            <div className="col-span-1 flex justify-end gap-1">
              <Button variant="ghost" size="icon" className="size-8" onClick={(e) => { e.stopPropagation(); }}>
                <Eye size={14} />
              </Button>
              <Button variant="ghost" size="icon" className="size-8" onClick={(e) => { e.stopPropagation(); }}>
                <MoreHorizontal size={14} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Payments View
const PaymentsView = ({ payments, store, searchQuery, onSelectPayment }: {
  payments: Payment[];
  store: ReturnType<typeof useStore>;
  searchQuery: string;
  onSelectPayment: (payment: Payment) => void;
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         payment.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         payment.service.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCompleted = payments
    .filter((payment) => payment.status === 'completed' || payment.status === 'refund_cancelled')
    .reduce((sum, payment) => sum + payment.amount, 0);
  const totalPending = payments.filter((payment) => payment.status === 'pending').reduce((sum, payment) => sum + payment.amount, 0);
  const refundPendingCount = payments.filter((payment) => payment.status === 'refund_pending').length;
  const refundCancelledCount = payments.filter((payment) => payment.status === 'refund_cancelled').length;
  const totalRefunded = payments.filter(p => p.status === 'refunded').reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="size-5 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-600">Completed</span>
          </div>
          <div className="text-2xl font-black text-emerald-700">₹{totalCompleted.toLocaleString()}</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-2xl border border-orange-200">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="size-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-600">Pending</span>
          </div>
          <div className="text-2xl font-black text-orange-700">₹{totalPending.toLocaleString()}</div>
        </div>
        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
          <div className="flex items-center gap-2 mb-2">
            <RefreshCw className="size-5 text-amber-600" />
            <span className="text-sm font-medium text-amber-600">Refund Pending</span>
          </div>
          <div className="text-2xl font-black text-amber-700">{refundPendingCount}</div>
        </div>
        <div className="bg-red-50 p-4 rounded-2xl border border-red-200">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="size-5 text-red-600" />
            <span className="text-sm font-medium text-red-600">Failed</span>
          </div>
          <div className="text-2xl font-black text-red-700">{payments.filter(p => p.status === 'failed').length}</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-2xl border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <RefreshCw className="size-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-600">Refunded</span>
          </div>
          <div className="text-2xl font-black text-purple-700">₹{totalRefunded.toLocaleString()}</div>
          <div className="text-xs text-purple-600 mt-1">Cancelled: {refundCancelledCount}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {['all', 'completed', 'pending', 'refund_pending', 'refund_cancelled', 'failed', 'refunded'].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className="capitalize"
            >
              {status.replace('_', ' ')}
            </Button>
          ))}
        </div>
        <Button variant="outline" className="gap-2">
          <Download size={16} /> Export CSV
        </Button>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <div className="col-span-2">Order ID</div>
          <div className="col-span-2">Customer</div>
          <div className="col-span-2">Service</div>
          <div className="col-span-1">Method</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-1 text-right">Amount</div>
          <div className="col-span-1 text-center">Status</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>
        {filteredPayments.map((payment) => (
          <div 
            key={payment.id}
            className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 last:border-0 items-center hover:bg-slate-50 transition-colors cursor-pointer"
            onClick={() => onSelectPayment(payment)}
          >
            <div className="col-span-2">
              <p className="font-bold text-slate-900">{payment.orderId}</p>
              <p className="text-xs text-slate-400">{payment.id}</p>
            </div>
            <div className="col-span-2">
              <p className="font-medium text-slate-900">{payment.userName}</p>
              <p className="text-xs text-slate-500">{payment.userEmail}</p>
            </div>
            <div className="col-span-2">
              <p className="text-slate-900">{payment.service}</p>
              <p className="text-xs text-slate-500">{payment.plan}</p>
            </div>
            <div className="col-span-1">
              <Badge variant="outline" className="text-xs">{payment.method}</Badge>
            </div>
            <div className="col-span-2 text-sm text-slate-600">
              {new Date(payment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="col-span-1 text-right font-bold text-slate-900">₹{payment.amount.toLocaleString()}</div>
            <div className="col-span-1 text-center">
              <Badge className={cn('text-xs', getPaymentStatusBadgeClass(payment.status))}>
                {formatPaymentStatusLabel(payment.status)}
              </Badge>
            </div>
            <div className="col-span-1 flex justify-end gap-1">
              <Button variant="ghost" size="icon" className="size-8" onClick={(e) => { e.stopPropagation(); }}>
                <Eye size={14} />
              </Button>
              <Button variant="ghost" size="icon" className="size-8" onClick={(e) => { e.stopPropagation(); }}>
                <Download size={14} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Services View
const ServicesView = ({ store }: { store: ReturnType<typeof useStore> }) => {
  const [serviceCatalog, setServiceCatalog] = useState<ServiceCatalogItem[]>(store.getServiceCatalog());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceDescription, setNewServiceDescription] = useState('');
  const [newBasicPrice, setNewBasicPrice] = useState(490);
  const [newProPrice, setNewProPrice] = useState(1490);
  const [newBusinessPrice, setNewBusinessPrice] = useState(4990);
  const [draftServices, setDraftServices] = useState<Record<string, ServiceCatalogItem>>({});
  const [savedServiceId, setSavedServiceId] = useState<string | null>(null);

  useEffect(() => {
    const syncCatalog = () => {
      setServiceCatalog(store.getServiceCatalog());
    };

    syncCatalog();
    const unsubscribe = store.subscribe(syncCatalog);
    return unsubscribe;
  }, [store]);

  useEffect(() => {
    const nextDrafts: Record<string, ServiceCatalogItem> = {};
    serviceCatalog.forEach((service) => {
      nextDrafts[service.id] = {
        ...service,
        plans: service.plans.map((plan) => ({ ...plan })),
      };
    });
    setDraftServices(nextDrafts);
  }, [serviceCatalog]);

  const updateServicePrice = (service: ServiceCatalogItem, planName: string, nextPrice: number) => {
    if (Number.isNaN(nextPrice) || nextPrice < 0) return;

    const activeService = draftServices[service.id] ?? service;
    const nextPlans = activeService.plans.map((plan) =>
      plan.name === planName ? { ...plan, price: Math.round(nextPrice) } : plan
    );

    setDraftServices((previous) => ({
      ...previous,
      [service.id]: {
        ...activeService,
        plans: nextPlans,
      },
    }));
  };

  const updateServiceDraftField = (service: ServiceCatalogItem, updates: Partial<Pick<ServiceCatalogItem, 'name' | 'description'>>) => {
    const activeService = draftServices[service.id] ?? service;
    setDraftServices((previous) => ({
      ...previous,
      [service.id]: {
        ...activeService,
        ...updates,
      },
    }));
  };

  const handleSaveService = (serviceId: string) => {
    const draft = draftServices[serviceId];
    if (!draft) return;

    store.updateServiceCatalogItem(serviceId, {
      name: draft.name.trim(),
      description: draft.description.trim(),
      plans: draft.plans,
    });

    setSavedServiceId(serviceId);
    window.setTimeout(() => {
      setSavedServiceId((previous) => (previous === serviceId ? null : previous));
    }, 2000);
  };

  const handleResetServiceDraft = (service: ServiceCatalogItem) => {
    setDraftServices((previous) => ({
      ...previous,
      [service.id]: {
        ...service,
        plans: service.plans.map((plan) => ({ ...plan })),
      },
    }));
  };

  const handleCreateService = () => {
    if (!newServiceName.trim() || !newServiceDescription.trim()) return;

    store.addServiceCatalogItem({
      name: newServiceName.trim(),
      description: newServiceDescription.trim(),
      plans: [
        { name: 'Basic', price: Math.max(0, Math.round(newBasicPrice)), features: ['Starter features'], limit: 1000 },
        { name: 'Pro', price: Math.max(0, Math.round(newProPrice)), features: ['Advanced features'], limit: 10000 },
        { name: 'Business', price: Math.max(0, Math.round(newBusinessPrice)), features: ['Enterprise features'], limit: 100000 },
      ],
    });

    setNewServiceName('');
    setNewServiceDescription('');
    setNewBasicPrice(490);
    setNewProPrice(1490);
    setNewBusinessPrice(4990);
    setShowCreateForm(false);
  };

  const handleDeleteService = (service: ServiceCatalogItem) => {
    if (!window.confirm(`Delete service "${service.name}"?`)) return;
    store.deleteServiceCatalogItem(service.id);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Service Catalog</h3>
            <p className="text-sm text-slate-500 mt-0.5">Create, update, and delete services with live dashboard sync.</p>
          </div>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => setShowCreateForm((prev) => !prev)}>
            <Plus size={16} /> {showCreateForm ? 'Close' : 'Add Service'}
          </Button>
        </div>

        {showCreateForm && (
          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              placeholder="Service name"
              value={newServiceName}
              onChange={(event) => setNewServiceName(event.target.value)}
              className="h-10 rounded-lg"
            />
            <Input
              placeholder="Service description"
              value={newServiceDescription}
              onChange={(event) => setNewServiceDescription(event.target.value)}
              className="h-10 rounded-lg md:col-span-2"
            />

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Basic Price</label>
              <Input
                type="number"
                min={0}
                value={newBasicPrice}
                onChange={(event) => setNewBasicPrice(Number(event.target.value))}
                className="h-10 rounded-lg mt-1"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pro Price</label>
              <Input
                type="number"
                min={0}
                value={newProPrice}
                onChange={(event) => setNewProPrice(Number(event.target.value))}
                className="h-10 rounded-lg mt-1"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Business Price</label>
              <Input
                type="number"
                min={0}
                value={newBusinessPrice}
                onChange={(event) => setNewBusinessPrice(Number(event.target.value))}
                className="h-10 rounded-lg mt-1"
              />
            </div>

            <div className="md:col-span-3 flex justify-end">
              <Button
                onClick={handleCreateService}
                disabled={!newServiceName.trim() || !newServiceDescription.trim()}
                className="bg-slate-900 hover:bg-slate-800"
              >
                Create Service
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-5">
        {serviceCatalog.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
            No services found. Create your first service to start pricing management.
          </div>
        )}

        {serviceCatalog.map((service) => {
          const draftService = draftServices[service.id] ?? service;
          return (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-200 p-6"
          >
            <div className="flex items-start justify-between mb-6 gap-6">
              <div className="flex-1 space-y-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Service Name</label>
                  <Input
                    value={draftService.name}
                    onChange={(event) => updateServiceDraftField(service, { name: event.target.value })}
                    className="mt-1 h-10 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Service Description</label>
                  <Input
                    value={draftService.description}
                    onChange={(event) => updateServiceDraftField(service, { description: event.target.value })}
                    className="mt-1 h-10 rounded-lg bg-white"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-700">{draftService.plans.length} plans</Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9 text-red-500 hover:bg-red-50 hover:text-red-600"
                  onClick={() => handleDeleteService(service)}
                  title="Delete service"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {draftService.plans.map((plan) => (
                <div key={`${service.id}-${plan.name}`} className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">{plan.name}</p>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Monthly Price (INR)</label>
                  <Input
                    type="number"
                    min={0}
                    value={plan.price}
                    onChange={(event) => updateServicePrice(service, plan.name, Number(event.target.value))}
                    className="mt-1 h-10 rounded-lg bg-white"
                  />
                  <p className="text-[11px] text-slate-500 mt-2">Limit: {plan.limit.toLocaleString()}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <p className="text-xs text-slate-500">
                Edit values and click Save Changes to sync with the user dashboard services page.
              </p>
              <div className="flex items-center gap-2">
                {savedServiceId === service.id && (
                  <span className="text-xs font-semibold text-emerald-600">Saved successfully</span>
                )}
                <Button
                  variant="outline"
                  className="h-9 px-4 rounded-lg"
                  onClick={() => handleResetServiceDraft(service)}
                >
                  Reset
                </Button>
                <Button
                  className="h-9 px-4 rounded-lg bg-slate-900 hover:bg-slate-800"
                  onClick={() => handleSaveService(service.id)}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// Analytics View
const AnalyticsView = ({ payments, users, stats }: { payments: Payment[]; users: User[]; stats: ReturnType<typeof useStore>['getStats'] extends () => infer R ? R : never }) => {
  const completedPayments = payments.filter(p => p.status === 'completed');
  const conversionRate = payments.length ? (completedPayments.length / payments.length) * 100 : 0;
  const avgOrderValue = completedPayments.length
    ? completedPayments.reduce((sum, payment) => sum + payment.amount, 0) / completedPayments.length
    : 0;
  const churnRate = users.length
    ? (users.filter(user => user.status === 'suspended').length / users.length) * 100
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart Placeholder */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Revenue Overview</h3>
          <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl flex items-center justify-center">
            <div className="text-center text-slate-400">
              <BarChart3 className="size-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Revenue chart visualization</p>
              <p className="text-xs">Integration with charting library needed</p>
            </div>
          </div>
        </div>

        {/* User Growth Placeholder */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-6">User Growth</h3>
          <div className="h-64 bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-xl flex items-center justify-center">
            <div className="text-center text-slate-400">
              <TrendingUp className="size-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">User growth chart</p>
              <p className="text-xs">Integration with charting library needed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Target className="size-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-slate-600">Conversion Rate</span>
          </div>
          <div className="text-3xl font-black text-slate-900">12.4%</div>
          <div className="text-3xl font-black text-slate-900">{conversionRate.toFixed(1)}%</div>
          <div className="flex items-center gap-1 text-slate-500 text-sm mt-2">
            <Activity size={14} /> Live conversion
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Zap className="size-5 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-slate-600">Avg. Order Value</span>
          </div>
          <div className="text-3xl font-black text-slate-900">₹{Math.round(avgOrderValue).toLocaleString()}</div>
          <div className="flex items-center gap-1 text-slate-500 text-sm mt-2">
            <Activity size={14} /> Live average
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <ShoppingCart className="size-5 text-emerald-600" />
            </div>
            <span className="text-sm font-medium text-slate-600">Completed Orders</span>
          </div>
          <div className="text-3xl font-black text-slate-900">{payments.filter(p => p.status === 'completed').length}</div>
          <div className="flex items-center gap-1 text-slate-500 text-sm mt-2">
            <Activity size={14} /> Live count
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <Users className="size-5 text-orange-600" />
            </div>
            <span className="text-sm font-medium text-slate-600">Churn Rate</span>
          </div>
          <div className="text-3xl font-black text-slate-900">{churnRate.toFixed(1)}%</div>
          <div className="flex items-center gap-1 text-slate-500 text-sm mt-2">
            <Activity size={14} /> Live churn
          </div>
        </div>
      </div>
    </div>
  );
};

// Settings View
const SettingsView = ({ admin, store }: { admin: AdminUser; store: ReturnType<typeof useStore> }) => {
  return (
    <div className="max-w-3xl space-y-6">
      {/* Admin Profile */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Admin Profile</h3>
        <div className="flex items-center gap-6">
          <div className="size-20 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
            A
          </div>
          <div className="flex-1">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-500 text-xs">Email</Label>
                <p className="font-medium text-slate-900">{admin.email}</p>
              </div>
              <div>
                <Label className="text-slate-500 text-xs">Role</Label>
                <p className="font-medium text-slate-900 capitalize">{admin.role}</p>
              </div>
              <div>
                <Label className="text-slate-500 text-xs">Last Login</Label>
                <p className="font-medium text-slate-900">{new Date(admin.loginTime).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Security Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Lock className="size-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Change Password</p>
                <p className="text-xs text-slate-500">Update your admin password</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Change</Button>
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <Shield className="size-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Two-Factor Authentication</p>
                <p className="text-xs text-slate-500">Add an extra layer of security</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Enable</Button>
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Activity className="size-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Activity Log</p>
                <p className="text-xs text-slate-500">View recent admin activities</p>
              </div>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>
        </div>
      </div>

      {/* System Settings */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-6">System Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <Mail className="size-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Email Notifications</p>
                <p className="text-xs text-slate-500">Configure email alerts</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Configure</Button>
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-cyan-100 flex items-center justify-center">
                <Globe className="size-5 text-cyan-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">API Keys</p>
                <p className="text-xs text-slate-500">Manage API integrations</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Manage</Button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 rounded-2xl border border-red-200 p-6">
        <h3 className="text-lg font-bold text-red-700 mb-6">Danger Zone</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-red-200">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-red-100 flex items-center justify-center">
                <RotateCcw className="size-5 text-red-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Reset All Data</p>
                <p className="text-xs text-slate-500">Reset to sample data (clears all payments, invoices, activity)</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-red-600 border-red-200 hover:bg-red-100"
              onClick={() => {
                if (confirm('Are you sure? This will reset all data to sample values.')) {
                  store.reset();
                }
              }}
            >
              Reset Data
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Invoices View
const InvoicesView = ({
  invoices,
  searchQuery,
  onDownloadInvoice,
}: {
  invoices: Invoice[];
  searchQuery: string;
  onDownloadInvoice: (invoice: Invoice) => Promise<void>;
}) => {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | null>(null);

  const filteredInvoices = invoices.filter(invoice => 
    invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0);
  const totalPending = invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.total, 0);

  const handleDownload = async (invoice: Invoice) => {
    setDownloadingInvoiceId(invoice.id);
    try {
      await onDownloadInvoice(invoice);
    } catch {
      window.alert('Unable to download invoice PDF right now. Please try again.');
    } finally {
      setDownloadingInvoiceId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <FileText className="size-5 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{invoices.length}</div>
          <div className="text-xs text-slate-400">Total Invoices</div>
        </div>
        <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="size-5 text-emerald-600" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700">₹{totalPaid.toLocaleString()}</div>
          <div className="text-xs text-emerald-600">Paid Amount</div>
        </div>
        <div className="bg-orange-50 p-5 rounded-2xl border border-orange-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <Clock className="size-5 text-orange-600" />
            </div>
          </div>
          <div className="text-2xl font-black text-orange-700">₹{totalPending.toLocaleString()}</div>
          <div className="text-xs text-orange-600">Pending Amount</div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
        <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">Invoice Contact</p>
        <div className="text-sm text-blue-900 space-y-1">
          <p><span className="font-semibold">Global Support:</span> {GLOBAL_SUPPORT_PHONE}</p>
          <p><span className="font-semibold">Email Inquiry:</span> {GLOBAL_SUPPORT_EMAIL}</p>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <div className="col-span-2">Invoice #</div>
          <div className="col-span-2">Customer</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-2">Due Date</div>
          <div className="col-span-2 text-right">Amount</div>
          <div className="col-span-1 text-center">Status</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>
        {filteredInvoices.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <FileText className="size-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">No invoices yet</p>
            <p className="text-sm mt-1">Invoices will appear here after payments are completed</p>
          </div>
        ) : (
          filteredInvoices.map((invoice) => (
            <div key={invoice.id} className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 last:border-0 items-center hover:bg-slate-50 transition-colors">
              <div className="col-span-2">
                <p className="font-bold text-slate-900">{invoice.invoiceNumber}</p>
              </div>
              <div className="col-span-2">
                <p className="font-medium text-slate-900">{invoice.userName}</p>
                <p className="text-xs text-slate-500">{invoice.userEmail}</p>
              </div>
              <div className="col-span-2 text-sm text-slate-600">
                {new Date(invoice.date).toLocaleDateString()}
              </div>
              <div className="col-span-2 text-sm text-slate-600">
                {new Date(invoice.dueDate).toLocaleDateString()}
              </div>
              <div className="col-span-2 text-right font-bold text-slate-900">₹{invoice.total.toLocaleString()}</div>
              <div className="col-span-1 text-center">
                <Badge className={cn(
                  "text-xs",
                  invoice.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                  invoice.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                  'bg-red-100 text-red-700'
                )}>
                  {invoice.status}
                </Badge>
              </div>
              <div className="col-span-1 flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => setSelectedInvoice(invoice)}
                >
                  <Eye size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => {
                    void handleDownload(invoice);
                  }}
                >
                  <Download size={14} />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={Boolean(selectedInvoice)} onClose={() => setSelectedInvoice(null)} title="Invoice Details" size="lg">
        {selectedInvoice && (
          <div className="space-y-6">
            <div className="flex justify-between items-start border-b border-slate-200 pb-5">
              <div>
                <img src={INVOICE_LOGO_PATH} alt="Volosist" className="h-12 w-auto object-contain mb-2" />
                <p className="text-sm text-slate-500">Global Support: {GLOBAL_SUPPORT_PHONE}</p>
                <p className="text-sm text-slate-500">Email Inquiry: {GLOBAL_SUPPORT_EMAIL}</p>
              </div>
              <div className="text-right">
                <h3 className="text-xl font-black text-slate-900">INVOICE</h3>
                <p className="text-sm text-slate-500 mt-1">{selectedInvoice.invoiceNumber}</p>
                <p className="text-xs text-slate-400 mt-1">Date: {new Date(selectedInvoice.date).toLocaleDateString()}</p>
                <p className="text-xs text-slate-400">Due: {new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Bill To</p>
              <p className="font-bold text-slate-900">{selectedInvoice.customerInfo.name}</p>
              <p className="text-sm text-slate-600">{selectedInvoice.customerInfo.company}</p>
              <p className="text-sm text-slate-500">{selectedInvoice.customerInfo.email}</p>
              <p className="text-sm text-slate-500">{selectedInvoice.customerInfo.address}</p>
              {selectedInvoice.customerInfo.gst && (
                <p className="text-sm text-slate-500">GST: {selectedInvoice.customerInfo.gst}</p>
              )}
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="grid grid-cols-12 gap-3 p-3 bg-slate-50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <div className="col-span-5">Service</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-right">Unit</div>
                <div className="col-span-3 text-right">Amount</div>
              </div>
              {selectedInvoice.items.map((item, index) => (
                <div key={`${selectedInvoice.id}-item-${index}`} className="grid grid-cols-12 gap-3 p-3 border-t border-slate-100 text-sm">
                  <div className="col-span-5">
                    <p className="font-medium text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.plan}</p>
                  </div>
                  <div className="col-span-2 text-center text-slate-600">{item.quantity}</div>
                  <div className="col-span-2 text-right text-slate-600">₹{item.unitPrice.toFixed(2)}</div>
                  <div className="col-span-3 text-right font-bold text-slate-900">₹{item.total.toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <div className="w-72 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-medium">₹{selectedInvoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">GST (18%)</span>
                  <span className="font-medium">₹{selectedInvoice.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-slate-200 pt-2">
                  <span>Total</span>
                  <span>₹{selectedInvoice.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <Button variant="outline" className="flex-1" onClick={() => setSelectedInvoice(null)}>Close</Button>
              <Button
                className="flex-1 gap-2"
                loading={downloadingInvoiceId === selectedInvoice.id}
                onClick={async () => {
                  await handleDownload(selectedInvoice);
                }}
              >
                <Download size={16} /> Download PDF
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// Activity Log View
const ActivityLogView = ({ activityLog, users }: { activityLog: ActivityLog[]; users: User[] }) => {
  const getActionIcon = (action: string) => {
    if (action.includes('payment')) return <CreditCard className="size-4" />;
    if (action.includes('user')) return <Users className="size-4" />;
    if (action.includes('system')) return <Settings className="size-4" />;
    return <Activity className="size-4" />;
  };

  const getActionColor = (type: string) => {
    switch (type) {
      case 'user': return 'bg-blue-100 text-blue-600';
      case 'admin': return 'bg-purple-100 text-purple-600';
      case 'system': return 'bg-slate-100 text-slate-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getUserName = (userId?: string) => {
    if (!userId) return 'System';
    const user = users.find(u => u.id === userId);
    return user?.name || userId;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Filter size={14} /> Filter
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download size={14} /> Export
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200">
        <div className="divide-y divide-slate-100">
          {activityLog.map((log) => (
            <div key={log.id} className="p-4 flex items-start gap-4 hover:bg-slate-50 transition-colors">
              <div className={cn("size-10 rounded-xl flex items-center justify-center flex-shrink-0", getActionColor(log.type))}>
                {getActionIcon(log.action)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-slate-900">{getUserName(log.userId || log.adminId)}</span>
                  <Badge variant="outline" className="text-[10px]">{log.type}</Badge>
                </div>
                <p className="text-sm text-slate-600 break-words">{log.details}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {new Date(log.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
          {activityLog.length === 0 && (
            <div className="p-12 text-center text-slate-400">
              <Activity className="size-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No activity yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Careers View ─────────────────────────────────────────────────────────────
import { supabase } from '../../lib/supabase';

interface JobPosition {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  short_description: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

const EMPTY_FORM: Omit<JobPosition, 'id' | 'created_at'> = {
  title: '',
  department: '',
  location: 'Remote',
  type: 'Full-time',
  short_description: '',
  description: '',
  is_active: true,
};

const CareersView = () => {
  const LOCAL_JOB_POSITIONS_KEY = 'volosist_job_positions';
  const [positions, setPositions] = useState<JobPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [error, setError] = useState('');

  const readLocalPositions = (): JobPosition[] => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = window.localStorage.getItem(LOCAL_JOB_POSITIONS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const writeLocalPositions = (nextPositions: JobPosition[]) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(LOCAL_JOB_POSITIONS_KEY, JSON.stringify(nextPositions));
  };

  const fetchPositions = async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('job_positions')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const remotePositions = (data ?? []) as JobPosition[];
      setPositions(remotePositions);
      writeLocalPositions(remotePositions);
      setError('');
    } catch {
      const localPositions = readLocalPositions();
      setPositions(localPositions);
      setError('Supabase connection failed. Showing locally saved job positions.');
    }
    setLoading(false);
  };

  useEffect(() => { fetchPositions(); }, []);

  const openNew = () => {
    setForm({ ...EMPTY_FORM });
    setEditId(null);
    setError('');
    setShowForm(true);
  };

  const openEdit = (p: JobPosition) => {
    setForm({
      title: p.title,
      department: p.department,
      location: p.location,
      type: p.type,
      short_description: p.short_description,
      description: p.description,
      is_active: p.is_active,
    });
    setEditId(p.id);
    setError('');
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.department.trim() || !form.short_description.trim() || !form.description.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    setSaving(true);
    setError('');
    let saveError: string | null = null;
    if (editId) {
      const { error: err } = await supabase.from('job_positions').update({ ...form, updated_at: new Date().toISOString() }).eq('id', editId);
      if (err) saveError = err.message;
    } else {
      const { error: err } = await supabase.from('job_positions').insert([form]);
      if (err) saveError = err.message;
    }

    if (saveError) {
      const localPositions = readLocalPositions();

      if (editId) {
        const updatedPositions = localPositions.map((position) =>
          position.id === editId
            ? { ...position, ...form, updated_at: new Date().toISOString() }
            : position
        );
        writeLocalPositions(updatedPositions);
      } else {
        const newPosition: JobPosition = {
          id: crypto.randomUUID(),
          ...form,
          created_at: new Date().toISOString(),
        };
        writeLocalPositions([newPosition, ...localPositions]);
      }

      setShowForm(false);
      await fetchPositions();
      setSaving(false);
      setError('Saved locally because Supabase is not reachable. Configure DB to sync online.');
      return;
    }

    setSaving(false);

    setShowForm(false);
    fetchPositions();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this position?')) return;
    const { error: deleteError } = await supabase.from('job_positions').delete().eq('id', id);
    if (deleteError) {
      const localPositions = readLocalPositions().filter((position) => position.id !== id);
      writeLocalPositions(localPositions);
      setError('Deleted locally because Supabase is not reachable.');
    }
    fetchPositions();
  };

  const toggleActive = async (p: JobPosition) => {
    const { error: toggleError } = await supabase.from('job_positions').update({ is_active: !p.is_active }).eq('id', p.id);
    if (toggleError) {
      const localPositions = readLocalPositions().map((position) =>
        position.id === p.id ? { ...position, is_active: !position.is_active } : position
      );
      writeLocalPositions(localPositions);
      setError('Status updated locally because Supabase is not reachable.');
    }
    fetchPositions();
  };

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Job Positions</h2>
          <p className="text-sm text-slate-500 mt-0.5">{positions.filter(p => p.is_active).length} active opening{positions.filter(p => p.is_active).length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={openNew} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl">
          <Plus size={16} /> Post New Position
        </Button>
      </div>

      {/* Form panel */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900 text-lg">{editId ? 'Edit Position' : 'New Position'}</h3>
            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-lg">
              <X size={18} className="text-slate-400" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Job Title *</label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. AI/ML Engineer" className="rounded-xl" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Department *</label>
              <Input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} placeholder="e.g. Engineering" className="rounded-xl" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Location</label>
              <Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Remote / Badlapur" className="rounded-xl" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Employment Type</label>
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm bg-white text-slate-900"
              >
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
                <option>Internship</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Short Description * <span className="normal-case text-slate-400 font-normal">(shown as subtitle on card)</span></label>
            <Input value={form.short_description} onChange={e => setForm(f => ({ ...f, short_description: e.target.value }))} placeholder="One-line summary of the role" className="rounded-xl" />
          </div>

          <div className="mb-4">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Full Description * <span className="normal-case text-slate-400 font-normal">(responsibilities, requirements)</span></label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Describe the role, responsibilities, and requirements..."
              rows={5}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white text-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-3 mb-5">
            <button onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))} className="flex items-center gap-2 text-sm font-medium text-slate-700">
              {form.is_active
                ? <ToggleRight size={22} className="text-emerald-500" />
                : <ToggleLeft size={22} className="text-slate-400" />}
              {form.is_active ? 'Active — visible on website' : 'Inactive — hidden from website'}
            </button>
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowForm(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
              {saving ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
              {saving ? 'Saving…' : editId ? 'Save Changes' : 'Post Position'}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Positions list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-blue-600" />
        </div>
      ) : positions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <Briefcase size={48} className="text-slate-200 mx-auto mb-4" />
          <p className="font-bold text-slate-500">No positions yet</p>
          <p className="text-slate-400 text-sm mt-1">Click "Post New Position" to add your first job opening.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {positions.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className={cn("size-11 rounded-xl flex items-center justify-center shrink-0", p.is_active ? 'bg-emerald-100' : 'bg-slate-100')}>
                <Briefcase size={20} className={p.is_active ? 'text-emerald-600' : 'text-slate-400'} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-0.5">
                  <h4 className="font-bold text-slate-900">{p.title}</h4>
                  <Badge className={cn('text-[10px] px-2', p.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500')}>
                    {p.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-xs text-blue-600 font-medium mb-1">{p.department} · {p.location} · {p.type}</p>
                <p className="text-sm text-slate-600 truncate">{p.short_description}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => toggleActive(p)}
                  title={p.is_active ? 'Deactivate' : 'Activate'}
                  className="size-9 rounded-xl hover:bg-slate-100 flex items-center justify-center transition-colors"
                >
                  {p.is_active ? <ToggleRight size={18} className="text-emerald-500" /> : <ToggleLeft size={18} className="text-slate-400" />}
                </button>
                <button
                  onClick={() => openEdit(p)}
                  className="size-9 rounded-xl hover:bg-blue-50 flex items-center justify-center transition-colors"
                >
                  <Edit size={16} className="text-blue-600" />
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="size-9 rounded-xl hover:bg-red-50 flex items-center justify-center transition-colors"
                >
                  <Trash2 size={16} className="text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Label component inline
const Label = ({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={cn("text-sm font-medium text-slate-700", className)} {...props}>
    {children}
  </label>
);
