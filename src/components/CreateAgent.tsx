import React from 'react';
import { Bot, Upload, ArrowLeft, Check, Slack, FileText, Book, CheckSquare, FileCode2, X, ChevronDown, ChevronRight, Loader2, Search, Plus, Trash2 } from 'lucide-react';
import { auth } from '../config/firebase';
import { integrationService } from '../services/integrations';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useAgents } from '../contexts/AgentsContext';
import { useIntegrations } from '../contexts/IntegrationsContext';
import { useKnowledgeSources } from '../contexts/KnowledgeSourcesContext';
import { Agent, AgentType, KnowledgeSource, KnowledgeSourceFile } from '../types';
import { formatBytes } from '../utils/format';
import { Dialog } from '@headlessui/react';
import { Listbox } from '@headlessui/react';

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
    id: 'googleDrive',
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
    id: 'jira',
    name: 'Jira Confluence',
    icon: FileCode2,
    description: 'Access your Confluence pages and documentation',
  },
];

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

interface SlackChannel {
  id: string;
  name: string;
}

const toggleFile = (sourceId: string, fileId: string, sourceState: Record<string, SourceAuthState>, setSourceState: React.Dispatch<React.SetStateAction<Record<string, SourceAuthState>>>) => {
  setSourceState(prev => {
    const source = prev[sourceId];
    
    const updateFileAndChildren = (files: KnowledgeSourceFile[]): KnowledgeSourceFile[] => {
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
          const updatedChildren = updateFileAndChildren(file.children);
          return {
            ...file,
            children: updatedChildren,
            selected: updatedChildren.every(child => child.selected),
          };
        }
        return file;
      });
    };

    const newFiles = updateFileAndChildren(source.files);
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

