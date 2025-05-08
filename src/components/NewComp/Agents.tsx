import React from 'react';
import { Plus, MoreVertical, Copy, Trash, Power, Bot, MessageSquare, Search, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import AgentDetail from './AgentDetail';
import CreateAgent from './CreateAgent';

const mockAgents = [
  {
    id: 1,
    name: 'HR Assistant with a Very Long Name That Should Truncate',
    channels: ['#hr-support', '#onboarding', '#benefits'],
    status: 'Enabled',
    lastActivity: '2 hours ago',
    type: 'HR & People Ops',
    messagesAnswered: '847',
  },
  {
    id: 2,
    name: 'Product Knowledge Bot',
    channels: ['#product-help', '#features', '#releases'],
    status: 'Enabled',
    lastActivity: '5 mins ago',
    type: 'Product Knowledge',
    messagesAnswered: '1,234',
  },
  {
    id: 3,
    name: 'Sales Support',
    channels: ['#sales', '#deals'],
    status: 'Disabled',
    lastActivity: '1 day ago',
    type: 'Sales Enablement',
    messagesAnswered: '562',
  },
  // Add more mock agents to test pagination
  ...Array.from({ length: 10 }, (_, i) => ({
    id: i + 4,
    name: `Test Agent ${i + 1}`,
    channels: ['#test'],
    status: i % 2 === 0 ? 'Enabled' : 'Disabled',
    lastActivity: '1 hour ago',
    type: 'Test',
    messagesAnswered: '100',
  })),
];

function EmptyState({ onCreateAgent, isSearchResult = false }: { 
  onCreateAgent: () => void;
  isSearchResult?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] bg-white rounded-xl border border-gray-200 p-4 sm:p-8">
      <div className="w-16 h-16 bg-[#4A154B]/10 rounded-full flex items-center justify-center mb-6">
        <Bot className="w-8 h-8 text-[#4A154B]" />
      </div>
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 text-center">
        {isSearchResult ? 'No agents found' : 'No agents yet'}
      </h3>
      <p className="text-gray-500 text-center mb-6 max-w-sm text-sm sm:text-base">
        {isSearchResult 
          ? 'Try adjusting your search terms or clear the search to see all agents.'
          : 'Create your first agent to start automating conversations and helping your team.'}
      </p>
      {!isSearchResult && (
        <button
          onClick={onCreateAgent}
          className="min-h-[44px] px-6 py-3 text-sm font-medium text-white bg-[#4A154B] rounded-lg hover:bg-[#611f69] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4A154B] flex items-center"
          aria-label="Create your first agent"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create First Agent
        </button>
      )}
    </div>
  );
}

