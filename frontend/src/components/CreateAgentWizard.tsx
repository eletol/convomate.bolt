import React from 'react';
import { Bot, Upload, Check, X } from 'lucide-react';

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
    id: 'pdf',
    name: 'Upload PDF',
    icon: Upload,
    description: 'Upload PDF documents as knowledge source',
  },
  {
    id: 'gdrive',
    name: 'Google Drive',
    icon: Bot,
    description: 'Connect your Google Drive files and folders',
  },
  {
    id: 'notion',
    name: 'Notion',
    icon: Bot,
    description: 'Use your Notion workspace as knowledge source',
  },
  {
    id: 'clickup',
    name: 'ClickUp',
    icon: Bot,
    description: 'Connect to your ClickUp workspace',
  },
  {
    id: 'confluence',
    name: 'Jira Confluence',
    icon: Bot,
    description: 'Access your Confluence pages and documentation',
  },
];

interface CreateAgentWizardProps {
  onClose: () => void;
}

function CreateAgentWizard({ onClose }: CreateAgentWizardProps) {
  const [step, setStep] = React.useState(1);
  const [formData, setFormData] = React.useState({
    name: '',
    slackChannel: '',
    type: '',
    knowledgeSource: '',
    testQuestion: '',
  });

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle agent creation here
    onClose();
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Agent Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#4A154B] focus:ring-[#4A154B]"
                placeholder="e.g., HR Assistant"
              />
            </div>
            <div>
              <button
                type="button"
                className="w-full px-4 py-2 text-sm font-medium text-white bg-[#4A154B] rounded-lg hover:bg-[#611f69]"
                onClick={() => {
                  // Simulate Slack connection
                  setFormData({ ...formData, slackChannel: '#hr-support' });
                }}
              >
                Connect to Slack
              </button>
            </div>
            {formData.slackChannel && (
              <div className="mt-4">
                <label htmlFor="channel" className="block text-sm font-medium text-gray-700">
                  Slack Channel
                </label>
                <input
                  type="text"
                  id="channel"
                  value={formData.slackChannel}
                  onChange={(e) => setFormData({ ...formData, slackChannel: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#4A154B] focus:ring-[#4A154B]"
                />
              </div>
            )}
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            {agentTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setFormData({ ...formData, type: type.id })}
                className={`w-full p-4 text-left rounded-lg border ${
                  formData.type === type.id
                    ? 'border-[#4A154B] bg-[#4A154B]/5'
                    : 'border-gray-200 hover:border-[#4A154B]'
                }`}
              >
                <h3 className="text-base font-medium text-gray-900">{type.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{type.description}</p>
              </button>
            ))}
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            {knowledgeSources.map((source) => (
              <button
                key={source.id}
                onClick={() => setFormData({ ...formData, knowledgeSource: source.id })}
                className={`w-full p-4 text-left rounded-lg border ${
                  formData.knowledgeSource === source.id
                    ? 'border-[#4A154B] bg-[#4A154B]/5'
                    : 'border-gray-200 hover:border-[#4A154B]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-[#4A154B]/10 rounded-lg">
                    <source.icon className="w-5 h-5 text-[#4A154B]" />
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-gray-900">{source.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{source.description}</p>
                  </div>
                </div>
              </button>
            ))}
            <p className="text-sm text-gray-500 mt-4">
              You can add more sources later in the Agent settings.
            </p>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-[#4A154B] flex items-center justify-center text-white font-medium">
                    {formData.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={formData.testQuestion}
                      onChange={(e) => setFormData({ ...formData, testQuestion: e.target.value })}
                      placeholder="Ask a test question..."
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#4A154B] focus:ring-[#4A154B]"
                    />
                  </div>
                </div>
                {formData.testQuestion && (
                  <div className="ml-11 p-4 bg-white rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600">
                      This is a simulated response from your agent. In production, the agent will use
                      your connected knowledge sources to provide accurate answers.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Create New Agent</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center space-x-2 mt-4">
            {[1, 2, 3, 4].map((stepNumber) => (
              <React.Fragment key={stepNumber}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    stepNumber <= step
                      ? 'bg-[#4A154B] text-white'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {stepNumber < step ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm">{stepNumber}</span>
                  )}
                </div>
                {stepNumber < 4 && (
                  <div
                    className={`w-12 h-0.5 ${
                      stepNumber < step ? 'bg-[#4A154B]' : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6">
            {renderStep()}
          </div>

          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Back
                </button>
              )}
              <div className="ml-auto">
                <button
                  type="button"
                  onClick={step < 4 ? handleNext : handleSubmit}
                  disabled={
                    (step === 1 && (!formData.name || !formData.slackChannel)) ||
                    (step === 2 && !formData.type) ||
                    (step === 3 && !formData.knowledgeSource)
                  }
                  className="px-4 py-2 text-sm font-medium text-white bg-[#4A154B] rounded-lg hover:bg-[#611f69] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {step < 4 ? 'Continue' : 'Launch Agent'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateAgentWizard;