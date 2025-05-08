import React from 'react';
import { User, CreditCard, Building2, Users2, Bell, Globe, ChevronRight, Camera, Check, Plus, X, Download, ExternalLink, Bot, FileText, MessageSquare, Zap, Save, Loader2 } from 'lucide-react';

const plans = {
  free: {
    name: 'Free',
    price: '$0',
    period: 'month',
    description: 'Perfect for individuals and small teams getting started',
    features: [
      '1 Agent',
      '1,000 messages/month',
      '1GB storage',
      'Basic email support',
      'Standard response time',
      'Community access'
    ],
    limits: {
      agents: 1,
      messages: 1000,
      storage: '1GB',
      support: 'Email'
    }
  },
  starter: {
    name: 'Starter',
    price: '$29',
    period: 'month',
    description: 'Great for growing teams with more automation needs',
    features: [
      '5 Agents',
      '100,000 messages/month',
      '10GB storage',
      'Priority email support',
      'Custom agent instructions',
      'Advanced analytics',
      'API access'
    ],
    limits: {
      agents: 5,
      messages: 100000,
      storage: '10GB',
      support: 'Priority'
    }
  },
  pro: {
    name: 'Pro',
    price: '$99',
    period: 'month',
    description: 'For enterprises requiring maximum capability and control',
    features: [
      'Unlimited Agents',
      '1,000,000 messages/month',
      '100GB storage',
      '24/7 priority support',
      'Custom integrations',
      'Advanced security features',
      'Dedicated account manager',
      'Custom AI model training',
      'SSO & advanced auth'
    ],
    limits: {
      agents: 'Unlimited',
      messages: 1000000,
      storage: '100GB',
      support: '24/7'
    }
  }
};

const currentPlan = 'pro';
const daysRemaining = 12;
const currentUsage = 65;

const mockInvoices = [
  { id: 'INV-001', date: '2024-03-01', amount: '$99.00', status: 'Paid' },
  { id: 'INV-002', date: '2024-02-01', amount: '$99.00', status: 'Paid' },
  { id: 'INV-003', date: '2024-01-01', amount: '$99.00', status: 'Paid' },
];

