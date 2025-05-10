import React from 'react';
import { Loader2, Slack, FileText, Book, CheckSquare, FileCode2, Check, X } from 'lucide-react';
import { auth } from '../config/firebase';

const integrations = [
  {
    name: 'Slack',
    icon: Slack,
    key: 'slack_integration',
    status: 'Connected',
    description: 'Connect your Slack workspace to enable agent communication.'
  },
  {
    name: 'Google Drive',
    icon: FileText,
    key: 'google_drive_integration',
    status: 'Not Connected',
    description: 'Access and index documents from your Google Drive.'
  },
  {
    name: 'Notion',
    icon: Book,
    key: 'notion_integration',
    status: 'Connected',
    description: 'Use your Notion workspace as a knowledge source.'
  },
  {
    name: 'ClickUp',
    icon: CheckSquare,
    key: 'clickup_integration',
    status: 'Not Connected',
    description: 'Connect to your ClickUp workspace for task management.'
  },
  {
    name: 'Jira Confluence',
    icon: FileCode2,
    key: 'jira_integration',
    status: 'Connected',
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
  // ...other fields
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
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/agents`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch agents');
        const data = await response.json();
        setAgents(data);
      } catch (err) {
        setError('Failed to load agents.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchAgents();
  }, []);

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

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-[#4A154B] mb-2" />
          <span className="text-gray-500">Loading integrations...</span>
        </div>
      ) : error ? (
        <div className="text-red-600 text-center">{error}</div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {integrations.map((integration) => (
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
                    {agents.filter(agent => agent[integration.key as keyof Agent]).length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700">Agents using this integration:</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {agents
                            .filter(agent => agent[integration.key as keyof Agent])
                            .map(agent => (
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
                <div className="flex items-center space-x-4">
                  {/* Status badge */}
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      integration.status === 'Connected'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {integration.status === 'Connected' ? (
                      <Check className="w-4 h-4 mr-1" />
                    ) : (
                      <X className="w-4 h-4 mr-1" />
                    )}
                    {integration.status}
                  </span>
                  {/* Connect/Disconnect button */}
                  <button
                    className={`px-4 py-2 text-sm font-medium rounded-lg ${
                      integration.status === 'Connected'
                        ? 'text-red-600 hover:bg-red-50'
                        : 'text-white bg-[#4A154B] hover:bg-[#611f69]'
                    }`}
                  >
                    {integration.status === 'Connected' ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}