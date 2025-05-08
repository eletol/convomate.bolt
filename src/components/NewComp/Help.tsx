import React from 'react';
import { BookOpen, MessageSquare, Mail, Map as RoadMap } from 'lucide-react';

const helpResources = [
  {
    name: 'Knowledge Base',
    description: 'Browse through our comprehensive guides and documentation.',
    icon: BookOpen,
    link: '#',
    color: 'bg-blue-100 text-blue-700'
  },
  {
    name: 'Chat with Support',
    description: 'Get real-time help from our support team.',
    icon: MessageSquare,
    link: '#',
    color: 'bg-green-100 text-green-700'
  },
  {
    name: 'Send Email',
    description: 'Email our support team for detailed inquiries.',
    icon: Mail,
    link: '#',
    color: 'bg-purple-100 text-purple-700'
  },
  {
    name: 'Product Roadmap',
    description: 'See what features are coming next.',
    icon: RoadMap,
    link: '#',
    color: 'bg-orange-100 text-orange-700'
  }
];

function Help() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Help & Support</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {helpResources.map((resource) => (
          <a
            key={resource.name}
            href={resource.link}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:border-[#4A154B] transition-colors group"
          >
            <div className="flex items-start space-x-4">
              <div className={`p-2 rounded-lg ${resource.color}`}>
                <resource.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 group-hover:text-[#4A154B]">
                  {resource.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{resource.description}</p>
              </div>
            </div>
          </a>
        ))}
      </div>

      <div className="bg-[#4A154B]/5 rounded-xl p-8 mt-8">
        <h3 className="text-lg font-medium text-[#4A154B] mb-4">Need Additional Help?</h3>
        <p className="text-gray-600 mb-6">
          Our support team is available 24/7 to help you with any questions or issues you might have.
          We typically respond within 2 hours during business hours.
        </p>
        <div className="flex space-x-4">
          <button className="px-4 py-2 text-sm font-medium text-white bg-[#4A154B] rounded-lg hover:bg-[#611f69]">
            Contact Support
          </button>
          <button className="px-4 py-2 text-sm font-medium text-[#4A154B] bg-white border border-[#4A154B] rounded-lg hover:bg-[#4A154B]/5">
            View Documentation
          </button>
        </div>
      </div>
    </div>
  );
}

export default Help;