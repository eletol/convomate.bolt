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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {integrations.map(integration => (
            <div key={integration.id} className="p-6 border rounded-lg bg-white">
              <h3 className="text-lg font-bold mb-2">{integration.label}</h3>
              {agentsByIntegration[integration.id].length === 0 ? (
                <p className="text-gray-400 text-sm">No agents use this integration.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {agentsByIntegration[integration.id].map((agent: Agent) => (
                    <span
                      key={agent.agent_id}
                      className="px-3 py-1 bg-[#4A154B]/10 text-[#4A154B] rounded-full text-xs font-medium"
                    >
                      {agent.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}