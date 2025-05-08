import React from 'react';
import { Bot, Upload, ArrowLeft, Check, Slack, FileText, Book, CheckSquare, FileCode2, X, ChevronDown, ChevronRight, Loader2, Search } from 'lucide-react';

const mockSlackWorkspaces = [
  { id: '1', name: 'Acme Corp', domain: 'acme' },
  { id: '2', name: 'Startup Team', domain: 'startup' },
  { id: '3', name: 'Marketing Squad', domain: 'marketing' }
];

const agentTypes = [
  {
    id: 'hr',
    name: 'HR & People Ops Assistant',
    description: 'Handle employee questions about policies, benefits, and procedures',
  },
  {
    id: 'product',
    name: 'Product Knowledge Agent',
    description: 'Answer questions about product features, updates, and documentation',
  },
  {
    id: 'sales',
    name: 'Sales Enablement Copilot',
    description: 'Support sales team with product information and pricing details',
  },
  {
    id: 'support',
    name: 'Internal Support Agent',
    description: 'Provide technical support and troubleshooting assistance',
  },
  {
    id: 'custom',
    name: 'Custom Agent',
    description: 'Create a custom agent for your specific needs',
  },
];

const knowledgeSources = [
  {
    id: 'gdrive',
    name: 'Google Drive',
    icon: FileText,
    description: 'Connect your Google Drive files and folders',
  },
  {
    id: 'notion',
    name: 'Notion',
    icon: Book,
    description: 'Use your Notion workspace as knowledge source',
  },
  {
    id: 'clickup',
    name: 'ClickUp',
    icon: CheckSquare,
    description: 'Connect to your ClickUp workspace',
  },
  {
    id: 'confluence',
    name: 'Jira Confluence',
    icon: FileCode2,
    description: 'Access your Confluence pages and documentation',
  },
];

interface KnowledgeSourceFile {
  id: string;
  name: string;
  type: string;
  size: number;
  selected: boolean;
  children?: KnowledgeSourceFile[];
  expanded?: boolean;
  hidden?: boolean;
}

interface SourceAuthState {
  isAuthenticated: boolean;
  isConnecting: boolean;
  files: KnowledgeSourceFile[];
  totalSize: number;
  selectedSize: number;
}

const initialSourceState: SourceAuthState = {
  isAuthenticated: false,
  isConnecting: false,
  files: [],
  totalSize: 0,
  selectedSize: 0,
};

