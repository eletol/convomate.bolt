import React, { useEffect, useState } from 'react';
import { User, CreditCard, Building2, Users2, Bell, Globe, ChevronRight, Camera, Check, Plus, X, Download, ExternalLink, Bot, FileText, MessageSquare, Zap, Save, Loader2 } from 'lucide-react';
import { auth } from '../config/firebase';
import { updateProfile, updateEmail } from 'firebase/auth';
import { API_ENDPOINTS } from '../config/constants';

const tabs = [
  { id: 'account', name: 'Account', icon: User },
  { id: 'billing', name: 'Billing', icon: CreditCard },
  { id: 'team', name: 'Team', icon: Users2 },
  { id: 'company', name: 'Company', icon: Building2 },
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

function Settings(): React.ReactElement {
  const [activeTab, setActiveTab] = React.useState('account');
  const [isEditingProfile, setIsEditingProfile] = React.useState(false);
  const [profileData, setProfileData] = React.useState({
    name: '',
    email: '',
    language: 'English',
    timezone: 'UTC+2 Cairo',
    notifications: {
      email: true,
      slack: true,
      desktop: false,
    }
  });

  const [isSaving, setIsSaving] = React.useState<{[key: string]: boolean}>({
    companyInfo: false,
    branding: false,
    retention: false
  });

  const [planData, setPlanData] = useState<PlanResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isUpdating, setIsUpdating] = React.useState(false);
  const [updateError, setUpdateError] = React.useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = React.useState(false);

  const [invoices, setInvoices] = useState<any[]>([]);
  const [isInvoicesLoading, setIsInvoicesLoading] = useState(false);
  const [subscriptionActionLoading, setSubscriptionActionLoading] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);

  // Move fetchPlanData outside useEffect so it can be reused
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

  useEffect(() => {
    fetchPlanData();
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setProfileData(prev => ({
        ...prev,
        name: user.displayName || '',
        email: user.email || '',
      }));
    }
  }, []);

  const handleProfileUpdate = async () => {
    setIsUpdating(true);
    setUpdateError(null);
    setUpdateSuccess(false);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user logged in');
      }

      // Update display name
      await updateProfile(user, {
        displayName: profileData.name
      });

      // Update email if changed
      if (user.email !== profileData.email) {
        await updateEmail(user, profileData.email);
      }

      setUpdateSuccess(true);
    } catch (error) {
      console.error('Error updating profile:', error);
      setUpdateError(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSave = async (section: string) => {
    setIsSaving(prev => ({ ...prev, [section]: true }));
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(prev => ({ ...prev, [section]: false }));
  };

  const fetchInvoices = async () => {
    setIsInvoicesLoading(true);
    setSubscriptionError(null);
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(API_ENDPOINTS.INVOICES, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      setInvoices(data.invoices || []);
    } catch (error) {
      setSubscriptionError('Failed to load invoices.');
    } finally {
      setIsInvoicesLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'billing') {
      fetchInvoices();
    }
  }, [activeTab]);

  const handleUpgrade = async () => {
    setSubscriptionActionLoading(true);
    setSubscriptionError(null);
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(API_ENDPOINTS.SUBSCRIPTION, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ customer_email: auth.currentUser?.email }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setSubscriptionError('Failed to start upgrade process.');
      }
    } catch (error) {
      setSubscriptionError('Failed to start upgrade process.');
    } finally {
      setSubscriptionActionLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setSubscriptionActionLoading(true);
    setSubscriptionError(null);
    try {
      const token = await auth.currentUser?.getIdToken();
      await fetch(API_ENDPOINTS.CANCEL_SUBSCRIPTION, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      fetchPlanData();
    } catch (error) {
      setSubscriptionError('Failed to cancel subscription.');
    } finally {
      setSubscriptionActionLoading(false);
    }
  };

  const handleResumeSubscription = async () => {
    setSubscriptionActionLoading(true);
    setSubscriptionError(null);
    try {
      const token = await auth.currentUser?.getIdToken();
      await fetch(API_ENDPOINTS.RESUME_SUBSCRIPTION, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      fetchPlanData();
    } catch (error) {
      setSubscriptionError('Failed to resume subscription.');
    } finally {
      setSubscriptionActionLoading(false);
    }
  };

  const handleUpdatePaymentMethod = async () => {
    setSubscriptionActionLoading(true);
    setSubscriptionError(null);
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(API_ENDPOINTS.PAYMENT_METHOD, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      setSubscriptionError('Failed to update payment method.');
    } finally {
      setSubscriptionActionLoading(false);
    }
  };

  const renderAccountTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900">Profile Information</h3>
          <p className="text-sm text-gray-500 mt-1">Update your personal information and preferences.</p>
        </div>
        
        <div className="border-t border-gray-200 p-6">
          <div className="flex items-start space-x-4">
            <div className="relative">
              <img
                src={auth.currentUser?.photoURL || "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg"}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover"
              />
              <button className="absolute bottom-0 right-0 p-1 bg-white rounded-full border border-gray-200 shadow-sm hover:bg-gray-50">
                <Camera className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#4A154B] focus:ring-[#4A154B]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#4A154B] focus:ring-[#4A154B]"
                />
              </div>

              {updateError && (
                <div className="text-sm text-red-600">
                  {updateError}
                </div>
              )}

              {updateSuccess && (
                <div className="text-sm text-green-600">
                  Profile updated successfully
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={handleProfileUpdate}
                  disabled={isUpdating}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#4A154B] rounded-lg hover:bg-[#611f69] flex items-center"
                >
                  {isUpdating ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5 mr-2" />
                  )}
                  {isUpdating ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900">Preferences</h3>
          <p className="text-sm text-gray-500 mt-1">Manage your language and regional settings.</p>
        </div>
        
        <div className="border-t border-gray-200">
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Language</label>
              <select
                value={profileData.language}
                onChange={(e) => setProfileData({ ...profileData, language: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#4A154B] focus:ring-[#4A154B]"
              >
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
                <option>Arabic</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Timezone</label>
              <select
                value={profileData.timezone}
                onChange={(e) => setProfileData({ ...profileData, timezone: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#4A154B] focus:ring-[#4A154B]"
              >
                <option>UTC+2 Cairo</option>
                <option>UTC+0 London</option>
                <option>UTC-5 New York</option>
                <option>UTC-8 San Francisco</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
          <p className="text-sm text-gray-500 mt-1">Choose how you want to receive notifications.</p>
        </div>
        
        <div className="border-t border-gray-200">
          <div className="p-6 space-y-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={profileData.notifications.email}
                onChange={(e) => setProfileData({
                  ...profileData,
                  notifications: {
                    ...profileData.notifications,
                    email: e.target.checked
                  }
                })}
                className="rounded border-gray-300 text-[#4A154B] focus:ring-[#4A154B]"
              />
              <span className="text-sm text-gray-700">Email notifications</span>
            </label>
            
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={profileData.notifications.slack}
                onChange={(e) => setProfileData({
                  ...profileData,
                  notifications: {
                    ...profileData.notifications,
                    slack: e.target.checked
                  }
                })}
                className="rounded border-gray-300 text-[#4A154B] focus:ring-[#4A154B]"
              />
              <span className="text-sm text-gray-700">Slack notifications</span>
            </label>
            
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={profileData.notifications.desktop}
                onChange={(e) => setProfileData({
                  ...profileData,
                  notifications: {
                    ...profileData.notifications,
                    desktop: e.target.checked
                  }
                })}
                className="rounded border-gray-300 text-[#4A154B] focus:ring-[#4A154B]"
              />
              <span className="text-sm text-gray-700">Desktop notifications</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBillingTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex-1 mr-4">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900">Current Plan</h3>
            <p className="text-sm text-gray-500 mt-1">
              {isLoading ? 'Loading plan information...' : `You are currently on the ${planData?.plan.name} plan.`}
            </p>
          </div>
          <div className="border-t border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-medium text-gray-900">{isLoading ? '...' : planData?.plan.name} Plan</h4>
                <p className="text-sm text-gray-500 mt-1">
                  {isLoading ? '...' : planData?.plan.price === 0 ? 'Free plan with basic features' : 'For enterprises requiring maximum capability and control.'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? '...' : planData?.plan.price === 0 ? 'Free' : `$${planData?.plan.price}`}
                </p>
                <p className="text-sm text-gray-500">per month</p>
              </div>
            </div>
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Usage this month</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    isLoading ? 'bg-[#4A154B]' :
                    ((planData?.usage.messages || 0) / parseInt(planData?.plan.limits.messages || '1')) > 0.9
                      ? 'bg-red-500'
                      : ((planData?.usage.messages || 0) / parseInt(planData?.plan.limits.messages || '1')) > 0.75
                        ? 'bg-yellow-500'
                        : 'bg-[#4A154B]'
                  }`}
                  style={{
                    width: isLoading ? '65%' :
                      `${Math.min(
                        ((planData?.usage.messages || 0) / parseInt(planData?.plan.limits.messages || '1')) * 100,
                        100
                      )}%`
                  }}
                />
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Agents</p>
                <p className="text-lg font-medium text-gray-900">
                  {isLoading ? '...' : `${planData?.usage.agents} / ${planData?.plan.limits.agents}`}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Messages</p>
                <p className="text-lg font-medium text-gray-900">
                  {isLoading ? '...' : `${(planData?.usage.messages || 0).toLocaleString()} / ${parseInt(planData?.plan.limits.messages || '0').toLocaleString()}`}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Storage</p>
                <p className="text-lg font-medium text-gray-900">
                  {isLoading ? '...' : `${Math.round(planData?.usage.storage_gb || 0)}GB / ${planData?.plan.limits.storage_gb}GB`}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Support</p>
                <p className="text-lg font-medium text-gray-900">
                  {isLoading ? '...' : planData?.plan.limits.support_24_7 ? '24/7' : 'Email'}
                </p>
              </div>
            </div>
            <div className="mt-6 flex space-x-2">
              <button
                className="bg-[#4A154B] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#611f69] transition"
                onClick={handleUpgrade}
                disabled={subscriptionActionLoading}
              >
                {subscriptionActionLoading ? 'Processing...' : 'Upgrade'}
              </button>
              <button
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
                onClick={handleUpdatePaymentMethod}
                disabled={subscriptionActionLoading}
              >
                Update Payment Method
              </button>
              <button
                className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg font-medium hover:bg-yellow-200 transition"
                onClick={handleResumeSubscription}
                disabled={subscriptionActionLoading}
              >
                Resume Subscription
              </button>
              <button
                className="bg-red-100 text-red-800 px-4 py-2 rounded-lg font-medium hover:bg-red-200 transition"
                onClick={handleCancelSubscription}
                disabled={subscriptionActionLoading}
              >
                Cancel Subscription
              </button>
            </div>
            {subscriptionError && (
              <div className="text-sm text-red-600 mt-2">{subscriptionError}</div>
            )}
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900">Billing History</h3>
          <p className="text-sm text-gray-500 mt-1">View your past invoices and payments.</p>
        </div>
        <div className="border-t border-gray-200">
          <div className="divide-y divide-gray-200">
            {isInvoicesLoading ? (
              <div className="p-6">Loading invoices...</div>
            ) : invoices.length === 0 ? (
              <div className="p-6">No invoices found.</div>
            ) : (
              invoices.map((invoice) => (
                <div key={invoice.id} className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Invoice {invoice.id}</p>
                    <p className="text-sm text-gray-500">{new Date(invoice.created * 1000).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-900">${(invoice.amount_due / 100).toFixed(2)}</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                    {invoice.invoice_pdf && (
                      <a href={invoice.invoice_pdf} target="_blank" rel="noopener noreferrer" className="text-[#4A154B] hover:text-[#611f69]">
                        <Download className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTeamTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Team Members</h3>
              <p className="text-sm text-gray-500 mt-1">Manage your team members and their roles.</p>
            </div>
            <button className="px-4 py-2 text-sm font-medium text-white bg-[#4A154B] rounded-lg hover:bg-[#611f69] flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Add Member
            </button>
          </div>
        </div>
        
        <div className="border-t border-gray-200">
          <div className="divide-y divide-gray-200">
            {[
              { id: '1', name: 'Sarah Wilson', email: 'sarah@example.com', role: 'Admin', avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg' },
              { id: '2', name: 'Michael Chen', email: 'michael@example.com', role: 'Member', avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg' },
              { id: '3', name: 'Emma Davis', email: 'emma@example.com', role: 'Member', avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg' },
            ].map((member) => (
              <div key={member.id} className="p-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    member.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {member.role}
                  </span>
                  <button className="text-gray-400 hover:text-gray-500">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCompanyTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900">Company Information</h3>
          <p className="text-sm text-gray-500 mt-1">Update your company details and branding.</p>
        </div>
        
        <div className="border-t border-gray-200 p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Company Name</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#4A154B] focus:ring-[#4A154B]"
                placeholder="Enter company name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Website</label>
              <input
                type="url"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#4A154B] focus:ring-[#4A154B]"
                placeholder="https://example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Industry</label>
              <select className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#4A154B] focus:ring-[#4A154B]">
                <option>Technology</option>
                <option>Healthcare</option>
                <option>Finance</option>
                <option>Education</option>
                <option>Other</option>
              </select>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => handleSave('companyInfo')}
              className="px-4 py-2 text-sm font-medium text-white bg-[#4A154B] rounded-lg hover:bg-[#611f69] flex items-center"
              disabled={isSaving.companyInfo}
            >
              {isSaving.companyInfo ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Save className="w-5 h-5 mr-2" />
              )}
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'account':
        return renderAccountTab();
      case 'billing':
        return renderBillingTab();
      case 'team':
        return renderTeamTab();
      case 'company':
        return renderCompanyTab();
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Settings</h2>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-[#4A154B] text-[#4A154B]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default Settings;