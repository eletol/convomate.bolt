import React from 'react';
import { Bot, Upload, ArrowLeft, Check, Slack, FileText, Book, CheckSquare, FileCode2, X, ChevronDown, ChevronRight, Loader2, Search, Plus, Trash2 } from 'lucide-react';
import { auth } from '../config/firebase';
import { integrationService } from '../services/integrations';
import { useNavigate, useParams } from 'react-router-dom';
import { Dialog } from '@headlessui/react';
import { Listbox } from '@headlessui/react';
import { Agent, AgentType, KnowledgeSource } from '../types';

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
  selectedFileCount: number;
  isLoading?: boolean;
  hasMore?: boolean;
  offset?: number;
  limit?: number;
  nextPageToken?: string;
}

const initialSourceState: SourceAuthState = {
  isAuthenticated: false,
  isConnecting: false,
  files: [],
  totalSize: 0,
  selectedSize: 0,
  selectedFileCount: 0,
  isLoading: false,
  hasMore: true,
  offset: 0,
  limit: 20,
  nextPageToken: undefined,
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

interface CreateAgentProps {
  isOnboarding?: boolean;
  onComplete?: () => void;
  onBack?: () => void;
  editMode?: boolean;
  agentId?: string;
}

interface Message {
  role: 'user' | 'system';
  content: string;
}

interface SlackChannel {
  id: string;
  name: string;
}

interface KnowledgeSourceFile {
  id: string;
  name: string;
  size: number;
  selected: boolean;
  type?: string;
  expanded?: boolean;
  hidden?: boolean;
  children?: KnowledgeSourceFile[];
}

const toggleFile = (sourceId: string, fileId: string, sourceState: Record<string, SourceAuthState>, setSourceState: React.Dispatch<React.SetStateAction<Record<string, SourceAuthState>>>) => {
  setSourceState(prev => {
    const source = prev[sourceId];
    if (!source) return prev;
    
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

    const newFiles = updateFileAndChildren([...source.files]);
    
    const calculateSelectedSize = (files: KnowledgeSourceFile[]): number => {
      return files.reduce((acc, file) => {
        if (file.selected) {
          if (file.children) {
            return acc + calculateSelectedSize(file.children);
          }
          return acc + (Number(file.size) || 0);
        }
        if (file.children) {
          return acc + calculateSelectedSize(file.children);
        }
        return acc;
      }, 0);
    };

    const calculateSelectedCount = (files: KnowledgeSourceFile[]): number => {
      return files.reduce((acc, file) => {
        if (file.selected && file.type !== 'folder') {
          acc++;
        }
        if (file.children) {
          acc += calculateSelectedCount(file.children);
        }
        return acc;
      }, 0);
    };

    const newSelectedSize = calculateSelectedSize(newFiles);
    const newSelectedCount = calculateSelectedCount(newFiles);

    return {
      ...prev,
      [sourceId]: {
        ...source,
        files: newFiles,
        selectedSize: newSelectedSize,
        selectedFileCount: newSelectedCount
      },
    };
  });
};

function formatBytes(bytes: number | undefined): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// Calculation helpers outside the component for stability
const calculateSelectedCount = (files: KnowledgeSourceFile[]): number => {
  return (Array.isArray(files) ? files : []).reduce((acc, file) => {
    if (file.selected && file.type !== 'folder') {
      acc++;
    }
    if (file.children) {
      acc += calculateSelectedCount(file.children);
    }
    return acc;
  }, 0);
};
const calculateSelectedSize = (files: KnowledgeSourceFile[]): number => {
  return (Array.isArray(files) ? files : []).reduce((acc, file) => {
    if (file.selected && file.type !== 'folder') {
      acc += Number(file.size) || 0;
    }
    if (file.children) {
      acc += calculateSelectedSize(file.children);
    }
    return acc;
  }, 0);
};

function CreateAgent({ isOnboarding = false, onComplete, onBack, editMode = false, agentId: initialAgentId }: CreateAgentProps) {
  const { agentId: urlAgentId } = useParams();
  const [currentStep, setCurrentStep] = React.useState(editMode ? 3 : 1);
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
  const [searchQueries, setSearchQueries] = React.useState<Record<string, string>>({});
  const [connectedAccounts, setConnectedAccounts] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const chatContainerRef = React.useRef<HTMLDivElement>(null);
  const [agentId, setAgentId] = React.useState<string | null>(initialAgentId || null);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [agentDetails, setAgentDetails] = React.useState<any>(null);
  const [isSaving, setIsSaving] = React.useState<Record<string, boolean>>({});
  const [fileErrors, setFileErrors] = React.useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = React.useState(editMode);
  const navigate = useNavigate();
  const [isSending, setIsSending] = React.useState(false);
  const [agentTypes, setAgentTypes] = React.useState<any[]>([]);
  const [isAgentTypesLoading, setIsAgentTypesLoading] = React.useState(false);

  // Use the latest agentId from state, URL, or prop
  const effectiveAgentId = agentId || urlAgentId || initialAgentId;

  // Load agent data when in edit mode
  React.useEffect(() => {
    const loadAgentData = async () => {
      if (!editMode || !effectiveAgentId) {
        setIsLoading(false);
        return;
      }

      console.log('Loading agent data for:', effectiveAgentId);
      setIsLoading(true);

      try {
        const token = await auth.currentUser?.getIdToken();
        console.log('Fetching agent details...');
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/agents/${effectiveAgentId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch agent details');
        }

        const agentData = await response.json();
        console.log('Agent data loaded:', agentData);
        setAgentDetails(agentData.data);
        setAgentId(effectiveAgentId);

        // Set basic information
        setFormData(prev => ({
          ...prev,
          name: agentData.data.name || '',
          type: agentData.data.type || '',
        }));

        // Handle Slack integration
        if (agentData.data.slack_integration) {
          setIsSlackConnected(true);
          setFormData(prev => ({
            ...prev,
            slackWorkspaceId: agentData.data.slack_integration.team_id || '',
          }));
          await fetchSlackChannels(effectiveAgentId);
          
          // Set selected channels
          if (agentData.data.slack_channels?.length > 0) {
            setFormData(prev => ({
              ...prev,
              slackChannels: agentData.data.slack_channels.map((channel: any) => channel.id),
            }));
          }
        }

        // Handle knowledge sources
        const sourcesToFetch: string[] = [];
        knowledgeSources.forEach(source => {
          const integrationKey = source.id === 'googleDrive' ? 'google_drive_integration' : `${source.id}_integration`;
          if (agentData.data[integrationKey]) {
            setSourceState(prev => ({
              ...prev,
              [source.id]: {
                ...prev[source.id],
                isAuthenticated: true,
                isConnecting: false,
              }
            }));
            if (agentData.data[integrationKey].account_info) {
              setConnectedAccounts(prev => ({
                ...prev,
                [source.id]: agentData.data[integrationKey].account_info
              }));
            }
            sourcesToFetch.push(source.id);
          }
        });
        sourcesToFetch.forEach(sourceId => fetchFilesForSource(sourceId));
      } catch (error) {
        console.error('Error loading agent data:', error);
        setError('Failed to load agent data. Please try again.');
      } finally {
        console.info(' setIsLoading(false);');
        setIsLoading(false);
      }
    };

    loadAgentData();
  }, [editMode, effectiveAgentId]);

  const handleSourceAuth = async (sourceId: string) => {
    if (sourceState[sourceId].isAuthenticated) return;
    try {
      if (!effectiveAgentId) {
        throw new Error('Agent ID is required to connect data source');
      }
      setSourceState(prev => ({
        ...prev,
        [sourceId]: {
          ...prev[sourceId],
          isConnecting: true,
          isLoading: true,
        }
      }));
      const integrationUrl = integrationService.getIntegrationUrl(sourceId, effectiveAgentId + ":" + auth.currentUser?.uid);
      window.location.href = integrationUrl;
    } catch (error) {
      console.error(`Error connecting to ${sourceId}:`, error);
      setError(`Failed to connect to ${sourceId}. Please try again.`);
      setSourceState(prev => ({
        ...prev,
        [sourceId]: {
          ...prev[sourceId],
          isConnecting: false,
          isLoading: false,
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
            setAgentDetails(agentData.data);
            
            if (sourceId === 'slack') {
              setFormData(prev => ({
                ...prev,
                slackWorkspaceId: agentData.data.slack_integration?.team_id || '',
              }));
              setIsSlackConnected(true);
              await fetchSlackChannels(agentIdFromPath);
              setCurrentStep(3);
            } else {
              setCurrentStep(4);

              const integrationKey = sourceId === 'googleDrive' ? 'google_drive_integration' : `${sourceId}_integration`;
              const integrationExists = agentData.data[integrationKey] !== undefined;

              setSourceState(prev => ({
                ...prev,
                [sourceId]: {
                  ...prev[sourceId],
                  isAuthenticated: integrationExists,
                  isConnecting: false,
                }
              }));

              if (integrationExists) {
                await fetchFilesForSource(sourceId);
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
      if (!effectiveAgentId) return;

      try {
        const token = await auth.currentUser?.getIdToken();
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/agents/${effectiveAgentId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch agent details');
        }

        const agentData = await response.json();
        setAgentDetails(agentData.data);

        const updatedSourceState = { ...sourceState };
        const updatedConnectedAccounts = { ...connectedAccounts };

        if (agentData.data.slack_integration) {
          setIsSlackConnected(true);
          setFormData(prev => ({
            ...prev,
            slackWorkspaceId: agentData.data.slack_integration.team_id || ''
          }));
          await fetchSlackChannels(effectiveAgentId);
        }

        knowledgeSources.forEach(source => {
          const integrationKey = source.id === 'googleDrive' ? 'google_drive_integration' : `${source.id}_integration`;
          if (agentData.data[integrationKey]) {
            updatedSourceState[source.id] = {
              ...updatedSourceState[source.id],
              isAuthenticated: true,
              isConnecting: false,
            };

            if (agentData.data[integrationKey].account_info) {
              updatedConnectedAccounts[source.id] = agentData.data[integrationKey].account_info;
            }
          }
        });

        setSourceState(updatedSourceState);
        setConnectedAccounts(updatedConnectedAccounts);

        if (currentStep === 4) {
          await fetchFilesForConnectedSources(effectiveAgentId, updatedSourceState);
        }
      } catch (error) {
        console.error('Error checking initial integration state:', error);
      }
    };

    const calculateTotalSize = (files: KnowledgeSourceFile[]): number => {
      return files.reduce((acc, file) => {
        const fileSize = Number(file.size) || 0;
        if (file.children) {
          return acc + fileSize + calculateTotalSize(file.children);
        }
        return acc + fileSize;
      }, 0);
    };

    const fetchFilesForConnectedSources = async (agentId: string, sourceState: Record<string, SourceAuthState>) => {
      try {
        const token = await auth.currentUser?.getIdToken();
        
        for (const [sourceId, state] of Object.entries(sourceState)) {
          setSourceState(prev => ({
            ...prev,
            [sourceId]: {
              ...prev[sourceId],
              isLoading: true
            }
          }));
          if (state.isAuthenticated && sourceId !== 'slack') {
            const filesResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/agents/${agentId}/${sourceId}/files`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });

            if (filesResponse.ok) {
              const filesData = await filesResponse.json();
              const files = filesData.files || [];
              
              // Ensure all files have the required properties
              const processedFiles = files.map((file: KnowledgeSourceFile) => ({
                ...file,
                selected: file.selected || false,
                expanded: file.expanded || false,
                size: Number(file.size) || 0,
                children: file.children ? file.children.map((child: KnowledgeSourceFile) => ({
                  ...child,
                  selected: child.selected || false,
                  size: Number(child.size) || 0,
                })) : undefined,
              }));

              const totalSize = calculateTotalSize(processedFiles);
              
              setSourceState(prev => ({
                ...prev,
                [sourceId]: {
                  ...prev[sourceId],
                  files: processedFiles,
                  totalSize: totalSize,
                  selectedSize: 0,
                  isLoading: false
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
  }, [effectiveAgentId, currentStep]);

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
      
      if (!effectiveAgentId) {
        throw new Error('Agent ID is required to connect to Slack');
      }
      
      const slackIntegrationUrl = integrationService.getIntegrationUrl('slack', effectiveAgentId+":"+auth.currentUser?.uid);
      window.location.href = slackIntegrationUrl;
    } catch (error) {
      console.error('Error connecting to Slack:', error);
      setError('Failed to connect to Slack. Please try again.');
    } finally {
      setIsConnectingSlack(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    setIsSending(true);

    // Get agent ID from URL if not available in state
    const pathParts = window.location.pathname.split('/');
    const agentIdFromPath = pathParts[pathParts.indexOf('agents') + 1];
    const effectiveAgentId = agentId || agentIdFromPath;

    if (!effectiveAgentId) {
      setError('Agent ID is missing. Please complete agent setup first.');
      setIsSending(false);
      return;
    }

    // Optimistically add the user's message to the chat
    const newUserMessage: Message = { role: 'user', content: inputMessage };
    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');

    try {
      const token = await auth.currentUser?.getIdToken();
      // Use the new message history including the just-added user message
      const updatedMessages = [...messages, newUserMessage];
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          agent_id: effectiveAgentId,
          messages: updatedMessages 
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'system', content: data.answer || data.reply }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error instanceof Error ? error.message : 'Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleNext = async () => {
    // Step 2: After name and type selection, create draft agent if not already created
    if (currentStep === 2 && !editMode && !agentId) {
      if (!formData.type) {
        setError('Type is required');
        return;
      }

      try {
        setIsSubmitting(true);
        setError(null);
        const token = await auth.currentUser?.getIdToken();
        
        // Create draft agent with name and type
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
          if (response.status === 403) {
            setError('You have reached the maximum number of agents allowed in your plan');
            setIsSubmitting(false);
            return;
          }
          const data = await response.json();
          throw new Error(data.detail || 'Failed to create draft agent');
        }

        const data = await response.json();
        setAgentId(data.agent_id);
        setAgentDetails(data);
        setCurrentStep(3);
      } catch (error) {
        setError('Failed to create agent. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // If we have an agentId (either from initial creation or edit mode), use PATCH to update
    if ((currentStep === 1 || currentStep === 2) && agentId) {
      try {
        setIsSubmitting(true);
        setError(null);


        const token = await auth.currentUser?.getIdToken();
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/agents/${agentId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            type: formData.type,
          }),
        });
        if (!response.ok) {
          throw new Error('Failed to update agent details');
        }
        // Update local state with the response
        const updatedAgent = await response.json();
        setAgentDetails(updatedAgent);
      } catch (error) {
        setIsSubmitting(false);
        setError('Failed to update agent details. Please try again.');
        return;
      } finally {
        setIsSubmitting(false);
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

  // On final save, PATCH the agent and set status to 'active'
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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

      const payload = {
        name: agentDetails.name,
        type: agentDetails.type,
        status: 'active',
        configuration: {
          channels: formData.slackChannels,
          workspaces: formData.slackWorkspaceId ? [formData.slackWorkspaceId] : [],
          knowledge_sources: knowledgeSourcesPayload,
        },
      };

      if (!agentId) {
        setError('Agent ID is missing. Please complete the previous steps.');
        setIsSubmitting(false);
        return;
      }

      const url = `${import.meta.env.VITE_API_BASE_URL}/agents/${agentId}`;
      const method = 'PATCH';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Try to parse and show the backend error detail
        try {
          const data = await response.json();
          if (data && data.detail) {
            setError(data.detail);
            return;
          }
        } catch {}
        throw new Error('Failed to update agent');
      }

      // Redirect to agents dashboard after successful save
      navigate('/dashboard/agents', { replace: true });

      if (onComplete) {
        onComplete();
      }
    } catch (error: any) {
      console.error('Error saving agent:', error);
      if (error && error.detail) {
        setError(error.detail);
      } else if (typeof error === 'string') {
        setError(error);
      } else if (error instanceof Error && error.message) {
        setError(error.message);
      } else {
        setError('Failed to save agent. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSelectedFiles = (files: KnowledgeSourceFile[]): KnowledgeSourceFile[] => {
    return (Array.isArray(files) ? files : []).reduce<KnowledgeSourceFile[]>((acc, file) => {
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
    } else {
      if (onBack) {
        onBack();
      } else {
        navigate('/dashboard/agents', { replace: true });
      }
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
    if (!query) return Array.isArray(files) ? files : [];
    
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
          value={(Array.isArray(source.files) ? source.files : []).filter(f => f.selected)} 
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
                {(Array.isArray(source.files) ? source.files : []).filter(f => f.selected).length} files selected
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </span>
            </Listbox.Button>
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {(Array.isArray(source.files) ? source.files : []).map((file) => renderFile(file, sourceId))}
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
      {isAgentTypesLoading ? (
        <div className="text-center text-gray-500">Loading agent types...</div>
      ) : agentTypes.length === 0 ? (
        <div className="text-center text-gray-500">No agent types found.</div>
      ) : (
        agentTypes.map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => {
              setFormData(prev => ({ ...prev, type: type.id }));
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
        ))
      )}
    </div>
  );

  const renderKnowledgeSources = () => (
    <div className="space-y-6 max-w-3xl">
      <div className="grid grid-cols-1 gap-4">
        {knowledgeSources.map((source) => (
          <div
            key={source.id}
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
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
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
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!sourceState[source.id].isAuthenticated) {
                      handleSourceAuth(source.id);
                    }
                  }}
                  className="text-sm text-[#4A154B]"
                >
                  Click to connect
                </button>
              )}
            </div>

            {sourceState[source.id].isAuthenticated && (
              <div className="mt-6 space-y-4">
                {sourceState[source.id].isLoading ? (
                  <div className="flex flex-col items-center justify-center space-y-2 py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-[#4A154B]" />
                    <p className="text-sm text-gray-500">Loading files...</p>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder={`Search ${source.name} documents...`}
                        value={searchQueries[source.id] || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          setSearchQueries(prev => ({ ...prev, [source.id]: value }));
                        }}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A154B] focus:border-transparent"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    {fileErrors[source.id] && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
                        {fileErrors[source.id]}
                      </div>
                    )}

                    <div className="bg-white rounded-lg border border-gray-200 max-h-[300px] overflow-y-auto" onScroll={e => handleFilesScroll(e, source.id)}>
                      <div className="p-4">
                        {(() => { console.log('RENDER:', source.id, sourceState[source.id]?.isLoading, sourceState[source.id]?.files?.length); return null; })()}
                        {sourceState[source.id].isLoading ? (
                          <div className="flex flex-col items-center justify-center space-y-2 py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-[#4A154B]" />
                            <p className="text-sm text-gray-500">Loading files...</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {(Array.isArray(sourceState[source.id].files) ? filterFiles(sourceState[source.id].files, searchQueries[source.id] || '') : []).map(file => (
                              <div
                                key={file.id}
                                className={`flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer ${sourceState[source.id].isLoading ? 'opacity-50 pointer-events-none' : ''}`}
                                onClick={() => !sourceState[source.id].isLoading && toggleFile(source.id, file.id, sourceState, setSourceState)}
                              >
                                <input
                                  type="checkbox"
                                  checked={file.selected || false}
                                  disabled={sourceState[source.id].isLoading}
                                  onChange={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (!sourceState[source.id].isLoading) toggleFile(source.id, file.id, sourceState, setSourceState);
                                  }}
                                  className="h-4 w-4 text-[#4A154B] border-gray-300 rounded focus:ring-[#4A154B]"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {file.name}
                                  </p>
                                  {file.type !== 'folder' && (
                                    <p className="text-xs text-gray-500">
                                      {formatBytes(file.size)}
                                    </p>
                                  )}
                                </div>
                                {file.selected && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                    Saved
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {!sourceState[source.id].isLoading && sourceState[source.id].hasMore && (
                      <div className="flex justify-center py-2">
                        <button
                          type="button"
                          onClick={() => fetchFilesForSource(source.id, true, searchQueries[source.id] || '')}
                          className="px-4 py-2 text-sm font-medium text-white bg-[#4A154B] rounded-lg hover:bg-[#611f69]"
                          disabled={sourceState[source.id].isLoading}
                        >
                          Load More
                        </button>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        Selected: {sourceState[source.id].selectedFileCount} Files ({formatBytes(sourceState[source.id].selectedSize)})
                      </span>
                      <span className="text-gray-500">
                        Total available: {calculateFileCount(sourceState[source.id].files)} Files
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSaveFiles(source.id)}
                      disabled={isSaving[source.id] || sourceState[source.id].selectedFileCount === 0}
                      className="w-full px-4 py-2 text-sm font-medium text-white bg-[#4A154B] rounded-lg hover:bg-[#611f69] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving[source.id] ? (
                        <div className="flex items-center justify-center">
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </div>
                      ) : (
                        'Save Selection'
                      )}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
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
        {currentStep !== 4 && currentStep !== 5 && (
          <button
            type="button"
            onClick={handleBack}
            className="mr-4 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Back
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
    </div>
  );

  const renderTestAgent = () => (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Test Your Agent</h3>
        <p className="text-sm text-gray-500 mt-1">
          Ask your agent a question to see how it responds.
        </p>
      </div>
      <div className="border rounded-lg p-4 h-64 overflow-y-auto">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-2 ${message.role === 'user' ? 'text-right' : 'text-left'}`}
          >
            <span
              className={`inline-block p-2 rounded-lg ${
                message.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'
              }`}
            >
              {message.content}
            </span>
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          className="flex-1 border rounded-l-lg p-2"
          placeholder="Type your question here..."
        />
        <button
          onClick={handleSendMessage}
          disabled={isSending}
          className="bg-[#4A154B] text-white px-4 py-2 rounded-r-lg"
        >
          {isSending ? 'Sending...' : 'Send'}
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

  const calculateFileCount = (files: KnowledgeSourceFile[]): number => {
    return (Array.isArray(files) ? files : []).reduce((acc: number, file: KnowledgeSourceFile) => {
      if (file.children) {
        return acc + calculateFileCount(file.children);
      }
      return acc + 1;
    }, 0);
  };

  const handleSaveFiles = async (sourceId: string) => {
    try {
      setIsSaving(prev => ({ ...prev, [sourceId]: true }));
      setFileErrors(prev => ({ ...prev, [sourceId]: '' }));
      
      const token = await auth.currentUser?.getIdToken();
      const selectedFiles = getSelectedFiles(sourceState[sourceId].files);
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/agents/${agentId}/${sourceId}/files`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ files: selectedFiles }),
      });

      if (!response.ok) {
        throw new Error('Failed to save files');
      }

      const data = await response.json();
      if (data.status === 'success') {
        // Update the files to show they are saved
        setSourceState(prev => ({
          ...prev,
          [sourceId]: {
            ...prev[sourceId],
            files: prev[sourceId].files.map(file => ({
              ...file,
              selected: selectedFiles.some(f => f.id === file.id) ? true : file.selected
            }))
          }
        }));
      } else {
        throw new Error(data.message || 'Failed to save files');
      }
    } catch (error) {
      console.error('Error saving files:', error);
      setFileErrors(prev => ({ 
        ...prev, 
        [sourceId]: `Failed to save files: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }));
    } finally {
      setIsSaving(prev => ({ ...prev, [sourceId]: false }));
    }
  };

  const fetchFilesForSource = async (sourceId: string, append = false, searchQueryParam?: string) => {
    try {
      if (!effectiveAgentId) {
        throw new Error('Agent ID is required to fetch files');
      }
      const source = sourceState[sourceId];
      const offset = append ? (source.offset || 0) : 0;
      const limit = source.limit || 20;
      const nextPageToken = append ? source.nextPageToken : undefined;
      const query = typeof searchQueryParam === 'string' ? searchQueryParam : searchQueries[sourceId] || '';
      setSourceState(prev => ({
        ...prev,
        [sourceId]: {
          ...prev[sourceId],
          isLoading: true,
        }
      }));
      console.log('[fetchFilesForSource] isLoading set to true for', sourceId);
      const token = await auth.currentUser?.getIdToken();
      let url = `${import.meta.env.VITE_API_BASE_URL}/agents/${effectiveAgentId}/${sourceId}/files?limit=${limit}`;
      if (sourceId === 'googleDrive' && nextPageToken) {
        url += `&page_token=${encodeURIComponent(nextPageToken)}`;
      } else if (nextPageToken) {
        url += `&page_token=${encodeURIComponent(nextPageToken)}`;
      } else if (append) {
        url += `&offset=${offset}`;
      }
      if (query) {
        url += `&search_query=${encodeURIComponent(query)}`;
      }
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`No files found for ${sourceId}`);
        }
        throw new Error('Failed to fetch files');
      }
      const data = await response.json();
       
      const previouslySelectedFiles = editMode && agentDetails?.configuration?.knowledge_sources
        ?.find((source: any) => source.type === sourceId)?.files || [];
      const selectedFilesMap = new Map(
        previouslySelectedFiles.map((file: any) => [file.id, file])
      );
      const processedFiles = (data.files || []).map((file: KnowledgeSourceFile) => {
        const isSelected = selectedFilesMap.has(file.id);
        return {
          ...file,
          selected: isSelected,
          expanded: file.expanded || false,
          size: Number(file.size) || 0,
          children: file.children ? file.children.map((child: KnowledgeSourceFile) => {
            const isChildSelected = selectedFilesMap.has(child.id);
            return {
              ...child,
              selected: isChildSelected,
              size: Number(child.size) || 0,
            };
          }) : undefined,
        };
      });
      const allFiles = append ? [...source.files, ...processedFiles] : processedFiles;
      const selectedFileCount = calculateSelectedCount(allFiles);
      const selectedSize = calculateSelectedSize(allFiles);
      const totalSize = data.total_size || 0;
      const newNextPageToken = data.nextPageToken || data.next_page_token;
      const hasMore = !!newNextPageToken || (data.pagination && (data.pagination.offset + data.pagination.limit < data.pagination.total));
      setSourceState(prev => ({
        ...prev,
        [sourceId]: {
          ...prev[sourceId],
          files: allFiles,
          totalSize: totalSize,
          selectedSize: selectedSize,
          selectedFileCount: selectedFileCount,
          isLoading: false,
          hasMore: hasMore,
          offset: append ? (offset + limit) : limit,
          nextPageToken: newNextPageToken,
        }
      }));
      console.log('[fetchFilesForSource] Files loaded for', sourceId, 'isLoading set to false, files:', allFiles.length);
     
      if (data.account_info) {
        setConnectedAccounts(prev => ({
          ...prev,
          [sourceId]: data.account_info
        }));
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      setFileErrors(prev => ({ 
        ...prev, 
        [sourceId]: `Failed to fetch files: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }));
   
      console.log('[fetchFilesForSource] Error for', sourceId, 'isLoading set to false');
    }
  };

  // Forced recalculation effect for selected count and size
  React.useEffect(() => {
    Object.entries(sourceState).forEach(([sourceId, state]) => {
      if (state.files && state.files.length > 0) {
        const selectedFileCount = calculateSelectedCount(state.files);
        const selectedSize = calculateSelectedSize(state.files);
        if (
          state.selectedFileCount !== selectedFileCount ||
          state.selectedSize !== selectedSize
        ) {
          setSourceState(prev => ({
            ...prev,
            [sourceId]: {
              ...prev[sourceId],
              selectedFileCount,
              selectedSize,
            }
          }));
        }
      }
    });
  }, [sourceState]);

  React.useEffect(() => {
    if (currentStep === 2) {
      setIsAgentTypesLoading(true);
      (async () => {
        try {
          const token = await auth.currentUser?.getIdToken();
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/agent-types`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          const data = await response.json();
          const types = Array.isArray(data.agent_types) ? data.agent_types : [];
          setAgentTypes(types);

          // In edit mode, ensure the current type is selected if not already
          if (editMode && agentDetails && agentDetails.type) {
            setFormData(prev => ({ ...prev, type: agentDetails.type }));
          }
        } catch (e) {
          console.error('Error loading agent types:', e);
          setAgentTypes([]);
        } finally {
          setIsAgentTypesLoading(false);
        }
      })();
    }
  }, [currentStep, editMode, agentDetails]);

  // Debug log for form data changes
  React.useEffect(() => {
    console.log('Form data updated:', formData);
  }, [formData]);

  // Add navigation guard for sidebar Agents link
  React.useEffect(() => {
    const handleSidebarClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a[href="/dashboard/agents"]')) {
        e.preventDefault();
        navigate('/dashboard/agents', { replace: true });
      }
    };
    document.addEventListener('click', handleSidebarClick);
    return () => document.removeEventListener('click', handleSidebarClick);
  }, [navigate]);

  // Comment out auto-pagination on scroll for files list
  const handleFilesScroll = (e: React.UIEvent<HTMLDivElement>, sourceId: string) => {
    // const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // const source = sourceState[sourceId];
    // if (!source.isLoading && source.hasMore && scrollTop + clientHeight >= scrollHeight - 40) {
    //   fetchFilesForSource(sourceId, true, searchQueries[sourceId] || '');
    // }
    // Auto-pagination on scroll is disabled for now.
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center relative">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#4A154B]" />
          <p className="text-gray-600">Loading agent data...</p>
        </div>
      ) : (
        <>
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
                {editMode ? "Edit Agent" : (isOnboarding ? "Welcome! Let's Create Your First Agent" : "Create New Agent")}
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

            {currentStep !== 5 ? (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div>{renderStep()}</div>
                {currentStep !== 4 && currentStep !== 5 && (
                  <div className="flex justify-end pt-6">
                    {currentStep === 1 ? (
                      <button
                        type="button"
                        onClick={handleBack}
                        className="mr-4 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleBack}
                        className="mr-4 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Back
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
              </form>
            ) : (
              <>
                {renderTestAgent()}
                <div className="flex justify-end pt-6">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="mr-4 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubmit()}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#4A154B] rounded-lg hover:bg-[#611f69] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default CreateAgent;