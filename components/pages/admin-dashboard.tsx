import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';
import { useStore, User, Payment, Invoice, Notification, ActivityLog } from '../../lib/store';
import {
  Shield, LayoutDashboard, Users, CreditCard, Package, BarChart3, Settings,
  LogOut, Search, Bell, ChevronRight, ChevronDown, DollarSign, TrendingUp,
  TrendingDown, ArrowUpRight, Eye, Download, MoreHorizontal, RefreshCw,
  CheckCircle, XCircle, Clock, AlertCircle, Filter, Calendar, FileText,
  Mail, Phone, MapPin, Building, UserCheck, UserX, Edit, Trash2, Plus,
  X, Activity, PieChart, Target, Zap, ShoppingCart, Receipt, Globe, Lock,
  RotateCcw, History
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
  icon: string;
  color: string;
  activeUsers: number;
  revenue: number;
  growth: number;
}

const SERVICE_STATS: ServiceStat[] = [
  { id: '1', name: 'Sales Automation', icon: 'TrendingUp', color: 'bg-blue-600', activeUsers: 234, revenue: 348600, growth: 12.5 },
  { id: '2', name: 'Marketing & Content', icon: 'Target', color: 'bg-purple-600', activeUsers: 189, revenue: 423400, growth: 8.3 },
  { id: '3', name: 'Customer Support', icon: 'Users', color: 'bg-emerald-600', activeUsers: 156, revenue: 195200, growth: -2.1 },
  { id: '4', name: 'Voice AI', icon: 'Phone', color: 'bg-cyan-600', activeUsers: 98, revenue: 156800, growth: 25.7 },
  { id: '5', name: 'Data Analytics', icon: 'BarChart3', color: 'bg-orange-600', activeUsers: 145, revenue: 267300, growth: 15.2 },
];

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

  // Stats from store
  const totalRevenue = stats.totalRevenue;
  const pendingPayments = stats.pendingPayments;
  const activeUsers = stats.activeUsers;
  const totalUsers = stats.totalUsers;

  const SIDEBAR_ITEMS = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'activity', label: 'Activity Log', icon: History },
    { id: 'services', label: 'Services', icon: Package },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
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
              serviceStats={SERVICE_STATS}
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
            />
          )}
          {activeTab === 'activity' && (
            <ActivityLogView 
              activityLog={activityLog}
              users={users}
            />
          )}
          {activeTab === 'services' && <ServicesView serviceStats={SERVICE_STATS} />}
          {activeTab === 'analytics' && <AnalyticsView payments={payments} users={users} stats={stats} />}
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
              <Badge className={cn(
                selectedPayment.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                selectedPayment.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                selectedPayment.status === 'failed' ? 'bg-red-100 text-red-700' :
                'bg-purple-100 text-purple-700'
              )}>
                {selectedPayment.status.charAt(0).toUpperCase() + selectedPayment.status.slice(1)}
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
              </div>
            </div>

            <div className="flex gap-3">
              {selectedPayment.status === 'completed' && (
                <Button 
                  variant="outline" 
                  className="flex-1 gap-2 text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => {
                    store.updatePaymentStatus(selectedPayment.id, 'refunded');
                    setShowPaymentModal(false);
                  }}
                >
                  <RefreshCw size={16} /> Process Refund
                </Button>
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
              <Button variant="outline" className="gap-2">
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
            <Badge className="bg-emerald-100 text-emerald-700 gap-1">
              <TrendingUp size={12} /> 12.5%
            </Badge>
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
            <Badge className="bg-blue-100 text-blue-700 gap-1">
              <TrendingUp size={12} /> 8.3%
            </Badge>
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
            <Badge className="bg-purple-100 text-purple-700 gap-1">
              <TrendingUp size={12} /> 5 Active
            </Badge>
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
                    <span className={cn(
                      "text-sm font-bold flex items-center gap-1",
                      service.growth >= 0 ? 'text-emerald-600' : 'text-red-600'
                    )}>
                      {service.growth >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {Math.abs(service.growth)}%
                    </span>
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
            {recentPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "size-10 rounded-xl flex items-center justify-center",
                    payment.status === 'completed' ? 'bg-emerald-100' :
                    payment.status === 'pending' ? 'bg-orange-100' :
                    payment.status === 'failed' ? 'bg-red-100' : 'bg-purple-100'
                  )}>
                    {payment.status === 'completed' ? <CheckCircle className="size-5 text-emerald-600" /> :
                     payment.status === 'pending' ? <Clock className="size-5 text-orange-600" /> :
                     payment.status === 'failed' ? <XCircle className="size-5 text-red-600" /> :
                     <RefreshCw className="size-5 text-purple-600" />}
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
            ))}
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

  const totalCompleted = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const totalRefunded = payments.filter(p => p.status === 'refunded').reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {['all', 'completed', 'pending', 'failed', 'refunded'].map((status) => (
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
              <Badge className={cn(
                "text-xs",
                payment.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                payment.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                payment.status === 'failed' ? 'bg-red-100 text-red-700' :
                'bg-purple-100 text-purple-700'
              )}>
                {payment.status}
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
const ServicesView = ({ serviceStats }: { serviceStats: ServiceStat[] }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {serviceStats.map((service) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-6">
              <div className={cn("size-14 rounded-2xl flex items-center justify-center", service.color)}>
                <Package className="size-7 text-white" />
              </div>
              <Badge className={cn(
                "gap-1",
                service.growth >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
              )}>
                {service.growth >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {Math.abs(service.growth)}%
              </Badge>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-4">{service.name}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-black text-slate-900">{service.activeUsers}</div>
                <div className="text-xs text-slate-500">Active Users</div>
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">₹{(service.revenue / 1000).toFixed(0)}K</div>
                <div className="text-xs text-slate-500">Revenue</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">View Details</Button>
              <Button variant="ghost" size="icon" className="size-8">
                <Edit size={14} />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Analytics View
const AnalyticsView = ({ payments, users, stats }: { payments: Payment[]; users: User[]; stats: ReturnType<typeof useStore>['getStats'] extends () => infer R ? R : never }) => {
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
          <div className="flex items-center gap-1 text-emerald-600 text-sm mt-2">
            <TrendingUp size={14} /> +2.1% from last month
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Zap className="size-5 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-slate-600">Avg. Order Value</span>
          </div>
          <div className="text-3xl font-black text-slate-900">₹2,340</div>
          <div className="flex items-center gap-1 text-emerald-600 text-sm mt-2">
            <TrendingUp size={14} /> +8.7% from last month
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
          <div className="flex items-center gap-1 text-emerald-600 text-sm mt-2">
            <TrendingUp size={14} /> +15 this week
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <Users className="size-5 text-orange-600" />
            </div>
            <span className="text-sm font-medium text-slate-600">Churn Rate</span>
          </div>
          <div className="text-3xl font-black text-slate-900">2.3%</div>
          <div className="flex items-center gap-1 text-red-600 text-sm mt-2">
            <TrendingDown size={14} /> -0.5% from last month
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
const InvoicesView = ({ invoices, searchQuery }: { invoices: Invoice[]; searchQuery: string }) => {
  const filteredInvoices = invoices.filter(invoice => 
    invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0);
  const totalPending = invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.total, 0);

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
                <Button variant="ghost" size="icon" className="size-8">
                  <Eye size={14} />
                </Button>
                <Button variant="ghost" size="icon" className="size-8">
                  <Download size={14} />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
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

// Label component inline
const Label = ({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={cn("text-sm font-medium text-slate-700", className)} {...props}>
    {children}
  </label>
);