const mockFiles = {
  gdrive: [
    {
      id: '1',
      name: 'HR Documents',
      type: 'folder',
      size: 0,
      selected: false,
      expanded: false,
      children: [
        {
          id: '1-1',
          name: 'Employee Handbook 2024.pdf',
          type: 'pdf',
          size: 2500000,
          selected: false,
        },
        {
          id: '1-2',
          name: 'Benefits Guide.pdf',
          type: 'pdf',
          size: 1800000,
          selected: false,
        },
      ],
    },
    {
      id: '2',
      name: 'Company Policies',
      type: 'folder',
      size: 0,
      selected: false,
      expanded: false,
      children: [
        {
          id: '2-1',
          name: 'Remote Work Policy.docx',
          type: 'document',
          size: 500000,
          selected: false,
        },
        {
          id: '2-2',
          name: 'Security Guidelines.pdf',
          type: 'pdf',
          size: 1200000,
          selected: false,
        },
      ],
    },
  ],
  notion: [
    {
      id: '1',
      name: 'HR Knowledge Base',
      type: 'page',
      size: 1500000,
      selected: false,
    },
    {
      id: '2',
      name: 'Onboarding Process',
      type: 'page',
      size: 800000,
      selected: false,
    },
  ],
  clickup: [
    {
      id: '1',
      name: 'HR Processes',
      type: 'list',
      size: 700000,
      selected: false,
    },
    {
      id: '2',
      name: 'Employee FAQ',
      type: 'doc',
      size: 500000,
      selected: false,
    },
  ],
  confluence: [
    {
      id: '1',
      name: 'HR Space',
      type: 'space',
      size: 5000000,
      selected: false,
      expanded: false,
      children: [
        {
          id: '1-1',
          name: 'Policies',
          type: 'page',
          size: 2000000,
          selected: false,
        },
        {
          id: '1-2',
          name: 'Guidelines',
          type: 'page',
          size: 1500000,
          selected: false,
        },
      ],
    },
  ],
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

interface CreateAgentProps {
  isOnboarding?: boolean;
  onComplete?: () => void;
  onBack?: () => void;
}

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

function CreateAgent({ isOnboarding = false, onComplete, onBack }: CreateAgentProps) {
  const [currentStep, setCurrentStep] = React.useState(1);
  const [formData, setFormData] = React.useState({
    name: '',
    slackWorkspaceId: '',
    slackChannel: '',
    type: '',
    knowledgeSource: '',
    testQuestion: '',
  });
  const [isSlackConnected, setIsSlackConnected] = React.useState(false);
  const [availableChannels, setAvailableChannels] = React.useState<string[]>([
    '#general',
    '#random',
    '#support',
    '#hr-support',
    '#sales'
  ]);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [inputMessage, setInputMessage] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);
  const [sourceState, setSourceState] = React.useState<Record<string, SourceAuthState>>({
    gdrive: { ...initialSourceState },
    notion: { ...initialSourceState },
    clickup: { ...initialSourceState },
    confluence: { ...initialSourceState },
  });
  const [searchQuery, setSearchQuery] = React.useState('');
  const [connectedAccounts, setConnectedAccounts] = React.useState<Record<string, string>>({});
  const chatContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inputMessage.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      await simulateResponse(inputMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'bot',
        content: 'Sorry, there was an error processing your message. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const simulateResponse = async (userMessage: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const responses = [
      "Based on the HR documentation, I can help with that. The standard policy states that...",
      "According to our employee handbook, here's what you need to know...",
      "I've found relevant information in our knowledge base. Let me explain...",
      "Based on our company policies, I can clarify this for you..."
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)] +
      " This is a simulation. In production, I'll provide accurate answers based on your connected knowledge sources.";

    const botMessage: Message = {
      id: Date.now().toString(),
      type: 'bot',
      content: randomResponse,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, botMessage]);
  };

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else if (onBack) {
      onBack();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onComplete) {
      onComplete();
    }
  };

  const handleConnectSlack = () => {
    setIsSlackConnected(true);
  };

  const handleSkipOnboarding = () => {
    if (onComplete) {
      onComplete();
    }
  };

  const handleSourceAuth = async (sourceId: string) => {
    if (sourceState[sourceId].isAuthenticated) return;

    setSourceState(prev => ({
      ...prev,
      [sourceId]: {
        ...prev[sourceId],
        isConnecting: true,
      }
    }));

    await new Promise(resolve => setTimeout(resolve, 1500));

    const mockAccounts = {
      gdrive: 'john.doe@company.com',
      notion: 'Acme Corp Workspace',
      clickup: 'Marketing Team',
      confluence: 'Engineering Space',
    };

    setConnectedAccounts(prev => ({
      ...prev,
      [sourceId]: mockAccounts[sourceId as keyof typeof mockAccounts],
    }));

    setSourceState(prev => ({
      ...prev,
      [sourceId]: {
        ...prev[sourceId],
        isConnecting: false,
        isAuthenticated: true,
        files: mockFiles[sourceId as keyof typeof mockFiles],
        totalSize: mockFiles[sourceId as keyof typeof mockFiles].reduce((acc, file) => {
          const getSize = (f: KnowledgeSourceFile): number => {
            if (f.children) {
              return f.children.reduce((sum, child) => sum + getSize(child), 0);
            }
            return f.size;
          };
          return acc + getSize(file);
        }, 0),
        selectedSize: 0,
      }
    }));
  };

  const toggleFile = (sourceId: string, fileId: string, parentId?: string) => {
    setSourceState(prev => {
      const source = prev[sourceId];
      const updateFile = (files: KnowledgeSourceFile[]): KnowledgeSourceFile[] => {
        return files.map(file => {
          if (file.id === fileId) {
            const newSelected = !file.selected;
            return {
              ...file,
              selected: newSelected,
              children: file.children?.map(child => ({
                ...child,
                selected: newSelected,
              })),
            };
          } else if (file.children) {
            return {
              ...file,
              children: updateFile(file.children),
              selected: file.children.every(child => child.selected),
            };
          }
          return file;
        });
      };

      const newFiles = updateFile(source.files);
      const calculateSelectedSize = (files: KnowledgeSourceFile[]): number => {
        return files.reduce((acc, file) => {
          if (file.selected) {
            if (file.children) {
              return acc + calculateSelectedSize(file.children);
            }
            return acc + file.size;
          }
          return acc + (file.children ? calculateSelectedSize(file.children) : 0);
        }, 0);
      };

      return {
        ...prev,
        [sourceId]: {
          ...source,
          files: newFiles,
          selectedSize: calculateSelectedSize(newFiles),
        },
      };
    });
  };

  const toggleExpand = (sourceId: string, fileId: string) => {
    setSourceState(prev => ({
      ...prev,
      [sourceId]: {
        ...prev[sourceId],
        files: prev[sourceId].files.map(file => {
          if (file.id === fileId) {
            return { ...file, expanded: !file.expanded };
          }
          return file;
        }),
      },
    }));
  };

  const filterFiles = (files: KnowledgeSourceFile[], query: string): KnowledgeSourceFile[] => {
    if (!query) return files;
    
    return files.map(file => {
      if (file.name.toLowerCase().includes(query.toLowerCase())) {
        return file;
      }
      if (file.children) {
        const filteredChildren = filterFiles(file.children, query);
        if (filteredChildren.length > 0) {
          return { ...file, children: filteredChildren, expanded: true };
        }
      }
      return { ...file, hidden: true };
    }).filter(file => !file.hidden);
  };

  const stepTitles = [
    'Basic Information',
    'Select Agent Type',
    'Knowledge Sources',
    'Test Your Agent',
  ];

  const renderFile = (file: KnowledgeSourceFile, sourceId: string, level = 0) => (
    <div key={file.id} className="space-y-2">
      <div 
        className={`flex items-center space-x-2 py-2 px-3 rounded-lg hover:bg-gray-50 ${
          level > 0 ? 'ml-6' : ''
        }`}
      >
        {file.children && (
          <button
            onClick={() => toggleExpand(sourceId, file.id)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {file.expanded ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
          </button>
        )}
        <input
          type="checkbox"
          checked={file.selected}
          onChange={() => toggleFile(sourceId, file.id)}
          className="rounded border-gray-300 text-[#4A154B] focus:ring-[#4A154B]"
        />
        <span className="flex-1 text-sm">{file.name}</span>
        {file.size > 0 && (
          <span className="text-xs text-gray-500">{formatBytes(file.size)}</span>
        )}
      </div>
      {file.children && file.expanded && (
        <div className="ml-4">
          {file.children.map(child => renderFile(child, sourceId, level + 1))}
        </div>
      )}
    </div>
  );

  const renderBasicInfo = () => (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Agent Name
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#4A154B] focus:ring-[#4A154B] focus:ring-2 focus:ring-opacity-50"
          placeholder="e.g., HR Assistant"
        />
      </div>

      {!isSlackConnected ? (
        <div>
          <button
            type="button"
            onClick={handleConnectSlack}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-[#4A154B] rounded-lg hover:bg-[#611f69] transition-colors"
          >
            <Slack className="w-5 h-5 mr-2" />
            Connect to Slack
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label htmlFor="workspace" className="block text-sm font-medium text-gray-700">
              Select Slack Workspace
            </label>
            <select
              id="workspace"
              value={formData.slackWorkspaceId}
              onChange={(e) => setFormData({ ...formData, slackWorkspaceId: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#4A154B] focus:ring-[#4A154B] focus:ring-2 focus:ring-opacity-50"
            >
              <option value="">Select a workspace</option>
              {mockSlackWorkspaces.map(workspace => (
                <option key={workspace.id} value={workspace.id}>
                  {workspace.name} (@{workspace.domain})
                </option>
              ))}
            </select>
          </div>

          {formData.slackWorkspaceId && (
            <div>
              <label htmlFor="channel" className="block text-sm font-medium text-gray-700">
                Select Channel
              </label>
              <select
                id="channel"
                value={formData.slackChannel}
                onChange={(e) => setFormData({ ...formData, slackChannel: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#4A154B] focus:ring-[#4A154B] focus:ring-2 focus:ring-opacity-50"
              >
                <option value="">Select a channel</option>
                {availableChannels.map(channel => (
                  <option key={channel} value={channel}>
                    {channel}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderAgentTypes = () => (
    <div className="grid grid-cols-1 gap-4 max-w-3xl">
      {agentTypes.map((type) => (
        <button
          key={type.id}
          type="button"
          onClick={() => {
            setFormData({ ...formData, type: type.id });
            handleNext();
          }}
          className={`w-full p-6 text-left rounded-lg border transition-colors ${
            formData.type === type.id
              ? 'border-[#4A154B] bg-[#4A154B]/5'
              : 'border-gray-200 hover:border-[#4A154B] hover:bg-gray-50'
          }`}
        >
          <h3 className="text-lg font-medium text-gray-900">{type.name}</h3>
          <p className="text-sm text-gray-500 mt-2">{type.description}</p>
        </button>
      ))}
    </div>
  );

  const renderKnowledgeSources = () => (
    <div className="space-y-6 max-w-3xl">
      <div className="grid grid-cols-1 gap-4">
        {knowledgeSources.map((source) => (
          <button
            key={source.id}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!sourceState[source.id].isAuthenticated) {
                handleSourceAuth(source.id);
              }
            }}
            className={`w-full p-6 text-left rounded-lg border transition-colors ${
              sourceState[source.id].isAuthenticated
                ? 'border-[#4A154B] bg-[#4A154B]/5'
                : 'border-gray-200 hover:border-[#4A154B] hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-[#4A154B]/10 rounded-lg">
                  <source.icon className="w-6 h-6 text-[#4A154B]" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{source.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{source.description}</p>
                  {sourceState[source.id].isAuthenticated && connectedAccounts[source.id] && (
                    <p className="text-sm text-[#4A154B] mt-2">
                      Connected as {connectedAccounts[source.id]}
                    </p>
                  )}
                </div>
              </div>
              
              {sourceState[source.id].isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Check className="w-4 h-4 mr-1" />
                    Connected
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSourceState(prev => ({
                        ...prev,
                        [source.id]: initialSourceState,
                      }));
                      setConnectedAccounts(prev => {
                        const newAccounts = { ...prev };
                        delete newAccounts[source.id];
                        return newAccounts;
                      });
                    }}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    Disconnect
                  </button>
                </div>
              ) : sourceState[source.id].isConnecting ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin text-[#4A154B]" />
                  <span className="text-sm text-gray-500">Connecting...</span>
                </div>
              ) : (
                <span className="text-sm text-[#4A154B]">Click to connect</span>
              )}
            </div>

            {sourceState[source.id].isAuthenticated && (
              <div className="mt-6 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={`Search ${source.name} documents...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A154B] focus:border-transparent"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                <div className="bg-white rounded-lg border border-gray-200 max-h-[300px] overflow-y-auto">
                  <div className="p-4">
                    {filterFiles(sourceState[source.id].files, searchQuery).map(file => 
                      renderFile(file, source.id)
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    Selected: {formatBytes(sourceState[source.id].selectedSize)}
                  </span>
                  <span className="text-gray-500">
                    Total available: {formatBytes(sourceState[source.id].totalSize)}
                  </span>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>

      {Object.values(sourceState).some(state => state.isAuthenticated) && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Total Selected Data</h3>
          <div className="space-y-4">
            {Object.entries(sourceState).map(([sourceId, state]) => {
              if (!state.isAuthenticated || state.selectedSize === 0) return null;
              const source = knowledgeSources.find(s => s.id === sourceId);
              if (!source) return null;
              const IconComponent = source.icon;
              return (
                <div key={sourceId} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <IconComponent className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{source.name}</span>
                  </div>
                  <span className="text-sm text-gray-900">{formatBytes(state.selectedSize)}</span>
                </div>
              );
            })}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between font-medium">
                <span className="text-gray-900">Total Size</span>
                <span className="text-gray-900">
                  {formatBytes(
                    Object.values(sourceState).reduce(
                      (acc, state) => acc + state.selectedSize,
                      0
                    )
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-6">
        <button
          type="button"
          onClick={handleBack}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!Object.values(sourceState).some(state => 
            state.isAuthenticated && state.selectedSize > 0
          )}
          className="px-4 py-2 text-sm font-medium text-white bg-[#4A154B] rounded-lg hover:bg-[#611f69] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );

  const renderTestAgent = () => (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200 p-4">
          <h3 className="text-lg font-medium text-gray-900">Test Your Agent</h3>
          <p className="text-sm text-gray-500 mt-1">
            Try asking your agent a question to see how it responds using your connected knowledge sources.
          </p>
        </div>

        <div className="h-[400px] flex flex-col">
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div 
                  className={`flex items-start space-x-2 max-w-[80%] ${
                    message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium ${
                      message.type === 'user' ? 'bg-[#4A154B]' : 'bg-gray-500'
                    }`}
                  >
                    {message.type === 'user' ? 'U' : 'A'}
                  </div>
                  <div 
                    className={`rounded-2xl px-4 py-2 ${
                      message.type === 'user' 
                        ? 'bg-[#4A154B] text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start animate-fade-in">
                <div className="flex items-start space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-white font-medium">
                    A
                  </div>
                  <div className="bg-gray-100 rounded-2xl px-4 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}/>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}/>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 p-4">
            <form onSubmit={handleSendMessage} className="flex items-end space-x-4">
              <div className="flex-1">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  placeholder="Type your message..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#4A154B] focus:border-transparent resize-none"
                  rows={1}
                  style={{ minHeight: '44px', maxHeight: '120px' }}
                />
              </div>
              <button
                type="submit"
                disabled={!inputMessage.trim() || isTyping}
                className="px-4 py-2 text-sm font-medium text-white bg-[#4A154B] rounded-lg hover:bg-[#611f69] disabled:opacity-50 disabled:cursor-not-allowed h-[44px] flex items-center"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={handleBack}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Back
        </button>
        <button
          type="submit"
          onClick={(e) => {
            e.preventDefault();
            if (onComplete) onComplete();
          }}
          className="px-4 py-2 text-sm font-medium text-white bg-[#4A154B] rounded-lg hover:bg-[#611f69]"
        >
          {isOnboarding ? 'Launch Agent & Continue' : 'Launch Agent'}
        </button>
      </div>
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return renderBasicInfo();
      case 2:
        return renderAgentTypes();
      case 3:
        return renderKnowledgeSources();
      case 4:
        return renderTestAgent();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center relative">
      {isOnboarding && (
        <button 
          onClick={handleSkipOnboarding}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-500 transition-colors"
          aria-label="Skip onboarding"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      <div className="max-w-4xl w-full mx-auto p-8 space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">
            {isOnboarding ? "Welcome! Let's Create Your First Agent" : "Create New Agent"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">Step {currentStep} of 4: {stepTitles[currentStep - 1]}</p>
        </div>

        <div className="flex items-center justify-center space-x-2 max-w-md mx-auto">
          {[1, 2, 3, 4].map((step) => (
            <React.Fragment key={step}>
              <div
                className={`w-full h-2 rounded-full transition-colors ${
                  step <= currentStep ? 'bg-[#4A154B]' : 'bg-gray-200'
                }`}
              />
            </React.Fragment>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>{renderStep()}</div>

          {currentStep !== 3 && currentStep !== 4 && (
            <div className="flex justify-end pt-6">
              {(currentStep > 1 || !isOnboarding) && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="mr-4 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {currentStep === 1 && !isOnboarding ? 'Cancel' : 'Back'}
                </button>
              )}
              <button
                type="button"
                onClick={handleNext}
                disabled={!formData.name || !formData.slackChannel}
                className="px-4 py-2 text-sm font-medium text-white bg-[#4A154B] rounded-lg hover:bg-[#611f69] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default CreateAgent;