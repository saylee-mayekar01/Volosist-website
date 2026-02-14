import React, { useState, createContext, useContext, useCallback, useMemo } from 'react';
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
import { supabase } from '../../lib/supabase';
import { store as globalStore } from '../../lib/store';

// Types
interface Service {
  id: number;
  name: string;
  plan: string;
  status: string;
  icon: React.ReactNode;
  color: string;
  purchaseDate: string;
  expiryDate: string;
  renewalCost: number;
  features: string[];
  usage: { used: number; limit: number; unit: string };
}

interface TeamMember {
  id: number;
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

// Provider Component
const DashboardProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [purchasedServices, setPurchasedServices] = useState<Service[]>(INITIAL_SERVICES);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(INITIAL_TEAM_MEMBERS);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [modal, setModal] = useState<{ type: string; data?: any } | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [invoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

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

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <DashboardContext.Provider value={{
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
const INITIAL_SERVICES: Service[] = [
  { 
    id: 1,
    name: 'Sales & Lead Automation',
    plan: 'Pro',
    status: 'active',
    icon: <TrendingUp className="size-5 text-white" />,
    color: 'bg-blue-600',
    purchaseDate: '2025-08-15',
    expiryDate: '2026-08-15',
    renewalCost: 1490,
    features: ['Automated Follow-ups', 'AI Lead Capture', 'CRM Automation', 'Sales Chatbot'],
    usage: { used: 12500, limit: 20000, unit: 'leads/month' }
  },
  { 
    id: 2,
    name: 'Marketing & Content',
    plan: 'Basic',
    status: 'expiring',
    icon: <Megaphone className="size-5 text-white" />,
    color: 'bg-purple-600',
    purchaseDate: '2025-06-01',
    expiryDate: '2026-03-01',
    renewalCost: 490,
    features: ['AI Content Generation', 'Social Automation', 'SEO Tools'],
    usage: { used: 45, limit: 50, unit: 'posts/month' }
  },
];

const INITIAL_TEAM_MEMBERS: TeamMember[] = [];

// Available Services to Purchase
const AVAILABLE_SERVICES = [
  {
    id: 'sales',
    name: 'Sales & Lead Automation',
    description: 'AI-powered lead capture, CRM automation & outbound calling.',
    icon: <TrendingUp className="size-6" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    serviceColor: 'bg-blue-600',
    plans: [
      { name: 'Basic', price: 490, features: ['5,000 leads/month', 'Email Follow-ups', 'Basic CRM Sync'], limit: 5000 },
      { name: 'Pro', price: 1490, features: ['20,000 leads/month', 'Email + WhatsApp + Calls', 'Full CRM Automation', 'AI Chatbot'], limit: 20000 },
      { name: 'Business', price: 4990, features: ['Unlimited leads', 'All channels', 'Priority Support', 'Custom Integration'], limit: 100000 },
    ]
  },
  {
    id: 'voice',
    name: 'AI Voice & Calling',
    description: 'Intelligent voice automation for inbound/outbound calls.',
    icon: <Phone className="size-6" />,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    serviceColor: 'bg-emerald-600',
    plans: [
      { name: 'Basic', price: 790, features: ['1,000 minutes/month', 'Inbound Only', 'Basic Transcription'], limit: 1000 },
      { name: 'Pro', price: 1990, features: ['5,000 minutes/month', 'Inbound + Outbound', 'Full Transcription', 'Sentiment Analysis'], limit: 5000 },
      { name: 'Business', price: 4990, features: ['Unlimited minutes', 'All features', 'Human Handoff', 'Custom Voice'], limit: 50000 },
    ]
  },
  {
    id: 'marketing',
    name: 'Marketing & Content',
    description: 'AI content generation, social media & ads automation.',
    icon: <Megaphone className="size-6" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    serviceColor: 'bg-purple-600',
    plans: [
      { name: 'Basic', price: 490, features: ['50 posts/month', 'AI Content Gen', '2 Social Accounts'], limit: 50 },
      { name: 'Pro', price: 1290, features: ['200 posts/month', 'All content types', '10 Social Accounts', 'Ad Automation'], limit: 200 },
      { name: 'Business', price: 3990, features: ['Unlimited posts', 'Full automation', 'Unlimited accounts', 'SEO Suite'], limit: 1000 },
    ]
  },
  {
    id: 'business',
    name: 'Business Solutions',
    description: 'Web development, design, virtual assistants & more.',
    icon: <Briefcase className="size-6" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    serviceColor: 'bg-orange-600',
    plans: [
      { name: 'Basic', price: 990, features: ['1 Website', 'Basic Design', 'Email Support'], limit: 1 },
      { name: 'Pro', price: 2490, features: ['3 Websites', 'Premium Design', 'Virtual Assistant', 'Priority Support'], limit: 3 },
      { name: 'Business', price: 6990, features: ['Unlimited Sites', 'Full VA Suite', 'Dedicated Manager', 'Custom Solutions'], limit: 10 },
    ]
  },
];

// Invoice Data - Start empty (orders and invoices are created on purchase)
const INITIAL_ORDERS: Order[] = [];
const INITIAL_INVOICES: Invoice[] = [];

// Initial Notifications
const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif_1',
    title: 'Subscription Expiring Soon',
    message: 'Your Marketing & Content subscription expires in 17 days. Renew now to avoid service interruption.',
    type: 'warning',
    read: false,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif_2',
    title: 'Payment Successful',
    message: 'Your payment of $1,490 for Sales & Lead Automation has been processed.',
    type: 'success',
    read: false,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif_3',
    title: 'New Feature Available',
    message: 'AI Voice & Calling now supports real-time sentiment analysis. Upgrade to Pro to access this feature.',
    type: 'info',
    read: true,
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif_4',
    title: 'Usage Alert',
    message: 'You have used 90% of your monthly leads quota. Consider upgrading your plan.',
    type: 'alert',
    read: true,
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

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
      name: service.name,
      plan: selectedPlan.name,
      status: 'active',
      icon: iconMap[service.id],
      color: service.serviceColor,
      purchaseDate: today.toISOString().split('T')[0],
      expiryDate: expiryDate.toISOString().split('T')[0],
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
            <span className="text-2xl font-black text-slate-900">${selectedPlan.price}</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-slate-400">Annual Total</span>
            <span className="text-sm font-bold text-slate-600">${selectedPlan.price * 12}/year</span>
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
  const { setPurchasedServices, showToast, setActiveTab } = useDashboard();
  const [processing, setProcessing] = useState(false);

  const handleRenew = async () => {
    if (!service) return;
    setProcessing(true);
    await new Promise(r => setTimeout(r, 1500));

    const newExpiryDate = new Date(service.expiryDate);
    newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1);

    setPurchasedServices(prev => prev.map(s => 
      s.id === service.id 
        ? { ...s, expiryDate: newExpiryDate.toISOString().split('T')[0], status: 'active' } 
        : s
    ));

    setProcessing(false);
    showToast(`${service.name} renewed for another year!`, 'success');
    onClose();
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
            <span className="text-2xl font-black text-slate-900">${service.renewalCost}</span>
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

// Invite Member Modal
const InviteMemberModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { setTeamMembers, showToast } = useDashboard();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Viewer');
  const [sending, setSending] = useState(false);

  const handleInvite = async () => {
    if (!email || !name) return;
    setSending(true);
    await new Promise(r => setTimeout(r, 1000));

    const newMember: TeamMember = {
      id: Date.now(),
      name,
      email,
      role,
      avatar: null,
      status: 'pending',
      lastActive: 'Invitation sent'
    };

    setTeamMembers(prev => [...prev, newMember]);
    setSending(false);
    showToast(`Invitation sent to ${email}!`, 'success');
    setEmail('');
    setName('');
    setRole('Viewer');
    onClose();
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
              onChange={(e) => setRole(e.target.value)}
              className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Admin">Admin - Full access</option>
              <option value="Editor">Editor - Limited access</option>
              <option value="Viewer">Viewer - View only</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleInvite} loading={sending} disabled={!email || !name} className="flex-1 gap-2">
            <Mail size={18} /> Send Invitation
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Edit Member Modal
const EditMemberModal = ({ isOpen, onClose, member }: { isOpen: boolean; onClose: () => void; member: TeamMember | null }) => {
  const { setTeamMembers, showToast } = useDashboard();
  const [role, setRole] = useState(member?.role || 'Viewer');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!member) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));

    setTeamMembers(prev => prev.map(m => 
      m.id === member.id ? { ...m, role } : m
    ));

    setSaving(false);
    showToast(`${member.name}'s role updated to ${role}`, 'success');
    onClose();
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
            onChange={(e) => setRole(e.target.value)}
            className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Admin">Admin - Full access</option>
            <option value="Editor">Editor - Limited access</option>
            <option value="Viewer">Viewer - View only</option>
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
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, title, message }: { isOpen: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string }) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await new Promise(r => setTimeout(r, 800));
    onConfirm();
    setDeleting(false);
    onClose();
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
            <div className="text-2xl font-black text-slate-900">${Math.round(totalMonthly)}</div>
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
                  <span className="font-bold text-slate-900">${invoice.total.toFixed(2)}</span>
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
                    <div className="font-bold text-slate-900">${item.price}</div>
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
                <span className="font-medium text-slate-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">GST (18%)</span>
                <span className="font-medium text-slate-900">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-slate-200 pt-3">
                <span className="text-slate-900">Total</span>
                <span className="text-blue-600">${total.toFixed(2)}</span>
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
  const { cart, clearCart, addOrder, setPurchasedServices, showToast, invoices } = useDashboard();
  const [step, setStep] = useState<'summary' | 'billing' | 'payment' | 'processing' | 'success'>('summary');
  const [billingInfo, setBillingInfo] = useState({
    name: '',
    email: '',
    company: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'India',
    gst: ''
  });
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking'>('card');
  const [cardInfo, setCardInfo] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [processing, setProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState<Order | null>(null);

  const subtotal = cart.reduce((acc, item) => acc + item.price, 0);
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  const handlePayment = async () => {
    setStep('processing');
    setProcessing(true);

    // Simulate Cashfree payment processing
    await new Promise(r => setTimeout(r, 2500));

    const orderNumber = `ORD-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;
    const paymentId = `cf_pay_${Date.now()}`;

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      orderNumber,
      date: new Date().toISOString(),
      items: cart,
      subtotal,
      tax,
      total,
      status: 'completed',
      paymentMethod: `Cashfree - ${paymentMethod.toUpperCase()}`,
      paymentId
    };

    // Sync payment to admin store
    const firstItem = cart[0];
    globalStore.addPayment({
      userId: 'current_user',
      userName: billingInfo.name || 'User',
      userEmail: billingInfo.email || 'user@example.com',
      amount: total,
      status: 'completed',
      method: paymentMethod === 'card' ? 'Card' : paymentMethod === 'upi' ? 'UPI' : 'Net Banking',
      date: new Date().toISOString(),
      service: firstItem?.serviceName || 'Service Bundle',
      plan: firstItem?.plan || 'Custom',
      items: cart.map(item => ({
        name: item.serviceName,
        plan: item.plan,
        price: item.price
      }))
    });

    // Add services to purchased
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

    cart.forEach(item => {
      const newService: Service = {
        id: Date.now() + Math.random(),
        name: item.serviceName,
        plan: item.plan,
        status: 'active',
        icon: iconMap[item.serviceId] || <Package className="size-5 text-white" />,
        color: item.serviceColor,
        purchaseDate: today.toISOString().split('T')[0],
        expiryDate: expiryDate.toISOString().split('T')[0],
        renewalCost: item.price * 12,
        features: item.features,
        usage: { used: 0, limit: 10000, unit: unitMap[item.serviceId] || 'units/month' }
      };
      setPurchasedServices(prev => [...prev, newService]);
    });

    addOrder(newOrder);
    setOrderComplete(newOrder);
    setStep('success');
    setProcessing(false);
  };

  const handleClose = () => {
    if (step === 'success') {
      clearCart();
      setStep('summary');
      setOrderComplete(null);
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
          {['summary', 'billing', 'payment'].map((s, idx) => (
            <React.Fragment key={s}>
              <div className={cn(
                "size-8 rounded-full flex items-center justify-center text-sm font-bold",
                step === s ? 'bg-blue-600 text-white' : 
                ['summary', 'billing', 'payment'].indexOf(step) > idx ? 'bg-emerald-500 text-white' : 
                'bg-slate-100 text-slate-400'
              )}>
                {['summary', 'billing', 'payment'].indexOf(step) > idx ? <Check size={16} /> : idx + 1}
              </div>
              {idx < 2 && <div className={cn(
                "w-16 h-0.5",
                ['summary', 'billing', 'payment'].indexOf(step) > idx ? 'bg-emerald-500' : 'bg-slate-200'
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
                  <div className="font-bold text-slate-900">${item.price}/mo</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">GST (18%)</span>
              <span className="font-medium">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-blue-200 pt-2 mt-2">
              <span>Total</span>
              <span className="text-blue-600">${total.toFixed(2)}</span>
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
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Company</label>
                <Input value={billingInfo.company} onChange={e => setBillingInfo({...billingInfo, company: e.target.value})} className="h-11" />
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Address</label>
                <Input value={billingInfo.address} onChange={e => setBillingInfo({...billingInfo, address: e.target.value})} className="h-11" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">City</label>
                <Input value={billingInfo.city} onChange={e => setBillingInfo({...billingInfo, city: e.target.value})} className="h-11" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">ZIP Code</label>
                <Input value={billingInfo.zip} onChange={e => setBillingInfo({...billingInfo, zip: e.target.value})} className="h-11" />
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">GST Number (Optional)</label>
                <Input value={billingInfo.gst} onChange={e => setBillingInfo({...billingInfo, gst: e.target.value})} placeholder="GSTIN12345678" className="h-11" />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep('summary')} className="flex-1">Back</Button>
            <Button className="flex-1 gap-2" onClick={() => setStep('payment')}>
              Continue to Payment <ArrowRight size={18} />
            </Button>
          </div>
        </div>
      )}

      {/* Step: Payment */}
      {step === 'payment' && (
        <div className="space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Wallet size={18} /> Payment Method
            </h3>
            
            {/* Payment Method Selection */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <button
                onClick={() => setPaymentMethod('card')}
                className={cn(
                  "p-4 rounded-xl border-2 text-center transition-all",
                  paymentMethod === 'card' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-blue-300'
                )}
              >
                <CreditCard className={cn("size-6 mx-auto mb-2", paymentMethod === 'card' ? 'text-blue-600' : 'text-slate-400')} />
                <div className={cn("text-sm font-medium", paymentMethod === 'card' ? 'text-blue-600' : 'text-slate-600')}>Card</div>
              </button>
              <button
                onClick={() => setPaymentMethod('upi')}
                className={cn(
                  "p-4 rounded-xl border-2 text-center transition-all",
                  paymentMethod === 'upi' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-blue-300'
                )}
              >
                <IndianRupee className={cn("size-6 mx-auto mb-2", paymentMethod === 'upi' ? 'text-blue-600' : 'text-slate-400')} />
                <div className={cn("text-sm font-medium", paymentMethod === 'upi' ? 'text-blue-600' : 'text-slate-600')}>UPI</div>
              </button>
              <button
                onClick={() => setPaymentMethod('netbanking')}
                className={cn(
                  "p-4 rounded-xl border-2 text-center transition-all",
                  paymentMethod === 'netbanking' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-blue-300'
                )}
              >
                <Building2 className={cn("size-6 mx-auto mb-2", paymentMethod === 'netbanking' ? 'text-blue-600' : 'text-slate-400')} />
                <div className={cn("text-sm font-medium", paymentMethod === 'netbanking' ? 'text-blue-600' : 'text-slate-600')}>Net Banking</div>
              </button>
            </div>

            {/* Card Form */}
            {paymentMethod === 'card' && (
              <div className="space-y-4 p-4 bg-slate-50 rounded-xl">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">Card Number</label>
                  <Input 
                    value={cardInfo.number} 
                    onChange={e => setCardInfo({...cardInfo, number: e.target.value})} 
                    placeholder="4242 4242 4242 4242" 
                    className="h-11 font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">Expiry</label>
                    <Input 
                      value={cardInfo.expiry} 
                      onChange={e => setCardInfo({...cardInfo, expiry: e.target.value})} 
                      placeholder="MM/YY" 
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">CVV</label>
                    <Input 
                      type="password"
                      value={cardInfo.cvv} 
                      onChange={e => setCardInfo({...cardInfo, cvv: e.target.value})} 
                      placeholder="•••" 
                      className="h-11"
                      maxLength={4}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">Cardholder Name</label>
                  <Input 
                    value={cardInfo.name} 
                    onChange={e => setCardInfo({...cardInfo, name: e.target.value})} 
                    placeholder="John Doe" 
                    className="h-11"
                  />
                </div>
              </div>
            )}

            {/* UPI Form */}
            {paymentMethod === 'upi' && (
              <div className="space-y-4 p-4 bg-slate-50 rounded-xl">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">UPI ID</label>
                  <Input 
                    value={upiId} 
                    onChange={e => setUpiId(e.target.value)} 
                    placeholder="yourname@upi" 
                    className="h-11"
                  />
                </div>
                <p className="text-xs text-slate-400">Enter your UPI ID and we'll send a payment request to your app.</p>
              </div>
            )}

            {/* Net Banking Form */}
            {paymentMethod === 'netbanking' && (
              <div className="space-y-4 p-4 bg-slate-50 rounded-xl">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">Select Bank</label>
                  <select 
                    value={selectedBank}
                    onChange={e => setSelectedBank(e.target.value)}
                    className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select your bank</option>
                    <option value="sbi">State Bank of India</option>
                    <option value="hdfc">HDFC Bank</option>
                    <option value="icici">ICICI Bank</option>
                    <option value="axis">Axis Bank</option>
                    <option value="kotak">Kotak Mahindra Bank</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Cashfree Badge */}
          <div className="flex items-center justify-center gap-2 py-3 bg-slate-50 rounded-xl">
            <Lock className="size-4 text-slate-400" />
            <span className="text-xs text-slate-500">Secured by</span>
            <span className="text-sm font-bold text-slate-700">Cashfree</span>
            <BadgeCheck className="size-4 text-emerald-500" />
          </div>

          {/* Order Total */}
          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white">
            <span className="font-medium">Total Amount</span>
            <span className="text-2xl font-black">${total.toFixed(2)}</span>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep('billing')} className="flex-1">Back</Button>
            <Button className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700" onClick={handlePayment}>
              <Lock size={16} /> Pay ${total.toFixed(2)}
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
            <span>Secured by Cashfree Payment Gateway</span>
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
              <span className="font-bold text-emerald-600">${orderComplete.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Payment Method</span>
              <span className="text-slate-600">{orderComplete.paymentMethod}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 gap-2">
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

// Invoice Modal
const InvoiceModal = ({ isOpen, onClose, invoice }: { isOpen: boolean; onClose: () => void; invoice: Invoice | null }) => {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In a real app, generate PDF
    alert('Invoice PDF download initiated');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="lg">
      <div className="space-y-6">
        {/* Invoice Header */}
        <div className="flex justify-between items-start border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <img src="/favicon.ico" alt="Volosist" className="w-10 h-10" />
              <span className="text-xl font-bold text-slate-900">VOLOSIST</span>
            </div>
            <div className="text-sm text-slate-500 space-y-1">
              <p>AI Automation Solutions</p>
              <p>support@volosist.com</p>
              <p>+1 (800) 123-4567</p>
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
              <div className="col-span-2 text-right text-slate-600">${item.unitPrice.toFixed(2)}</div>
              <div className="col-span-3 text-right font-bold text-slate-900">${item.total.toFixed(2)}</div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-72 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-medium">${invoice.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">GST (18%)</span>
              <span className="font-medium">${invoice.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-slate-200 pt-2">
              <span>Total</span>
              <span className="text-blue-600">${invoice.total.toFixed(2)}</span>
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
              <span className="font-bold text-slate-900">${item.price}/mo</span>
            </div>
          ))}
        </div>

        <div className="bg-slate-50 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Subtotal</span>
            <span className="font-medium">${order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Tax (GST 18%)</span>
            <span className="font-medium">${order.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t border-slate-200 pt-2">
            <span>Total</span>
            <span className="text-blue-600">${order.total.toFixed(2)}</span>
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
  const { purchasedServices, teamMembers, setActiveTab, openModal } = useDashboard();

  const getDaysRemaining = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diff = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const totalMonthlySpend = purchasedServices.reduce((acc, s) => acc + (s.renewalCost / 12), 0);

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
          <div className="text-xl font-black text-slate-900">${Math.round(totalMonthlySpend)}</div>
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
                      className={cn(
                        "gap-2 rounded-xl text-xs font-bold",
                        service.status === 'expiring' ? 'bg-orange-600 hover:bg-orange-700' : ''
                      )}
                      onClick={() => openModal('renew', service)}
                    >
                      <RefreshCw size={14} /> Renew ${service.renewalCost}/yr
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
  const { purchasedServices, cart, addToCart, removeFromCart, openModal, showToast } = useDashboard();
  const [selectedPlans, setSelectedPlans] = useState<Record<string, number>>({
    sales: 1, voice: 1, marketing: 1, business: 1
  });
  const [billingCycle, setBillingCycle] = useState<Record<string, 'monthly' | 'yearly'>>({
    sales: 'monthly', voice: 'monthly', marketing: 'monthly', business: 'monthly'
  });

  const isAlreadySubscribed = (serviceName: string) => {
    return purchasedServices.some(s => s.name === serviceName);
  };

  const getCartItem = (serviceId: string, planName: string) => {
    return cart.find(i => i.serviceId === serviceId && i.plan === planName);
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
                Total: ${cart.reduce((acc, i) => acc + i.price, 0).toFixed(2)}/month
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
        {AVAILABLE_SERVICES.map((service) => {
          const subscribed = isAlreadySubscribed(service.name);
          const selectedIdx = selectedPlans[service.id];
          const currentPlan = service.plans[selectedIdx];
          const cartItem = getCartItem(service.id, currentPlan.name);
          const inCart = !!cartItem;
          const cycle = billingCycle[service.id];
          const displayPrice = cycle === 'yearly' ? Math.round(currentPlan.price * 0.8) : currentPlan.price;
          
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
                          ${planPrice}
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
                    {currentPlan.features.slice(0, 4).map((f, i) => (
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
                    <Button className="w-full gap-2 bg-emerald-600" disabled>
                      <Check size={18} /> Already Subscribed
                    </Button>
                  ) : inCart ? (
                    <>
                      <Button 
                        variant="outline"
                        className="flex-1 gap-2 border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => handleRemoveFromCart(service.id, currentPlan.name)}
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
                        onClick={() => handleAddToCart(service, currentPlan)}
                      >
                        <ShoppingCart size={16} /> Add to Cart
                      </Button>
                      <Button 
                        className="flex-1 gap-2"
                        onClick={() => {
                          handleAddToCart(service, currentPlan);
                          openModal('checkout');
                        }}
                      >
                        <Sparkles size={16} /> Buy Now
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

const SecurityView = () => {
  const { teamMembers, setTeamMembers, openModal, showToast } = useDashboard();
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

  const handleDeleteMember = () => {
    if (memberToDelete) {
      setTeamMembers(prev => prev.filter(m => m.id !== memberToDelete.id));
      showToast(`${memberToDelete.name} has been removed from the team`, 'success');
      setMemberToDelete(null);
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
              <span className={cn(
                "text-sm",
                member.status === 'pending' ? 'text-orange-600' : 'text-slate-500'
              )}>
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
            ${invoices.reduce((acc, i) => acc + i.total, 0).toLocaleString()}
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
              <div className="col-span-2 text-right font-bold text-slate-900">${invoice.total.toFixed(2)}</div>
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
                    alert('Download initiated');
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
              <div className="col-span-2 text-right font-bold text-slate-900">${order.total.toFixed(2)}</div>
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
    // Auth temporarily bypassed for development
    // TODO: Restore Supabase auth when credentials are renewed
    // const { error } = await supabase.auth.updateUser({
    //   data: {
    //     full_name: formData.name,
    //     phone: formData.phone,
    //     company: formData.company,
    //     timezone: formData.timezone,
    //   }
    // });
    // if (error) {
    //   showToast(error.message, 'error');
    // } else {
    //   showToast('Profile updated successfully', 'success');
    //   setIsEditing(false);
    // }
    
    // Bypass - simulate success
    setTimeout(() => {
      setSaving(false);
      showToast('Profile updated successfully', 'success');
      setIsEditing(false);
    }, 500);
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
    <DashboardProvider>
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