function AgentCard({ agent, onSelect, onShowActions, showActions }: {
  agent: typeof mockAgents[0];
  onSelect: () => void;
  onShowActions: () => void;
  showActions: boolean;
}) {
  return (
    <div 
      className="bg-white rounded-xl border border-gray-200 hover:border-[#4A154B] transition-colors focus-within:ring-2 focus-within:ring-[#4A154B] focus-within:ring-offset-2"
      role="article"
      aria-label={`Agent: ${agent.name}`}
    >
      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-full bg-[#4A154B] flex items-center justify-center text-white font-medium flex-shrink-0">
            {agent.name.charAt(0)}
          </div>
          <div className="relative">
            <button
              onClick={onShowActions}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4A154B] focus:ring-offset-2 rounded-full"
              aria-label="Show agent actions"
              aria-expanded={showActions}
              aria-haspopup="true"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            
            {showActions && (
              <div 
                className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
                role="menu"
                aria-orientation="vertical"
              >
                <div className="py-1">
                  <button
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 w-full text-left min-h-[44px]"
                    role="menuitem"
                  >
                    <Copy className="w-4 h-4 mr-3" />
                    Duplicate
                  </button>
                  <button
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 w-full text-left min-h-[44px]"
                    role="menuitem"
                  >
                    <Power className="w-4 h-4 mr-3" />
                    {agent.status === 'Enabled' ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    className="flex items-center px-4 py-3 text-sm text-red-600 hover:bg-gray-100 w-full text-left min-h-[44px]"
                    role="menuitem"
                  >
                    <Trash className="w-4 h-4 mr-3" />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <button
          onClick={onSelect}
          className="w-full text-left focus:outline-none group"
          aria-label={`View details for ${agent.name}`}
        >
          <h3 className="font-medium text-gray-900 group-hover:text-[#4A154B] truncate">
            {agent.name}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Active {agent.lastActivity}
          </p>
        </button>
        
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              agent.status === 'Enabled' 
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {agent.status}
            </span>
            <div className="flex items-center">
              <MessageSquare className="w-4 h-4 text-[#4A154B] mr-1" />
              <p className="text-sm font-medium text-gray-900">{agent.messagesAnswered}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-2">Connected Channels</p>
            <div className="flex flex-wrap gap-2">
              {agent.channels.map((channel) => (
                <span
                  key={channel}
                  className="px-2 py-1 bg-[#4A154B]/10 text-[#4A154B] rounded-full text-xs"
                >
                  {channel}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center space-x-2 mt-8 flex-wrap gap-y-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="min-h-[44px] min-w-[44px] p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`min-h-[44px] min-w-[44px] px-4 py-2 rounded-lg ${
            currentPage === page
              ? 'bg-[#4A154B] text-white'
              : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          {page}
        </button>
      ))}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="min-h-[44px] min-w-[44px] p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        aria-label="Next page"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

function Agents() {
  const [showActions, setShowActions] = React.useState<number | null>(null);
  const [selectedAgent, setSelectedAgent] = React.useState<number | null>(null);
  const [isCreating, setIsCreating] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);
  const itemsPerPage = 9;

  // Close actions menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setShowActions(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Simulate loading state when searching
  React.useEffect(() => {
    if (searchQuery) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  // Reset to first page when search query changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredAgents = React.useMemo(() => {
    if (!searchQuery) return mockAgents;
    
    const query = searchQuery.toLowerCase();
    return mockAgents.filter(agent => 
      agent.name.toLowerCase().includes(query) ||
      agent.type.toLowerCase().includes(query) ||
      agent.channels.some(channel => channel.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredAgents.length / itemsPerPage);
  const paginatedAgents = filteredAgents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (isCreating) {
    return <CreateAgent onBack={() => setIsCreating(false)} />;
  }

  if (selectedAgent !== null) {
    return <AgentDetail agentId={selectedAgent} onClose={() => setSelectedAgent(null)} />;
  }

  if (mockAgents.length === 0) {
    return <EmptyState onCreateAgent={() => setIsCreating(true)} />;
  }

  return (
    <div className="space-y-6 sm:space-y-8 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Agents</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="min-h-[44px] w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-[#4A154B] rounded-lg hover:bg-[#611f69] flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4A154B]"
          aria-label="Create new agent"
        >
          <Plus className="w-4 h-4" />
          Create New Agent
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search agents by name, type, or channels..."
          className="block w-full pl-10 pr-12 py-2 min-h-[44px] border border-gray-300 rounded-lg focus:ring-[#4A154B] focus:border-[#4A154B]"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center min-h-[44px] min-w-[44px]"
            aria-label="Clear search"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-gray-500" />
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
          <Loader2 className="w-8 h-8 text-[#4A154B] animate-spin" />
        </div>
      ) : paginatedAgents.length === 0 ? (
        <EmptyState onCreateAgent={() => setIsCreating(true)} isSearchResult={true} />
      ) : (
        <>
          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
            role="list"
            aria-label="Agents list"
          >
            {paginatedAgents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onSelect={() => setSelectedAgent(agent.id)}
                onShowActions={(e) => {
                  e.stopPropagation();
                  setShowActions(showActions === agent.id ? null : agent.id);
                }}
                showActions={showActions === agent.id}
              />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
}

export default Agents;