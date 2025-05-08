import React from 'react';
import { Slack, FileText, Book, CheckSquare, FileCode2, Check, X } from 'lucide-react';

const integrations = [
  {
    name: 'Slack',
    icon: Slack,
    status: 'Connected',
    agentsUsing: ['HR Assistant', 'Product Knowledge Bot'],
    description: 'Connect your Slack workspace to enable agent communication.'
  },
  {
    name: 'Google Drive',
    icon: FileText,
    status: 'Not Connected',
    agentsUsing: [],
    description: 'Access and index documents from your Google Drive.'
  },
  {
    name: 'Notion',
    icon: Book,
    status: 'Connected',
    agentsUsing: ['HR Assistant'],
    description: 'Use your Notion workspace as a knowledge source.'
  },
  {
    name: 'ClickUp',
    icon: CheckSquare,
    status: 'Not Connected',
    agentsUsing: [],
    description: 'Connect to your ClickUp workspace for task management.'
  },
  {
    name: 'Jira Confluence',
    icon: FileCode2,
    status: 'Connected',
    agentsUsing: ['Product Knowledge Bot'],
    description: 'Access your Confluence pages and documentation.'
  }
];

function Integrations(): React.ReactElement {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Integrations</h2>
        <button className="px-4 py-2 text-sm font-medium text-white bg-[#4A154B] rounded-lg hover:bg-[#611f69]">
          Refresh All
        </button>
      </div>

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
                  
                  {integration.status === 'Connected' && integration.agentsUsing.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700">Agents using this integration:</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {integration.agentsUsing.map((agent) => (
                          <span
                            key={agent}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#4A154B]/10 text-[#4A154B]"
                          >
                            {agent}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
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
    </div>
  );
}

export default Integrations;