import React from 'react';
import { Bot, MessageSquare, Database, Zap, Settings as SettingsIcon, Check, X, ChevronDown, ChevronRight, Search, ThumbsUp, ThumbsDown, User, Clock, Loader2, Plus, AlertCircle } from 'lucide-react';

interface AgentDetailProps {
  agentId: number;
  onClose: () => void;
}

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  user?: {
    name: string;
    avatar: string;
  };
  rating?: 'positive' | 'negative';
  source?: string;
}

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

interface SyncStatus {
  lastSync: Date;
  status: 'syncing' | 'synced' | 'error';
  progress?: number;
}

interface SourceAuthState {
  isAuthenticated: boolean;
  isConnecting: boolean;
  files: KnowledgeSourceFile[];
  totalSize: number;
  selectedSize: number;
  syncStatus?: SyncStatus;
}

const initialSourceState: SourceAuthState = {
  isAuthenticated: false,
  isConnecting: false,
  files: [],
  totalSize: 0,
  selectedSize: 0,
};

const knowledgeSources = [
  {
    id: 'gdrive',
    name: 'Google Drive',
    icon: Database,
    description: 'Connect your Google Drive files and folders',
  },
  {
    id: 'notion',
    name: 'Notion',
    icon: Database,
    description: 'Use your Notion workspace as knowledge source',
  },
  {
    id: 'clickup',
    name: 'ClickUp',
    icon: Database,
    description: 'Connect to your ClickUp workspace',
  },
  {
    id: 'confluence',
    name: 'Jira Confluence',
    icon: Database,
    description: 'Access your Confluence pages and documentation',
  },
];

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

const mockAgent = {
  name: 'HR Assistant',
  channel: '#hr-support',
  status: 'Enabled',
  analytics: {
    messagesAnswered: '847',
    usersHelped: '156',
    timeSaved: '128',
    feedbackStats: {
      positive: 92,
      negative: 8,
      total: 100,
    },
    topTopics: ['Benefits', 'Time Off', 'Policies'],
    knowledgeSources: ['Notion', 'Google Drive'],
    lastActive: '5 mins ago',
    monthlyTrends: [65, 72, 84, 78, 90, 85, 88, 92, 89, 94, 98, 95],
    dailyMessages: [12, 15, 18, 14, 20, 16, 19],
  },
  messages: Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    question: 'What is our parental leave policy?',
    answer: 'Our parental leave policy provides 16 weeks of paid leave for primary caregivers and 4 weeks for secondary caregivers.',
    timestamp: new Date(Date.now() - i * 3600000).toISOString(),
    source: 'HR Policy Document',
    user: {
      name: `User ${i + 1}`,
      avatar: `https://i.pravatar.cc/40?img=${i + 1}`,
    },
    rating: i % 3 === 0 ? 'positive' : i % 3 === 1 ? 'negative' : undefined,
  })),
  sources: [
    {
      name: 'HR Policies (Notion)',
      type: 'Notion',
      status: 'Synced',
      lastSync: '1 hour ago',
      syncedBytes: 47000,
      totalBytes: 400000,
      syncedResources: 10,
      totalResources: 25,
    },
    {
      name: 'Employee Handbook (Google Drive)',
      type: 'Google Drive',
      status: 'Synced',
      lastSync: '2 hours ago',
      syncedBytes: 250000,
      totalBytes: 500000,
      syncedResources: 15,
      totalResources: 30,
    },
  ],
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

const tabs = [
  { name: 'Overview', icon: Bot },
  { name: 'Messages', icon: MessageSquare },
  { name: 'Knowledge Sources', icon: Database },
  { name: 'Test Agent', icon: Zap },
  { name: 'Settings', icon: SettingsIcon },
];

const agentTemplates = [
  {
    id: 'hr',
    name: 'HR & People Ops Assistant',
    description: 'Handle employee questions about policies, benefits, and procedures',
    instructions: `As an HR Assistant, your role is to:
1. Answer questions about company policies, benefits, and procedures
2. Help employees with time-off requests and attendance policies
3. Provide information about health insurance and other benefits
4. Guide employees through HR-related processes
5. Maintain confidentiality and privacy of employee information`,
  },
  {
    id: 'product',
    name: 'Product Knowledge Agent',
    description: 'Answer questions about product features, updates, and documentation',
    instructions: `As a Product Knowledge Agent, your role is to:
1. Provide detailed information about product features and capabilities
2. Help users understand product updates and new releases
3. Guide users through product documentation
4. Assist with troubleshooting common issues
5. Collect and relay feature requests and feedback`,
  },
  {
    id: 'sales',
    name: 'Sales Enablement Copilot',
    description: 'Support sales team with product information and pricing details',
    instructions: `As a Sales Enablement Copilot, your role is to:
1. Provide accurate pricing information and deal structures
2. Share competitive analysis and positioning
3. Help with proposal and quote generation
4. Guide sales team through product features and benefits
5. Assist with customer objection handling`,
  },
  {
    id: 'support',
    name: 'Internal Support Agent',
    description: 'Provide technical support and troubleshooting assistance',
    instructions: `As an Internal Support Agent, your role is to:
1. Help resolve technical issues and provide troubleshooting steps
2. Guide users through common support processes
3. Document and track support tickets
4. Escalate complex issues to appropriate teams
5. Share best practices and preventive measures`,
  },
];