const mockTeamMembers = [
  { id: '1', name: 'Sarah Wilson', email: 'sarah@example.com', role: 'Admin', avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg' },
  { id: '2', name: 'Michael Chen', email: 'michael@example.com', role: 'Member', avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg' },
  { id: '3', name: 'Emma Davis', email: 'emma@example.com', role: 'Member', avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg' },
];

const tabs = [
  { id: 'account', name: 'Account', icon: User },
  { id: 'billing', name: 'Billing', icon: CreditCard },
  { id: 'team', name: 'Team', icon: Users2 },
  { id: 'company', name: 'Company', icon: Building2 },
];

function Settings() {
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
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Current Plan</h3>
              <p className="text-sm text-gray-500 mt-1">You are currently on the {plans[currentPlan].name} plan.</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-semibold text-gray-900">
                {plans[currentPlan].price}
                <span className="text-sm text-gray-500">/{plans[currentPlan].period}</span>
              </p>
              <p className="text-sm text-gray-500 mt-1">{daysRemaining} days remaining</p>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Usage this month</span>
              <span className="text-gray-900">{currentUsage}% of allocation</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${
                  currentUsage > 90 ? 'bg-red-500' : currentUsage > 75 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${currentUsage}%` }}
              />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-[#4A154B]" />
                <span className="text-sm text-gray-500">Agents</span>
              </div>
              <p className="mt-2 text-2xl font-semibold text-gray-900">3</p>
              <p className="text-sm text-gray-500">of {plans[currentPlan].limits.agents}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-[#4A154B]" />
                <span className="text-sm text-gray-500">Messages</span>
              </div>
              <p className="mt-2 text-2xl font-semibold text-gray-900">650,000</p>
              <p className="text-sm text-gray-500">of {plans[currentPlan].limits.messages.toLocaleString()}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-[#4A154B]" />
                <span className="text-sm text-gray-500">Storage</span>
              </div>
              <p className="mt-2 text-2xl font-semibold text-gray-900">65GB</p>
              <p className="text-sm text-gray-500">of {plans[currentPlan].limits.storage}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-[#4A154B]" />
                <span className="text-sm text-gray-500">Support</span>
              </div>
              <p className="mt-2 text-lg font-semibold text-gray-900">{plans[currentPlan].limits.support}</p>
              <p className="text-sm text-gray-500">support level</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {Object.entries(plans).map(([id, plan]) => (
              <div
                key={id}
                className={`rounded-lg border p-6 ${
                  id === currentPlan
                    ? 'border-[#4A154B] bg-[#4A154B]/5'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{plan.name}</h4>
                    <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                    <p className="text-2xl font-semibold text-gray-900 mt-2">
                      {plan.price}<span className="text-sm text-gray-500">/{plan.period}</span>
                    </p>
                  </div>
                  {id === currentPlan && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#4A154B] text-white">
                      Current Plan
                    </span>
                  )}
                </div>
                
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-700">
                      <Check className="w-5 h-5 text-[#4A154B] mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <button
                  className={`mt-6 w-full px-4 py-2 text-sm font-medium rounded-lg ${
                    id === currentPlan
                      ? 'text-[#4A154B] bg-white border border-[#4A154B] hover:bg-[#4A154B]/5'
                      : 'text-white bg-[#4A154B] hover:bg-[#611f69]'
                  }`}
                >
                  {id === currentPlan ? 'Current Plan' : id === 'free' ? 'Downgrade' : 'Upgrade'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900">Payment Method</h3>
          <p className="text-sm text-gray-500 mt-1">Manage your payment information and billing details.</p>
        </div>
        
        <div className="border-t border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700">VISA</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">•••• 4242</p>
                  <p className="text-xs text-gray-500">Expires 12/24</p>
                </div>
              </div>
              <button className="text-sm text-[#4A154B] hover:text-[#611f69]">
                Update
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900">Billing History</h3>
          <p className="text-sm text-gray-500 mt-1">View and download your previous invoices.</p>
        </div>
        
        <div className="border-t border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mockInvoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="px-6 py-4 text-sm text-gray-900">{invoice.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{invoice.date}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{invoice.amount}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-[#4A154B] hover:text-[#611f69]">
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTeamTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Team Members</h3>
              <p className="text-sm text-gray-500 mt-1">Manage your team members and their roles.</p>
            </div>
            <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-[#4A154B] rounded-lg hover:bg-[#611f69]">
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </button>
          </div>
        </div>
        
        <div className="border-t border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Active</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mockTeamMembers.map((member) => (
                  <tr key={member.id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{member.name}</p>
                          <p className="text-sm text-gray-500">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        member.role === 'Admin' 
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      2 hours ago
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 hover:text-gray-500">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900">Pending Invitations</h3>
          <p className="text-sm text-gray-500 mt-1">Track and manage team invitations.</p>
        </div>
        
        <div className="border-t border-gray-200 p-6">
          <div className="text-center text-sm text-gray-500 py-6">
            No pending invitations
          </div>
        </div>
      </div>
    </div>
  );

  const renderCompanyTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900">Company Information</h3>
          <p className="text-sm text-gray-500 mt-1">Manage your company details and branding.</p>
        </div>
        
        <div className="border-t border-gray-200 p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Company Name</label>
            <input
              type="text"
              defaultValue="Acme Corp"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#4A154B] focus:ring-[#4A154B]"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Website</label>
            <input
              type="url"
              defaultValue="https://acme.com"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#4A154B] focus:ring-[#4A154B]"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Industry</label>
            <select
              defaultValue="technology"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#4A154B] focus:ring-[#4A154B]"
            >
              <option value="technology">Technology</option>
              <option value="finance">Finance</option>
              <option value="healthcare">Healthcare</option>
              <option value="education">Education</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => handleSave('companyInfo')}
              disabled={isSaving.companyInfo}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-[#4A154B] rounded-lg hover:bg-[#611f69] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving.companyInfo ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900">Branding</h3>
          <p className="text-sm text-gray-500 mt-1">Customize your company's branding.</p>
        </div>
        
        <div className="border-t border-gray-200 p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Company Logo</label>
            <div className="mt-2 flex items-center space-x-4">
              <img
                src="https://via.placeholder.com/100"
                alt="Company logo"
                className="w-16 h-16 rounded object-contain bg-gray-100"
              />
              <button className="px-4 py-2 text-sm font-medium text-[#4A154B] bg-white border border-[#4A154B] rounded-lg hover:bg-[#4A154B]/5">
                Change Logo
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Brand Color</label>
            <div className="mt-2 flex items-center space-x-4">
              <input
                type="color"
                defaultValue="#4A154B"
                className="w-16 h-8 rounded border border-gray-300"
              />
              <input
                type="text"
                defaultValue="#4A154B"
                className="w-32 rounded-lg border border-gray-300 px-4 py-2 focus:border-[#4A154B] focus:ring-[#4A154B]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => handleSave('branding')}
              disabled={isSaving.branding}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-[#4A154B] rounded-lg hover:bg-[#611f69] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving.branding ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900">Data Retention</h3>
          <p className="text-sm text-gray-500 mt-1">Configure your data retention policies.</p>
        </div>
        
        <div className="border-t border-gray-200 p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Message Retention</label>
            <select
              defaultValue="90"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#4A154B] focus:ring-[#4A154B]"
            >
              <option value="30">30 days</option>
              <option value="60">60 days</option>
              <option value="90">90 days</option>
              <option value="180">180 days</option>
              <option value="365">1 year</option>
              <option value="forever">Forever</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">File Retention</label>
            <select
              defaultValue="180"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#4A154B] focus:ring-[#4A154B]"
            >
              <option value="30">30 days</option>
              <option value="60">60 days</option>
              <option value="90">90 days</option>
              <option value="180">180 days</option>
              <option value="365">1 year</option>
              <option value="forever">Forever</option>
            </select>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => handleSave('retention')}
              disabled={isSaving.retention}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-[#4A154B] rounded-lg hover:bg-[#611f69] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving.retention ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
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
        return renderAccountTab();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your account settings and preferences.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm text-gray-700">{currentUsage}% used</span>
              </div>
              <div className="h-4 border-l border-gray-200" />
              <span className="text-sm text-gray-700">{daysRemaining} days left</span>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#4A154B] text-white">
              {plans[currentPlan].name}
            </span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg mb-8">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-2 text-sm font-medium border-b-2 ${
                    activeTab === tab.id
                      ? 'border-[#4A154B] text-[#4A154B]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-5 h-5 mr-2" />
                  {tab.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {renderContent()}
      </div>
    </div>
  );
}

export default Settings;