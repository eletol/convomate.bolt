import React from 'react';
import { Loader2, Slack, FileText, Book, CheckSquare, FileCode2, Check, X } from 'lucide-react';
import { auth } from '../config/firebase';

const integrations: IntegrationDef[] = [
  {
    name: 'Slack',
    icon: Slack,
    key: 'slack_channels',
    description: 'Connect your Slack workspace to enable agent communication.'
  },
  {
    name: 'Google Drive',
    icon: FileText,
    key: 'google_drive_files',
    description: 'Access and index documents from your Google Drive.'
  },
  {
    name: 'Notion',
    icon: Book,
    key: 'notion_files',
    description: 'Use your Notion workspace as a knowledge source.'
  },
  {
    name: 'ClickUp',
    icon: CheckSquare,
    key: 'clickup_files',
    description: 'Connect to your ClickUp workspace for task management.'
  },
  {
    name: 'Jira Confluence',
    icon: FileCode2,
    key: 'jira_files',
    description: 'Access your Confluence pages and documentation.'
  }
];

interface Agent {
  agent_id: string;
  name: string;
  slack_integration?: any;
  notion_integration?: any;
  google_drive_integration?: any;
  jira_integration?: any;
  clickup_integration?: any;
  slack_channels?: any[];
  google_drive_files?: any[];
  jira_files?: any[];
  notion_files?: any[];
  clickup_files?: any[];
  // ...other fields
}

interface IntegrationDef {
  name: string;
  icon: any;
  key: string;
  description: string;
}

export default function Integrations() {
  const [agents, setAgents] = React.useState<Agent[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchAgents() {
      setIsLoading(true);
      setError(null);
      try {
        const token = await auth.currentUser?.getIdToken();
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/agents?limit=50`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch agents');
        const data = await response.json();
        setAgents(data.data || []);
      } catch (err) {
        setError('Failed to load agents.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchAgents();
  }, []);

  // Dynamically check if any agent has notion_files or clickup_files
  const hasNotion = agents.some(agent => Array.isArray(agent.notion_files));
  const hasClickUp = agents.some(agent => Array.isArray(agent.clickup_files));

  function isIntegrationDef(x: any): x is IntegrationDef {
    return x && typeof x === 'object' && typeof x.key === 'string';
  }

  const dynamicIntegrations: IntegrationDef[] = [
    {
      name: 'Slack',
      icon: Slack,
      key: 'slack_channels',
      description: 'Connect your Slack workspace to enable agent communication.'
    },
    {
      name: 'Google Drive',
      icon: FileText,
      key: 'google_drive_files',
      description: 'Access and index documents from your Google Drive.'
    },
    hasNotion && {
      name: 'Notion',
      icon: Book,
      key: 'notion_files',
      description: 'Use your Notion workspace as a knowledge source.'
    },
    hasClickUp && {
      name: 'ClickUp',
      icon: CheckSquare,
      key: 'clickup_files',
      description: 'Connect to your ClickUp workspace for task management.'
    },
    {
      name: 'Jira Confluence',
      icon: FileCode2,
      key: 'jira_files',
      description: 'Access your Confluence pages and documentation.'
    }
  ].filter(isIntegrationDef);

  const handleRefreshAll = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/agents/sync-all`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to sync agents');
      // Optionally, you can refetch agents here if needed
      // await fetchAgents();
    } catch (err) {
      setError('Failed to refresh integrations.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-[#4A154B] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Integrations</h2>
        <button 
          onClick={handleRefreshAll}
          className="px-4 py-2 text-sm font-medium text-white bg-[#4A154B] rounded-lg hover:bg-[#611f69]"
        >
          Refresh All
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {integrations.map((integration) => {
          const agentsUsingIntegration = agents.filter(agent =>
            Array.isArray(agent[integration.key as keyof Agent]) && (agent[integration.key as keyof Agent] as any[]).length > 0
          );
          const isConnected = agentsUsingIntegration.length > 0;
          return (
            <div
              key={integration.name}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:border-[#4A154B] transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-[#4A154B]/10 rounded-lg">
                    <integration.icon className="w-6 h-6 text-[#4A154B]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{integration.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{integration.description}</p>
                    {/* Agent tags for this integration */}
                    {isConnected && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700">Agents using this integration:</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {agentsUsingIntegration.map(agent => (
                            <span
                              key={agent.agent_id}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#4A154B]/10 text-[#4A154B]"
                            >
                              {agent.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center">
                  {isConnected ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <Check className="w-3 h-3 mr-1" />
                      Connected
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      <X className="w-3 h-3 mr-1" />
                      Not Connected
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}