function AgentDetail({ agentId, onClose }: AgentDetailProps) {
  const [activeTab, setActiveTab] = React.useState('Overview');
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [inputMessage, setInputMessage] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [sourceState, setSourceState] = React.useState<Record<string, SourceAuthState>>({
    gdrive: { ...initialSourceState },
    notion: { ...initialSourceState },
    clickup: { ...initialSourceState },
    confluence: { ...initialSourceState },
  });
  const [connectedAccounts, setConnectedAccounts] = React.useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = React.useState(false);
  const [hasChanges, setHasChanges] = React.useState(false);
  const [showTemplates, setShowTemplates] = React.useState(false);
  const [instructions, setInstructions] = React.useState('');
  const [isSettingsSaved, setIsSettingsSaved] = React.useState(false);
  
  const chatContainerRef = React.useRef<HTMLDivElement>(null);
  const messagesPerPage = 10;

  React.useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
      user: {
        name: 'You',
        avatar: 'https://i.pravatar.cc/40?img=1',
      },
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'Based on our HR policies, I can help you with that. ' + inputMessage,
        timestamp: new Date(),
        source: 'HR Policy Document',
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSourceAuth = async (sourceId: string) => {
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

  const toggleFile = (sourceId: string, fileId: string) => {
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

  const handleRateMessage = (messageId: string, rating: 'positive' | 'negative') => {
    setMessages(prev => prev.map(message => 
      message.id === messageId ? { ...message, rating } : message
    ));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    setIsSettingsSaved(true);
    setTimeout(() => setIsSettingsSaved(false), 3000);
  };

  const handleApplyTemplate = (template: typeof agentTemplates[0]) => {
    setInstructions(template.instructions);
    setShowTemplates(false);
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Messages Answered</h3>
            <MessageSquare className="w-5 h-5 text-[#4A154B]" />
          </div>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{mockAgent.analytics.messagesAnswered}</p>
          <div className="mt-2 text-sm text-gray-500">
            +12% from last month
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Users Helped</h3>
            <User className="w-5 h-5 text-[#4A154B]" />
          </div>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{mockAgent.analytics.usersHelped}</p>
          <div className="mt-2 text-sm text-gray-500">
            +8% from last month
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Time Saved (hours)</h3>
            <Clock className="w-5 h-5 text-[#4A154B]" />
          </div>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{mockAgent.analytics.timeSaved}</p>
          <div className="mt-2 text-sm text-gray-500">
            +15% from last month
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">User Satisfaction</h3>
            <ThumbsUp className="w-5 h-5 text-[#4A154B]" />
          </div>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {mockAgent.analytics.feedbackStats.positive}%
          </p>
          <div className="mt-2 text-sm text-gray-500">
            Based on {mockAgent.analytics.feedbackStats.total} ratings
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Trend</h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {mockAgent.analytics.monthlyTrends.map((value, index) => (
              <div
                key={index}
                className="w-full bg-[#4A154B]/20 rounded-t"
                style={{ height: `${value}%` }}
              />
            ))}
          </div>
          <div className="mt-4 flex justify-between text-sm text-gray-500">
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
            <span>Jul</span>
            <span>Aug</span>
            <span>Sep</span>
            <span>Oct</span>
            <span>Nov</span>
            <span>Dec</span>
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Messages</h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {mockAgent.analytics.dailyMessages.map((value, index) => (
              <div
                key={index}
                className="w-full bg-[#4A154B]/20 rounded-t"
                style={{ height: `${(value / Math.max(...mockAgent.analytics.dailyMessages)) * 100}%` }}
              />
            ))}
          </div>
          <div className="mt-4 flex justify-between text-sm text-gray-500">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        </div>
        <div className="border-t border-gray-200">
          <div className="divide-y divide-gray-200">
            {mockAgent.messages.slice(0, 5).map((message) => (
              <div key={message.id} className="p-4">
                <div className="flex items-start space-x-4">
                  <img
                    src={message.user?.avatar}
                    alt={message.user?.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{message.user?.name}</p>
                    <p className="text-sm text-gray-500">{message.question}</p>
                    <div className="mt-2 text-sm text-gray-700">{message.answer}</div>
                    <div className="mt-2 flex items-center text-xs text-gray-500">
                      <span>{new Date(message.timestamp).toLocaleString()}</span>
                      <span className="mx-2">•</span>
                      <span>Source: {message.source}</span>
                      {message.rating && (
                        <>
                          <span className="mx-2">•</span>
                          <span className={message.rating === 'positive' ? 'text-green-600' : 'text-red-600'}>
                            {message.rating === 'positive' ? 'Helpful' : 'Not helpful'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderMessages = () => {
    const startIndex = (currentPage - 1) * messagesPerPage;
    const endIndex = startIndex + messagesPerPage;
    const totalPages = Math.ceil(mockAgent.messages.length / messagesPerPage);

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Message History</h3>
              <div className="flex items-center space-x-2">
                <select className="rounded-lg border border-gray-300 text-sm">
                  <option>All Messages</option>
                  <option>Positive Feedback</option>
                  <option>Negative Feedback</option>
                  <option>No Feedback</option>
                </select>
                <button className="px-4 py-2 text-sm font-medium text-[#4A154B] bg-white border border-[#4A154B] rounded-lg hover:bg-[#4A154B]/5">
                  Export
                </button>
              </div>
            </div>
            <div className="mt-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search messages..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-[#4A154B] focus:border-[#4A154B]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {mockAgent.messages.slice(startIndex, endIndex).map((message) => (
              <div key={message.id} className="p-4">
                <div className="flex items-start space-x-4">
                  <img
                    src={message.user?.avatar}
                    alt={message.user?.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{message.user?.name}</p>
                        <p className="text-sm text-gray-500">{message.question}</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(message.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="mt-2 text-sm text-gray-700">{message.answer}</div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        Source: {message.source}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleRateMessage(message.id.toString(), 'positive')}
                          className={`p-1 rounded ${
                            message.rating === 'positive'
                              ? 'text-green-600 bg-green-50'
                              : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                          }`}
                        >
                          <ThumbsUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRateMessage(message.id.toString(), 'negative')}
                          className={`p-1 rounded ${
                            message.rating === 'negative'
                              ? 'text-red-600 bg-red-50'
                              : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                          }`}
                        >
                          <ThumbsDown className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {startIndex + 1} to {Math.min(endIndex, mockAgent.messages.length)} of {mockAgent.messages.length} messages
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 text-sm rounded ${
                      currentPage === page
                        ? 'bg-[#4A154B] text-white'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {page}
                  
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderKnowledgeSources = () => {
    const totalSyncedData = Object.values(sourceState).reduce(
      (acc, source) => acc + (source.selectedSize || 0),
      0
    );

    const lastSyncTime = Object.values(sourceState)
      .map(source => source.syncStatus?.lastSync)
      .filter(Boolean)
      .sort((a, b) => b!.getTime() - a!.getTime())[0];

    const handleSaveChanges = async () => {
      setIsSaving(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSaving(false);
      setHasChanges(false);
    };

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Knowledge Base Summary</h3>
                <p className="text-sm text-gray-500 mt-1">Overview of your connected knowledge sources</p>
              </div>
              {hasChanges && (
                <button
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#4A154B] rounded-lg hover:bg-[#611f69] disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              )}
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-500">Total Synced Data</h4>
                <p className="mt-2 text-2xl font-semibold text-gray-900">{formatBytes(totalSyncedData)}</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-500">Connected Sources</h4>
                <p className="mt-2 text-2xl font-semibold text-gray-900">
                  {Object.values(sourceState).filter(source => source.isAuthenticated).length} of {knowledgeSources.length}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-500">Last Sync</h4>
                <p className="mt-2 text-2xl font-semibold text-gray-900">
                  {lastSyncTime ? new Date(lastSyncTime).toLocaleString() : 'Never'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Connected Sources</h3>
                <p className="text-sm text-gray-500 mt-1">Manage your knowledge sources</p>
              </div>
              <button 
                onClick={() => {
                  const sourceToConnect = knowledgeSources.find(source => 
                    !sourceState[source.id].isAuthenticated
                  );
                  if (sourceToConnect) {
                    handleSourceAuth(sourceToConnect.id);
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-[#4A154B] rounded-lg hover:bg-[#611f69] flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Connect Source
              </button>
            </div>
          </div>
          
          <div className="border-t border-gray-200">
            <div className="p-6 space-y-6">
              {knowledgeSources.map((source) => (
                <div
                  key={source.id}
                  className={`w-full p-6 rounded-lg border transition-colors ${
                    sourceState[source.id].isAuthenticated
                      ? 'border-[#4A154B] bg-[#4A154B]/5'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-[#4A154B]/10 rounded-lg">
                        <source.icon className="w-6 h-6 text-[#4A154B]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{source.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{source.description}</p>
                        {sourceState[source.id].isAuthenticated && (
                          <div className="flex items-center mt-2 space-x-4">
                            <p className="text-sm text-[#4A154B]">
                              Connected as {connectedAccounts[source.id]}
                            </p>
                            {sourceState[source.id].syncStatus && (
                              <p className="text-sm text-gray-500">
                                Last synced: {sourceState[source.id].syncStatus.lastSync.toLocaleString()}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {sourceState[source.id].isAuthenticated ? (
                        <>
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <Check className="w-4 h-4 mr-1" />
                              Connected
                            </span>
                            {sourceState[source.id].syncStatus?.status === 'syncing' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                Syncing
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              setSourceState(prev => ({
                                ...prev,
                                [source.id]: initialSourceState,
                              }));
                              setConnectedAccounts(prev => {
                                const newAccounts = { ...prev };
                                delete newAccounts[source.id];
                                return newAccounts;
                              });
                              setHasChanges(true);
                            }}
                            className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            Disconnect
                          </button>
                        </>
                      ) : sourceState[source.id].isConnecting ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="w-5 h-5 animate-spin text-[#4A154B]" />
                          <span className="text-sm text-gray-500">Connecting...</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleSourceAuth(source.id)}
                          className="px-4 py-2 text-sm font-medium text-[#4A154B] border border-[#4A154B] rounded-lg hover:bg-[#4A154B]/5"
                        >
                          Connect
                        </button>
                      )}
                    </div>
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
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

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
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900">Agent Configuration</h3>
          <p className="text-sm text-gray-500 mt-1">Manage your agent's settings and behavior.</p>
        </div>
        
        <div className="border-t border-gray-200 p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Agent Name</label>
            <input
              type="text"
              defaultValue={mockAgent.name}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#4A154B] focus:ring-[#4A154B]"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Slack Channel</label>
            <input
              type="text"
              defaultValue={mockAgent.channel}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#4A154B] focus:ring-[#4A154B]"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <div className="mt-1">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  defaultChecked={mockAgent.status === 'Enabled'}
                  className="rounded border-gray-300 text-[#4A154B] focus:ring-[#4A154B]"
                />
                <span className="ml-2 text-sm text-gray-700">Enable agent</span>
              </label>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">Agent Instructions</label>
              <button
                onClick={() => setShowTemplates(true)}
                className="text-sm text-[#4A154B] hover:text-[#611f69]"
              >
                Use Template
              </button>
            </div>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={8}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#4A154B] focus:ring-[#4A154B]"
              placeholder="Enter instructions for how the agent should behave and respond..."
            />
            <p className="mt-2 text-sm text-gray-500">
              These instructions will guide how your agent interprets and responds to messages.
            </p>
          </div>

          <div className="pt-4">
            <button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-white bg-[#4A154B] rounded-lg hover:bg-[#611f69] disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                'Save Changes'
              )}
            </button>

            {isSettingsSaved && (
              <div className="mt-4 p-4 rounded-lg bg-green-50 flex items-start">
                <Check className="w-5 h-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-700">
                  Settings saved successfully! Your changes have been applied.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-red-50 rounded-xl border border-red-200 p-6">
        <h3 className="text-lg font-medium text-red-700 mb-4">Danger Zone</h3>
        <div className="space-y-4">
          <button className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">
            Delete Agent
          </button>
        </div>
      </div>

      {showTemplates && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Agent Templates</h2>
                <button
                  onClick={() => setShowTemplates(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {agentTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleApplyTemplate(template)}
                  className="w-full p-4 text-left rounded-lg border border-gray-200 hover:border-[#4A154B] hover:bg-[#4A154B]/5 transition-colors"
                >
                  <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                </button>
              ))}
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-[#4A154B] mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-600">
                  Applying a template will replace your current agent instructions. You can modify the instructions after applying the template.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'Overview':
        return renderOverview();
      case 'Messages':
        return renderMessages();
      case 'Knowledge Sources':
        return renderKnowledgeSources();
      case 'Test Agent':
        return renderTestAgent();
      case 'Settings':
        return renderSettings();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-gray-200 bg-white">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-[#4A154B] flex items-center justify-center text-white font-medium">
                {mockAgent.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{mockAgent.name}</h2>
                <p className="text-sm text-gray-500">{mockAgent.channel}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Back to Agents
            </button>
          </div>
          <div className="flex space-x-4 mt-4">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                  activeTab === tab.name
                    ? 'bg-[#4A154B] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-8">
        {renderContent()}
      </div>
    </div>
  );
}

export default AgentDetail;