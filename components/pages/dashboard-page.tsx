
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Zap, 
  Database, 
  Shield, 
  Settings, 
  LogOut, 
  Bell, 
  Search,
  ArrowUpRight,
  TrendingUp,
  Cpu,
  Activity,
  ChevronRight,
  Plus,
  RefreshCw,
  Lock,
  User,
  Key
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { cn } from '../../lib/utils';

interface DashboardPageProps {
  user: any;
  onNavigate: (view: any) => void;
  onSignOut: () => void;
}

const SIDEBAR_ITEMS = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={20} /> },
  { id: 'nodes', label: 'AI Nodes', icon: <Zap size={20} /> },
  { id: 'data', label: 'Data Hub', icon: <Database size={20} /> },
  { id: 'security', label: 'Security', icon: <Shield size={20} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
];

const STATS = [
  { label: 'Active Nodes', value: '12', trend: '+2', icon: <Cpu className="text-blue-600" /> },
  { label: 'Success Rate', value: '99.9%', trend: 'Stable', icon: <Activity className="text-emerald-600" /> },
  { label: 'Tokens / Day', value: '4.2M', trend: '+12%', icon: <TrendingUp className="text-purple-600" /> },
];

const SERVICES = [
  { 
    title: 'Neural Workflows', 
    desc: 'Autonomous agent swarms for complex logic.', 
    status: 'Active', 
    color: 'bg-blue-600',
    icon: <Zap className="text-white size-5" />
  },
  { 
    title: 'Data Ingestion', 
    desc: 'Real-time pipeline monitoring and cleaning.', 
    status: 'Healthy', 
    color: 'bg-emerald-600',
    icon: <Database className="text-white size-5" />
  },
  { 
    title: 'Compliance Audit', 
    desc: 'Automated security and privacy validation.', 
    status: 'Updating', 
    color: 'bg-purple-600',
    icon: <Shield className="text-white size-5" />
  }
];

// --- Dashboard Sub-Views ---

const OverviewView = () => (
  <div className="space-y-10">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {STATS.map((stat, idx) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="size-10 rounded-xl bg-slate-50 flex items-center justify-center">
              {stat.icon}
            </div>
            <Badge variant="blue" className="text-[10px]">{stat.trend}</Badge>
          </div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</div>
          <div className="text-2xl font-black text-slate-900">{stat.value}</div>
        </motion.div>
      ))}
    </div>

    <section>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Accessed Services</h2>
        <Button variant="ghost" size="sm" className="text-blue-600 gap-2 font-bold">
          View All <ChevronRight size={16} />
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SERVICES.map((service, idx) => (
          <div key={service.title} className="group bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer">
            <div className={cn("size-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg", service.color)}>
              {service.icon}
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{service.title}</h3>
            <p className="text-sm text-slate-500 font-medium mb-6 leading-relaxed">{service.desc}</p>
            <div className="flex justify-between items-center">
              <Badge variant="outline" className="text-[10px] bg-slate-50">{service.status}</Badge>
              <ArrowUpRight className="text-slate-300 group-hover:text-blue-600 transition-colors" size={20} />
            </div>
          </div>
        ))}
        <button className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl p-6 text-slate-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all group">
          <div className="size-12 rounded-full border-2 border-slate-200 flex items-center justify-center mb-4 group-hover:border-blue-400">
            <Plus size={24} />
          </div>
          <span className="text-sm font-bold uppercase tracking-widest">Add Service</span>
        </button>
      </div>
    </section>
  </div>
);

