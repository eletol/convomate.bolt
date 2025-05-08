import React from 'react';
import { LayoutDashboard, Users, Plug, HelpCircle, Settings, LogOut } from 'lucide-react';

const navigation = [
  { name: 'Overview', icon: LayoutDashboard },
  { name: 'Agents', icon: Users },
  { name: 'Integrations', icon: Plug },
  { name: 'Help', icon: HelpCircle },
  { name: 'Settings', icon: Settings },
];

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const handleLogout = () => {
    // Reset authentication state
    window.location.reload();
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-[#4A154B]">Convomate</h1>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => (
          <button
            key={item.name}
            onClick={() => setActiveTab(item.name)}
            className={`flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-lg ${
              activeTab === item.name
                ? 'bg-[#4A154B]/10 text-[#4A154B]'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.name}
          </button>
        ))}
      </nav>

      <div className="p-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Usage</span>
                <span className="text-gray-900">65% of 1M msgs</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#4A154B] rounded-full"
                  style={{ width: '65%' }}
                />
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Pro Plan</span>
              <span>12 days left</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 px-4 py-2">
          <div className="w-8 h-8 rounded-full bg-[#4A154B] flex items-center justify-center text-white font-medium overflow-hidden flex-shrink-0">
            A
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Ahmed Hassan</p>
            <p className="text-xs text-gray-500">ahmed@example.com</p>
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