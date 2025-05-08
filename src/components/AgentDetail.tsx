import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Loader2, Settings, Trash2, MessageSquare, Power } from 'lucide-react';
import { auth } from '../config/firebase';

interface Agent {
  agent_id: string;
  name: string;
  type: string;
  created_at: string;
  status?: string;
  description?: string;
  configuration?: {
    channels?: string[];
    workspaces?: string[];
    projects?: string[];
    folders?: string[];
    filters?: string[];
  };
}

const AgentDetail: React.FC = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (agentId) {
      fetchAgentDetails(agentId);
    }
  }, [agentId]);

  const fetchAgentDetails = async (id: string) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/agents/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch agent details');
      }

      const data = await response.json();
      setAgent(data);
    } catch (error) {
      console.error('Error fetching agent details:', error);
      setError('Failed to load agent details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this agent?')) {
      return;
    }

    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/agents/${agentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete agent');
      }

      navigate('/dashboard/agents');
    } catch (error) {
      console.error('Error deleting agent:', error);
      setError('Failed to delete agent. Please try again.');
    }
  };

  const handleToggleStatus = async () => {
    if (!agent) return;

    setIsUpdating(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/agents/${agentId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: agent.status === 'active' ? 'inactive' : 'active',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update agent status');
      }

      const updatedAgent = await response.json();
      setAgent(updatedAgent);
    } catch (error) {
      console.error('Error updating agent status:', error);
      setError('Failed to update agent status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-[#4A154B]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600">
        <p>{error}</p>
        <button
          onClick={() => agentId && fetchAgentDetails(agentId)}
          className="mt-4 px-4 py-2 text-sm font-medium text-white bg-[#4A154B] rounded-lg hover:bg-[#611f69]"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="text-center">
        <p>Agent not found</p>
        <button
          onClick={() => navigate('/dashboard/agents')}
          className="mt-4 px-4 py-2 text-sm font-medium text-white bg-[#4A154B] rounded-lg hover:bg-[#611f69]"
        >
          Back to Agents
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard/agents')}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Agents
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{agent.name}</h1>
              <p className="text-sm text-gray-500 mt-1">
                Created {new Date(agent.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleToggleStatus}
                disabled={isUpdating}
                className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md ${
                  agent.status === 'active'
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isUpdating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Power className="w-4 h-4 mr-2" />
                )}
                {agent.status === 'active' ? 'Active' : 'Inactive'}
              </button>
              <button
                onClick={() => navigate(`/dashboard/agents/${agentId}/settings`)}
                className="text-gray-400 hover:text-gray-500"
              >
                <Settings className="h-5 w-5" />
              </button>
              <button
                onClick={handleDelete}
                className="text-gray-400 hover:text-red-500"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="mt-6 space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Description</h2>
              <p className="mt-2 text-sm text-gray-500">
                {agent.description || 'No description provided.'}
              </p>
            </div>

            <div>
              <h2 className="text-lg font-medium text-gray-900">Type</h2>
              <span className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#4A154B]/10 text-[#4A154B]">
                {agent.type}
              </span>
            </div>

            {agent.configuration && (
              <div className="space-y-6">
                {agent.configuration.channels && agent.configuration.channels.length > 0 && (
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">Connected Channels</h2>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {agent.configuration.channels.map((channel) => (
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

                {agent.configuration.workspaces && agent.configuration.workspaces.length > 0 && (
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">Connected Workspaces</h2>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {agent.configuration.workspaces.map((workspace) => (
                        <span
                          key={workspace}
                          className="px-2 py-1 bg-[#4A154B]/10 text-[#4A154B] rounded-full text-xs"
                        >
                          {workspace}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {agent.configuration.projects && agent.configuration.projects.length > 0 && (
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">Connected Projects</h2>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {agent.configuration.projects.map((project) => (
                        <span
                          key={project}
                          className="px-2 py-1 bg-[#4A154B]/10 text-[#4A154B] rounded-full text-xs"
                        >
                          {project}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {agent.configuration.folders && agent.configuration.folders.length > 0 && (
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">Connected Folders</h2>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {agent.configuration.folders.map((folder) => (
                        <span
                          key={folder}
                          className="px-2 py-1 bg-[#4A154B]/10 text-[#4A154B] rounded-full text-xs"
                        >
                          {folder}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {agent.configuration.filters && agent.configuration.filters.length > 0 && (
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">Active Filters</h2>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {agent.configuration.filters.map((filter) => (
                        <span
                          key={filter}
                          className="px-2 py-1 bg-[#4A154B]/10 text-[#4A154B] rounded-full text-xs"
                        >
                          {filter}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDetail;