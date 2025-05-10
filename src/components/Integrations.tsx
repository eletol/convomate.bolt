import React from 'react';
import { Loader2 } from 'lucide-react';
import { auth } from '../config/firebase';

const integrations = [
  { id: 'slack', label: 'Slack', key: 'slack_integration' },
  { id: 'notion', label: 'Notion', key: 'notion_integration' },
  { id: 'googleDrive', label: 'Google Drive', key: 'google_drive_integration' },
  { id: 'jira', label: 'Jira', key: 'jira_integration' }
];

interface Agent {
  agent_id: string;
  name: string;
  slack_integration?: any;
  notion_integration?: any;
  google_drive_integration?: any;
  jira_integration?: any;
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

  type AgentsByIntegration = { [key: string]: Agent[] };
  const agentsByIntegration: AgentsByIntegration = React.useMemo(() => {
    return integrations.reduce((acc: AgentsByIntegration, integration) => {
      acc[integration.id] = agents.filter(agent => agent[integration.key as keyof Agent]);
      return acc;
    }, {} as AgentsByIntegration);
  }, [agents]);

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-8">
      <h1 className="text-2xl font-bold mb-6">Integrations</h1>
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
              key={integration.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:border-[#4A154B] transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{integration.label}</h3>
                    {agentsByIntegration[integration.id].length === 0 ? (
                      <p className="text-gray-400 text-sm">No agents use this integration.</p>
                    ) : (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700">Agents using this integration:</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {agentsByIntegration[integration.id].map((agent: Agent) => (
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
                {/* ...rest of your card (status, connect/disconnect button, etc)... */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}