const NodesView = () => (
  <div className="space-y-8">
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Active Neural Nodes</h2>
      <Button className="gap-2 rounded-xl">
        <Plus size={18} /> Deploy New Node
      </Button>
    </div>
    <div className="grid gap-4">
      {[
        { name: "Node-Alpha-01", model: "Gemini 3 Pro", load: "42%", uptime: "14d 2h", status: "Running" },
        { name: "Node-Alpha-02", model: "Gemini 3 Pro", load: "12%", uptime: "14d 2h", status: "Idle" },
        { name: "Vision-Cluster-A", model: "Gemini 3 Pro Vision", load: "88%", uptime: "2d 5h", status: "Running" },
        { name: "Agent-Swarm-X", model: "Gemini 3 Flash", load: "5%", uptime: "0h 45m", status: "Booting" }
      ].map((node) => (
        <div key={node.name} className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center justify-between hover:border-blue-200 transition-colors shadow-sm">
          <div className="flex items-center gap-4">
            <div className={cn("size-3 rounded-full", node.status === 'Running' ? 'bg-emerald-500 animate-pulse' : node.status === 'Booting' ? 'bg-blue-500' : 'bg-slate-300')} />
            <div>
              <div className="font-bold text-slate-900">{node.name}</div>
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">{node.model}</div>
            </div>
          </div>
          <div className="flex items-center gap-12 text-right">
            <div>
              <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1">Load</div>
              <div className="text-sm font-bold text-slate-600">{node.load}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1">Uptime</div>
              <div className="text-sm font-bold text-slate-600">{node.uptime}</div>
            </div>
            <Button variant="ghost" size="icon" className="text-slate-400">
              <Settings size={18} />
            </Button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const DataHubView = () => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-slate-900 uppercase tracking-tight">Ingestion Pipeline</h3>
          <Badge variant="blue">98.4% Efficiency</Badge>
        </div>
        <div className="space-y-4">
          {[
            { label: 'Salesforce Sync', progress: 100 },
            { label: 'Cloud Storage Bucket-A', progress: 100 },
            { label: 'Real-time Webhook Stream', progress: 45 },
            { label: 'Legacy DB Migration', progress: 12 },
          ].map((item) => (
            <div key={item.label} className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
                <span>{item.label}</span>
                <span>{item.progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${item.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-slate-900 text-white p-8 rounded-[2rem] border border-slate-800 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Database size={120} />
        </div>
        <h3 className="font-bold uppercase tracking-tight mb-2">Storage Capacity</h3>
        <p className="text-slate-400 text-sm mb-8">Aggregated enterprise storage nodes.</p>
        <div className="text-4xl font-black mb-2">12.4 TB</div>
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400 mb-8">84% of 15.0 TB utilized</div>
        <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 h-12 rounded-xl font-bold uppercase tracking-widest text-xs">
          Expand Storage
        </Button>
      </div>
    </div>
  </div>
);

const SecurityView = () => (
  <div className="space-y-8">
    <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl flex items-center gap-4">
      <div className="size-12 rounded-full bg-emerald-500 flex items-center justify-center text-white">
        <Shield size={24} />
      </div>
      <div>
        <h3 className="font-bold text-emerald-900">System Shield Active</h3>
        <p className="text-sm text-emerald-700 font-medium">No threats detected in the last 72 hours. Neural firewall is optimized.</p>
      </div>
    </div>
    <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
      <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <h3 className="font-bold text-slate-900 uppercase tracking-tight">Access Logs</h3>
        <Button variant="outline" size="sm" className="gap-2 h-9 rounded-full font-bold uppercase tracking-widest text-[10px]">
          <RefreshCw size={12} /> Refresh Logs
        </Button>
      </div>
      <div className="divide-y divide-slate-50">
        {[
          { event: "Authorized login via Google OAuth", user: "atom@volosist.ai", location: "San Francisco, US", time: "2m ago", status: "Success" },
          { event: "Node Alpha-01 policy update", user: "System System", location: "Internal Node", time: "45m ago", status: "Success" },
          { event: "Suspicious API pattern detected", user: "Unknown (192.168.1.1)", location: "Dublin, IE", time: "4h ago", status: "Blocked" },
          { event: "VPC Tunnel Established", user: "Enterprise Bridge", location: "Cloud Core", time: "12h ago", status: "Success" }
        ].map((log, i) => (
          <div key={i} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
            <div className="flex gap-4 items-center">
              <div className={cn("size-2 rounded-full", log.status === 'Success' ? 'bg-emerald-500' : 'bg-red-500')} />
              <div>
                <div className="text-sm font-bold text-slate-900">{log.event}</div>
                <div className="text-xs text-slate-400 font-medium">{log.user} • {log.location}</div>
              </div>
            </div>
            <div className="text-xs font-bold text-slate-300 uppercase tracking-widest">{log.time}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const SettingsView = ({ user }: { user: any }) => (
  <div className="max-w-3xl space-y-10">
    <section>
      <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight mb-6">Profile Settings</h3>
      <div className="grid gap-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">First Name</label>
            <Input defaultValue={user?.user_metadata?.first_name} leftIcon={<User />} />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Last Name</label>
            <Input defaultValue={user?.user_metadata?.last_name} leftIcon={<User />} />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Work Email</label>
          <Input defaultValue={user?.email} disabled leftIcon={<Lock />} />
        </div>
        <Button className="w-fit px-8 h-12 rounded-xl">Save Changes</Button>
      </div>
    </section>

    <div className="h-px w-full bg-slate-100" />

    <section>
      <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight mb-6">Security & Keys</h3>
      <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="size-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600">
            <Key size={20} />
          </div>
          <div>
            <div className="font-bold text-slate-900">API Credentials</div>
            <div className="text-xs text-slate-400 font-medium">Manage project-level access keys.</div>
          </div>
        </div>
        <Button variant="outline" className="h-10 rounded-lg font-bold">Manage Keys</Button>
      </div>
    </section>
  </div>
);

export function DashboardPage({ user, onNavigate, onSignOut }: DashboardPageProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const firstName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'User';

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewView />;
      case 'nodes': return <NodesView />;
      case 'data': return <DataHubView />;
      case 'security': return <SecurityView />;
      case 'settings': return <SettingsView user={user} />;
      default: return <OverviewView />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed inset-y-0 z-50">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="size-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">V</div>
          <span className="font-bold text-slate-900 tracking-tight">VOLOSIST OS</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {SIDEBAR_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                activeTab === item.id 
                  ? "bg-blue-50 text-blue-600 shadow-sm" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <div className={cn(
                "size-8 rounded-lg flex items-center justify-center transition-colors",
                activeTab === item.id ? "bg-blue-600 text-white" : "bg-slate-50 text-slate-400 group-hover:text-slate-600"
              )}>
                {item.icon}
              </div>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={onSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all"
          >
            <div className="size-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
              <LogOut size={20} />
            </div>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 lg:p-12 overflow-y-auto max-h-screen">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
              {activeTab.replace('-', ' ')}
            </h1>
            <p className="text-slate-500 font-medium">Monitoring your autonomous ecosystem.</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden xl:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
              <input 
                type="text" 
                placeholder="Search resources..." 
                className="bg-white border border-slate-200 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 w-64 transition-all"
              />
            </div>
            <button className="relative size-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-all">
              <Bell size={18} />
              <span className="absolute top-2.5 right-2.5 size-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="h-10 px-4 rounded-full bg-white border border-slate-200 flex items-center gap-3">
              <div className="size-6 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-[10px]">
                {firstName[0]}
              </div>
              <span className="text-xs font-bold text-slate-900">{firstName}</span>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
