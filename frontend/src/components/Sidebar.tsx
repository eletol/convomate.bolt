import React, { useEffect, useState } from 'react';
import { LayoutDashboard, Users, Plug, HelpCircle, Settings, LogOut, Bot, MessageSquare, HardDrive, FileText } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/auth';
import { User } from 'firebase/auth';
import { auth } from '../config/firebase';
import { API_ENDPOINTS } from '../config/constants';

const navigation = [
  { name: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
  { name: 'Agents', icon: Users, path: '/dashboard/agents' },
  { name: 'Integrations', icon: Plug, path: '/dashboard/integrations' },
  { name: 'Help', icon: HelpCircle, path: '/dashboard/help' },
  { name: 'Settings', icon: Settings, path: '/dashboard/settings' },
];

interface PlanLimits {
  agents: string;
  messages: string;
  storage_gb: string;
  support_24_7: boolean;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  limits: PlanLimits;
}

interface Usage {
  agents: number;
  messages: number;
  storage_gb: number;
}

interface Remaining {
  agents: number;
  messages: number;
  storage_gb: number;
}

interface PlanResponse {
  plan: Plan;
  usage: Usage;
  remaining: Remaining;
}

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

function Sidebar({ activeTab, setActiveTab }: SidebarProps): React.ReactElement {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [planData, setPlanData] = useState<PlanResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set initial user state
    setUser(authService.getCurrentUser());

    // Subscribe to auth state changes
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setUser(user);
    });

    // Cleanup subscription on unmount
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    const fetchPlanData = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/plan`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch plan data');
        }

        const data = await response.json();
        setPlanData(data);
      } catch (error) {
        console.error('Error fetching plan data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchPlanData();
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await authService.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleNavigation = (name: string) => {
    setActiveTab(name);
  };

  const getUserInitials = (displayName: string | null | undefined) => {
    if (!displayName) return '?';
    return displayName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const calculatePercentage = (used: number, total: number) => {
    return Math.min(Math.round((used / total) * 100), 100);
  };

  const handleUpgrade = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(API_ENDPOINTS.SUBSCRIPTION, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ customer_email: user?.email }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Failed to start upgrade process.');
      }
    } catch (error) {
      alert('Failed to start upgrade process.');
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-[#4A154B]">Convomate</h1>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            onClick={() => handleNavigation(item.name)}
            className={`flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-lg ${
              activeTab === item.name
                ? 'bg-[#4A154B]/10 text-[#4A154B]'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="p-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          {isLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-2 bg-gray-200 rounded-full"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ) : planData ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">
                  {planData.plan.name} Plan
                </h3>
                <p className="text-xs text-gray-500">
                  {planData.plan.price === 0 ? 'Free Plan' : `$${planData.plan.price}/month`}
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-500">Agents</span>
                    <span className="text-gray-900">{planData.usage.agents} / {planData.plan.limits.agents}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#4A154B] rounded-full"
                      style={{ width: `${calculatePercentage(planData.usage.agents, parseInt(planData.plan.limits.agents))}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-500">Messages</span>
                    <span className="text-gray-900">{planData.usage.messages} / {planData.plan.limits.messages}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#4A154B] rounded-full"
                      style={{ width: `${calculatePercentage(planData.usage.messages, parseInt(planData.plan.limits.messages))}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-[#4A154B]" />
                      <span className="text-gray-500">Storage</span>
                    </span>
                    <span className="text-gray-900">{Math.round(planData.usage.storage_gb || 0)}GB / {planData.plan.limits.storage_gb}GB</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#4A154B] rounded-full"
                      style={{ width: `${calculatePercentage(planData.usage.storage_gb, parseFloat(planData.plan.limits.storage_gb))}%` }}
                    />
                  </div>
                </div>
              </div>

              {planData.plan.limits.support_24_7 && (
                <div className="mt-2 text-xs text-green-600">
                  ✓ 24/7 Support included
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-red-600">
              Failed to load plan data
            </div>
          )}
        </div>
        <button
          className="mt-4 w-full bg-[#4A154B] text-white py-2 rounded-lg font-medium hover:bg-[#611f69] transition"
          onClick={handleUpgrade}
        >
          Upgrade
        </button>
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 px-4 py-2">
          {user?.photoURL ? (
            <img 
              src={user.photoURL} 
              alt={user.displayName || 'User'} 
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#4A154B] flex items-center justify-center text-white font-medium overflow-hidden flex-shrink-0">
              {getUserInitials(user?.displayName)}
            </div>
          )}
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              {user?.displayName || 'User'}
            </p>
            <p className="text-xs text-gray-500">
              {user?.email || 'No email'}
            </p>
          </div>
          <button 
            onClick={handleLogout}
            className="text-gray-400 hover:text-gray-500"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;