function CreateAgent({ isOnboarding = false, onComplete, onBack }: CreateAgentProps) {
  const [currentStep, setCurrentStep] = React.useState(1);
  const [formData, setFormData] = React.useState({
    name: '',
    slackWorkspaceId: '',
    slackChannels: [] as string[],
    type: '',
    knowledgeSource: '',
    testQuestion: '',
  });
  const [isSlackConnected, setIsSlackConnected] = React.useState(false);
  const [isConnectingSlack, setIsConnectingSlack] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [availableChannels, setAvailableChannels] = React.useState<SlackChannel[]>([]);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [inputMessage, setInputMessage] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);
  const [sourceState, setSourceState] = React.useState<Record<string, SourceAuthState>>({
    googleDrive: { ...initialSourceState },
    notion: { ...initialSourceState },
    clickup: { ...initialSourceState },
    jira: { ...initialSourceState },
  });
  const [searchQuery, setSearchQuery] = React.useState('');
  const [connectedAccounts, setConnectedAccounts] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const chatContainerRef = React.useRef<HTMLDivElement>(null);
  const [agentId, setAgentId] = React.useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [agentDetails, setAgentDetails] = React.useState<any>(null);

  const handleSourceAuth = async (sourceId: string) => {
    if (sourceState[sourceId].isAuthenticated) return;

    try {
      if (!agentId) {
        throw new Error('Agent ID is required to connect data source');
      }

      setSourceState(prev => ({
        ...prev,
        [sourceId]: {
          ...prev[sourceId],
          isConnecting: true
        }
      }));

      const url = integrationService.getIntegrationUrl(sourceId, agentId + ":" + auth.currentUser?.uid);
      window.location.href = url;
    } catch (error) {
      console.error(`Error connecting to ${sourceId}:`, error);
      setError(`Failed to connect to ${sourceId}. Please try again.`);
      setSourceState(prev => ({
        ...prev,
        [sourceId]: {
          ...prev[sourceId],
          isConnecting: false
        }
      }));
    }
  };

  React.useEffect(() => {
    const pathParts = window.location.pathname.split('/');
    const agentIdFromPath = pathParts[pathParts.indexOf('agents') + 1];

    const oauthCallbacks = {
      'slack': 'slack-connected',
      'googleDrive': 'gdrive-connected',
      'notion': 'notion-connected',
      'clickup': 'clickup-connected',
      'jira': 'confluence-connected'
    };

    for (const [sourceId, path] of Object.entries(oauthCallbacks)) {
      if (pathParts.includes(path) && agentIdFromPath) {
        setAgentId(agentIdFromPath);
        
        const handleOAuthCallback = async () => {
          try {
            const token = await auth.currentUser?.getIdToken();
            
            const agentResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/agents/${agentIdFromPath}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });

            if (!agentResponse.ok) {
              throw new Error('Failed to fetch agent details');
            }

            const agentData = await agentResponse.json();
            setAgentDetails(agentData);
            
            if (sourceId === 'slack') {
              setFormData(prev => ({
                ...prev,
                slackWorkspaceId: agentData.slack_integration?.team_id || '',
              }));
              setIsSlackConnected(true);
              await fetchSlackChannels(agentIdFromPath);
              setCurrentStep(3);
            } else {
              setCurrentStep(4);

              const integrationKey = sourceId === 'googleDrive' ? 'google_drive_integration' : `${sourceId}_integration`;
              const integrationExists = agentData[integrationKey] !== undefined;

              setSourceState(prev => ({
                ...prev,
                [sourceId]: {
                  ...prev[sourceId],
                  isAuthenticated: integrationExists,
                  isConnecting: false,
                }
              }));

              if (integrationExists) {
                const filesResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/agents/${agentIdFromPath}/${sourceId}/files`, {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                });

                if (!filesResponse.ok) {
                  throw new Error(`Failed to fetch ${sourceId} files`);
                }

                const filesData = await filesResponse.json();
                
                setSourceState(prev => ({
                  ...prev,
                  [sourceId]: {
                    ...prev[sourceId],
                    files: filesData.files || [],
                    totalSize: filesData.totalSize || 0,
                    selectedSize: 0,
                  }
                }));

                if (filesData.account_info) {
                  setConnectedAccounts(prev => ({
                    ...prev,
                    [sourceId]: filesData.account_info
                  }));
                }
              }
            }
          } catch (error) {
            console.error(`Error handling ${sourceId} OAuth callback:`, error);
            setError(`Failed to complete ${sourceId} connection. Please try again.`);
          }
        };

        handleOAuthCallback();
        break;
      }
    }
  }, []);

  React.useEffect(() => {
    const checkInitialIntegrationState = async () => {
      if (!agentId) return;

      try {
        const token = await auth.currentUser?.getIdToken();
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/agents/${agentId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch agent details');
        }

        const agentData = await response.json();
        setAgentDetails(agentData);

        const updatedSourceState = { ...sourceState };
        const updatedConnectedAccounts = { ...connectedAccounts };

        if (agentData.slack_integration) {
          setIsSlackConnected(true);
          setFormData(prev => ({
            ...prev,
            slackWorkspaceId: agentData.slack_integration.team_id || ''
          }));
          await fetchSlackChannels(agentId);
        }

        knowledgeSources.forEach(source => {
          const integrationKey = source.id === 'googleDrive' ? 'google_drive_integration' : `${source.id}_integration`;
          if (agentData[integrationKey]) {
            updatedSourceState[source.id] = {
              ...updatedSourceState[source.id],
              isAuthenticated: true,
              isConnecting: false,
            };

            if (agentData[integrationKey].account_info) {
              updatedConnectedAccounts[source.id] = agentData[integrationKey].account_info;
            }
          }
        });

        setSourceState(updatedSourceState);
        setConnectedAccounts(updatedConnectedAccounts);

        if (currentStep === 4) {
          await fetchFilesForConnectedSources(agentId, updatedSourceState);
        }
      } catch (error) {
        console.error('Error checking initial integration state:', error);
      }
    };

    const fetchFilesForConnectedSources = async (agentId: string, sourceState: Record<string, SourceAuthState>) => {
      try {
        const token = await auth.currentUser?.getIdToken();
        
        for (const [sourceId, state] of Object.entries(sourceState)) {
          if (state.isAuthenticated && sourceId !== 'slack') {
            const filesResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/agents/${agentId}/${sourceId}/files`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });

            if (filesResponse.ok) {
              const filesData = await filesResponse.json();
              
              setSourceState(prev => ({
                ...prev,
                [sourceId]: {
                  ...prev[sourceId],
                  files: filesData.files || [],
                  totalSize: filesData.totalSize || 0,
                }
              }));

              if (filesData.account_info) {
                setConnectedAccounts(prev => ({
                  ...prev,
                  [sourceId]: filesData.account_info
                }));
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching files for connected sources:', error);
      }
    };

    checkInitialIntegrationState();
  }, [agentId, currentStep]);

  const fetchSlackChannels = async (agentId: string) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/agents/${agentId}/slack/channels`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Slack channels');
      }

      const data = await response.json();
      setAvailableChannels(data.channels || []);
      
      if (agentDetails?.slack_channels?.length > 0) {
        setFormData(prev => ({
          ...prev,
          slackChannels: agentDetails.slack_channels.map((channel: any) => channel.id)
        }));
      }
    } catch (error) {
      console.error('Error fetching Slack channels:', error);
      setError('Failed to load Slack channels. Please try again.');
    }
  };

  const handleSlackCallback = async (code: string) => {
    try {
      setIsConnectingSlack(true);
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/slack/callback`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete Slack OAuth');
      }

      const data = await response.json();
      setIsSlackConnected(true);
      setFormData(prev => ({
        ...prev,
        slackWorkspaceId: data.workspace_id,
      }));
      
      if (data.workspace_id) {
        await fetchSlackChannels(data.workspace_id);
      }
    } catch (error) {
      console.error('Error completing Slack OAuth:', error);
      setError('Failed to complete Slack connection. Please try again.');
    } finally {
      setIsConnectingSlack(false);
    }
  };

  const handleConnectSlack = async () => {
    try {
      setIsConnectingSlack(true);
      setError(null);
      
      if (!agentId) {
        throw new Error('Agent ID is required to connect to Slack');
      }
      
      const url = integrationService.getIntegrationUrl('slack', agentId+":"+auth.currentUser?.uid);
      window.location.href = url;
    } catch (error) {
      console.error('Error connecting to Slack:', error);
      setError('Failed to connect to Slack. Please try again.');
    } finally {
      setIsConnectingSlack(false);
    }
  };

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

  const createDraftAgent = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/agents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          type: formData.type,
          status: 'draft',
          configuration: {
            channels: [],
            workspaces: [],
            knowledge_sources: [],
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create draft agent');
      }

      const data = await response.json();
      setAgentId(data.agent_id);
      return data.agent_id;
    } catch (error) {
      console.error('Error creating draft agent:', error);
      setError('Failed to create draft agent. Please try again.');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (currentStep === 2) {
      try {
        await createDraftAgent();
      } catch (error) {
        return;
      }
    }

    if (currentStep === 3 && isSlackConnected) {
      try {
        const token = await auth.currentUser?.getIdToken();
        const selectedChannels = availableChannels.filter(channel => 
          formData.slackChannels.includes(channel.id)
        );

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/agents/${agentId}/slack/channels`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            channels: selectedChannels
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update Slack channels');
        }
      } catch (error) {
        console.error('Error updating Slack channels:', error);
        setError('Failed to update Slack channels. Please try again.');
        return;
      }
    }

    setCurrentStep(currentStep + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const token = await auth.currentUser?.getIdToken();
      
      const knowledgeSourcesPayload = Object.entries(sourceState)
        .filter(([_, state]) => state.isAuthenticated && state.selectedSize > 0)
        .map(([sourceId, state]) => ({
          type: sourceId,
          files: getSelectedFiles(state.files).map(file => ({
            id: file.id,
            name: file.name,
            type: file.type,
          })),
        }));

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/agents/${agentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          type: formData.type,
          status: 'active',
          configuration: {
            channels: formData.slackChannels,
            workspaces: formData.slackWorkspaceId ? [formData.slackWorkspaceId] : [],
            knowledge_sources: knowledgeSourcesPayload,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update agent');
      }

      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error updating agent:', error);
      setError('Failed to update agent. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSelectedFiles = (files: KnowledgeSourceFile[]): KnowledgeSourceFile[] => {
    return files.reduce<KnowledgeSourceFile[]>((acc, file) => {
      if (file.selected && file.type !== 'folder') {
        acc.push(file);
      }
      if (file.children) {
        acc.push(...getSelectedFiles(file.children));
      }
      return acc;
    }, []);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else if (onBack) {
      onBack();
    }
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
          if (file.children) {
            const updatedChildren = file.children.map(child => {
              if (child.id === fileId) {
                return { ...child, expanded: !child.expanded };
              }
              return child;
            });
            return { ...file, children: updatedChildren };
          }
          return file;
        }),
      },
    }));
  };

  const filterFiles = (files: KnowledgeSourceFile[], query: string): KnowledgeSourceFile[] => {
    if (!query) return files;
    
    const lowerQuery = query.toLowerCase();
    
    return files
      .map(file => {
        const matches = file.name.toLowerCase().includes(lowerQuery);
        
        if (matches) {
          return file;
        }
        
        if (file.children) {
          const filteredChildren = filterFiles(file.children, query);
          if (filteredChildren.length > 0) {
            return { 
              ...file, 
              children: filteredChildren, 
              expanded: true 
            };
          }
        }
        
        return { ...file, hidden: true };
      })
      .filter(file => !file.hidden);
  };

  const renderFile = (file: KnowledgeSourceFile, sourceId: string) => {
    return (
      <Listbox.Option
        key={file.id}
        value={file}
        className={({ active }) =>
          `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
            active ? 'bg-[#4A154B] text-white' : 'text-gray-900'
          }`
        }
      >
        {({ selected, active }) => (
          <>
            <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
              {file.name}
            </span>
            {selected ? (
              <span
                className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                  active ? 'text-white' : 'text-[#4A154B]'
                }`}
              >
                <input
                  type="checkbox"
                  checked={file.selected || false}
                  onChange={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Checkbox clicked:', { id: file.id, name: file.name });
                    toggleFile(sourceId, file.id, sourceState, setSourceState);
                  }}
                  className="rounded border-gray-300 text-[#4A154B] focus:ring-[#4A154B]"
                />
              </span>
            ) : null}
          </>
        )}
      </Listbox.Option>
    );
  };

  const renderSourceFiles = (sourceId: string) => {
    const source = sourceState[sourceId];
    if (!source) return null;

    return (
      <div className="mt-2">
        <Listbox 
          value={source.files.filter(f => f.selected)} 
          onChange={(selectedFiles) => {
            const updatedFiles = source.files.map(file => ({
              ...file,
              selected: selectedFiles.some(selected => selected.id === file.id)
            }));
            setSourceState(prev => ({
              ...prev,
              [sourceId]: {
                ...prev[sourceId],
                files: updatedFiles
              }
            }));
          }} 
          multiple
        >
          <div className="relative mt-1">
            <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left border focus:outline-none focus-visible:border-[#4A154B] focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-[#4A154B] sm:text-sm">
              <span className="block truncate">
                {source.files.filter(f => f.selected).length} files selected
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </span>
            </Listbox.Button>
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {source.files.map((file) => renderFile(file, sourceId))}
            </Listbox.Options>
          </div>
        </Listbox>
      </div>
    );
  };

  const stepTitles = [
    'Basic Information',
    'Select Agent Type',
    'Connect to Slack',
    'Knowledge Sources',
    'Test Your Agent',
  ];

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
    </div>
  );

  const renderSlackConnection = () => (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Connect to Slack</h3>
        <p className="text-sm text-gray-500 mt-1">
          Connect your agent to a Slack workspace to enable communication with your team.
        </p>
      </div>

      {!isSlackConnected ? (
        <div>
          <button
            type="button"
            onClick={handleConnectSlack}
            disabled={isConnectingSlack}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-[#4A154B] rounded-lg hover:bg-[#611f69] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnectingSlack ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Connecting to Slack...
              </>
            ) : (
              <>
                <Slack className="w-5 h-5 mr-2" />
                Connect to Slack
              </>
            )}
          </button>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div className="flex items-center">
              <Slack className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-sm text-green-800">Connected to Slack</span>
            </div>
            <button
              onClick={() => {
                setIsSlackConnected(false);
                setFormData(prev => ({
                  ...prev,
                  slackWorkspaceId: '',
                  slackChannels: [],
                }));
                setAvailableChannels([]);
              }}
              className="text-sm text-green-600 hover:text-green-700"
            >
              Disconnect
            </button>
          </div>

          <div>
            <label htmlFor="channels" className="block text-sm font-medium text-gray-700">
              Select Channels
            </label>
            <div className="mt-1 relative">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full flex items-center justify-between px-4 py-2 text-left border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#4A154B] focus:border-transparent"
                >
                  <span className="block truncate">
                    {formData.slackChannels.length > 0
                      ? `${formData.slackChannels.length} channel${formData.slackChannels.length !== 1 ? 's' : ''} selected`
                      : 'Select channels'}
                  </span>
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </button>
                {isDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-lg border border-gray-200 max-h-60 overflow-auto">
                    {availableChannels.map(channel => (
                      <div
                        key={channel.id}
                        className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          const newChannels = formData.slackChannels.includes(channel.id)
                            ? formData.slackChannels.filter(id => id !== channel.id)
                            : [...formData.slackChannels, channel.id];
                          setFormData(prev => ({
                            ...prev,
                            slackChannels: newChannels
                          }));
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={formData.slackChannels.includes(channel.id)}
                          onChange={() => {}}
                          className="h-4 w-4 text-[#4A154B] border-gray-300 rounded focus:ring-[#4A154B]"
                        />
                        <span className="ml-3 text-sm text-gray-900">{channel.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-500">
                {formData.slackChannels.length} channel{formData.slackChannels.length !== 1 ? 's' : ''} selected
              </p>
            </div>
            {availableChannels.length === 0 && (
              <p className="mt-2 text-sm text-gray-500">Loading channels...</p>
            )}
          </div>
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
        return renderSlackConnection();
      case 4:
        return renderKnowledgeSources();
      case 5:
        return renderTestAgent();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center relative">
      {isOnboarding && (
        <button 
          onClick={() => {
            if (onComplete) onComplete();
          }}
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
          <p className="text-sm text-gray-500 mt-1">Step {currentStep} of 5: {stepTitles[currentStep - 1]}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="flex items-center justify-center space-x-2 max-w-md mx-auto">
          {[1, 2, 3, 4, 5].map((step) => (
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

          {currentStep !== 4 && currentStep !== 5 && (
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
                disabled={
                  (currentStep === 1 && !formData.name) ||
                  (currentStep === 2 && !formData.type) ||
                  (currentStep === 3 && (!isSlackConnected || formData.slackChannels.length === 0))
                }
                className="px-4 py-2 text-sm font-medium text-white bg-[#4A154B] rounded-lg hover:bg-[#611f69] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          )}

          {currentStep === 5 && (
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
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-[#4A154B] rounded-lg hover:bg-[#611f69] disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    {isOnboarding ? 'Launch Agent & Continue' : 'Launch Agent'}
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default CreateAgent;