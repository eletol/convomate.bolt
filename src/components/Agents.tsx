import React from 'react';
import { Plus, MoreVertical, Copy, Trash, Power, Bot, MessageSquare, Search, X, ChevronLeft, ChevronRight, Loader2, Settings, Users } from 'lucide-react';
import AgentDetail from './AgentDetail';
import CreateAgent from './CreateAgent';
import { useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';
import { API_BASE_URL } from '../config/constants';

interface Agent {
  agent_id: string;
  name: string;
  type: string;
  status: string;
  created_at: string;
  last_activity?: string;
  messages_answered?: number;
  channels?: string[];
}

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

interface AgentCardProps {
  agent: Agent;
  onSelect: () => void;
  onShowActions: (event: React.MouseEvent<HTMLButtonElement>) => void;
  showActions: boolean;
}

function AgentCard({ agent, onSelect, onShowActions, showActions }: AgentCardProps) {
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
                    {agent.status === 'active' ? 'Disable' : 'Enable'}
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
            Active {agent.last_activity || 'Recently'}
          </p>
        </button>
        
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              agent.status === 'active' 
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {agent.status === 'active' ? 'Enabled' : 'Disabled'}
            </span>
            <div className="flex items-center">
              <MessageSquare className="w-4 h-4 text-[#4A154B] mr-1" />
              <p className="text-sm font-medium text-gray-900">{agent.messages_answered || 0}</p>
            </div>
          </div>

          {agent.channels && agent.channels.length > 0 && (
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
          )}
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

function Agents(): React.ReactElement {
  const navigate = useNavigate();
  const [showActions, setShowActions] = React.useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = React.useState<string | null>(null);
  const [isCreating, setIsCreating] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(true);
  const [agents, setAgents] = React.useState<Agent[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const itemsPerPage = 9;

  // Fetch agents on component mount
  React.useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/agents`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch agents');
      }

      const data = await response.json();
      setAgents(data);
    } catch (error) {
      console.error('Error fetching agents:', error);
      setError('Failed to load agents. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Close actions menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setShowActions(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const filteredAgents = React.useMemo(() => {
    if (!searchQuery) return agents;
    
    const query = searchQuery.toLowerCase();
    return agents.filter(agent => 
      agent.name.toLowerCase().includes(query) ||
      agent.type.toLowerCase().includes(query) ||
      (agent.channels && agent.channels.some(channel => channel.toLowerCase().includes(query)))
    );
  }, [agents, searchQuery]);

  const totalPages = Math.ceil(filteredAgents.length / itemsPerPage);
  const paginatedAgents = filteredAgents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCreateAgent = () => {
    setIsCreating(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setShowActions(null);
  };

  const handleShowActions = (agentId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setShowActions(showActions === agentId ? null : agentId);
  };

  if (isCreating) {
    return <CreateAgent onBack={() => setIsCreating(false)} />;
  }

  if (selectedAgent !== null) {
    return <AgentDetail agentId={selectedAgent} onClose={() => setSelectedAgent(null)} />;
  }

  if (error) {
    return (
      <div className="text-center text-red-600">
        <p>{error}</p>
        <button
          onClick={fetchAgents}
          className="mt-4 px-4 py-2 text-sm font-medium text-white bg-[#4A154B] rounded-lg hover:bg-[#611f69]"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (agents.length === 0) {
    return <EmptyState onCreateAgent={handleCreateAgent} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agents</h1>
          <p className="text-gray-500 mt-1">Manage your AI agents and their settings</p>
        </div>
        <button
          onClick={handleCreateAgent}
          className="min-h-[44px] px-4 py-2 text-sm font-medium text-white bg-[#4A154B] rounded-lg hover:bg-[#611f69] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4A154B] flex items-center justify-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Agent
        </button>
      </div>

      <div className="relative">
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A154B] focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="w-8 h-8 text-[#4A154B] animate-spin" />
        </div>
      ) : paginatedAgents.length === 0 ? (
        <EmptyState 
          onCreateAgent={handleCreateAgent} 
          isSearchResult={!!searchQuery}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedAgents.map((agent) => (
              <AgentCard
                key={agent.agent_id}
                agent={agent}
                onSelect={() => navigate(`/dashboard/agents/${agent.agent_id}/edit`)}
                onShowActions={(e) => handleShowActions(agent.agent_id, e)}
                showActions={showActions === agent.agent_id}
              />
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}

export default Agents;