import React from 'react';
import { User, CreditCard, Building2, Users2, Bell, Globe, ChevronRight, Camera, Check, Plus, X, Download, ExternalLink, Bot, FileText, MessageSquare, Zap, Save, Loader2 } from 'lucide-react';

const tabs = [
  { id: 'account', name: 'Account', icon: User },
  { id: 'billing', name: 'Billing', icon: CreditCard },
  { id: 'team', name: 'Team', icon: Users2 },
  { id: 'company', name: 'Company', icon: Building2 },
];

function Settings(): React.ReactElement {
  const [activeTab, setActiveTab] = React.useState('account');
  const [isEditingProfile, setIsEditingProfile] = React.useState(false);
  const [profileData, setProfileData] = React.useState({
    name: 'Ahmed Hassan',
    email: 'ahmed@example.com',
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

  const handleSave = async (section: string) => {
    setIsSaving(prev => ({ ...prev, [section]: true }));
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(prev => ({ ...prev, [section]: false }));
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
                src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg"
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
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900">Current Plan</h3>
          <p className="text-sm text-gray-500 mt-1">You are currently on the Pro plan.</p>
        </div>
        
        <div className="border-t border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-medium text-gray-900">Pro Plan</h4>
              <p className="text-sm text-gray-500 mt-1">For enterprises requiring maximum capability and control.</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">$99</p>
              <p className="text-sm text-gray-500">per month</p>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Usage this month</span>
              <span className="text-sm text-gray-500">65%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-[#4A154B] h-2 rounded-full"
                style={{ width: '65%' }}
              />
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Agents</p>
              <p className="text-lg font-medium text-gray-900">Unlimited</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Messages</p>
              <p className="text-lg font-medium text-gray-900">1,000,000/month</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Storage</p>
              <p className="text-lg font-medium text-gray-900">100GB</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Support</p>
              <p className="text-lg font-medium text-gray-900">24/7</p>
            </div>
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
            {[
              { id: 'INV-001', date: '2024-03-01', amount: '$99.00', status: 'Paid' },
              { id: 'INV-002', date: '2024-02-01', amount: '$99.00', status: 'Paid' },
              { id: 'INV-003', date: '2024-01-01', amount: '$99.00', status: 'Paid' },
            ].map((invoice) => (
              <div key={invoice.id} className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Invoice {invoice.id}</p>
                  <p className="text-sm text-gray-500">{invoice.date}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-900">{invoice.amount}</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    invoice.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {invoice.status}
                  </span>
                  <button className="text-[#4A154B] hover:text-[#611f69]">
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
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