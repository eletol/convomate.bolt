import React, { useEffect, useState } from 'react';
import { Bot, MessageSquare, Users2, Clock, TrendingUp, ChevronUp, ChevronDown } from 'lucide-react';
import { useSpring, animated, config } from '@react-spring/web';
import { auth } from '../config/firebase';
import { useNavigate } from 'react-router-dom';

interface OverviewData {
  total_agents: number;
  total_agents_increased: number;
  messages_answered: number;
  messages_answered_increased: number;
  users_helped: number;
  users_helped_increased: number;
  usage_trends: Record<string, number>;
  usage_trends_increased_percentage: number;
  top_agents: {
    agent_id: string;
    name: string;
    message_count: number;
    accuracy: number;
  }[];
  response_quality: {
    helpful: number;
    neutral: number;
    unhelpful: number;
  };
  time_saved: string;
  time_saved_increased: string;
}

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const { number } = useSpring({
    from: { number: 0 },
    number: value,
    delay: 200,
    config: { mass: 1, tension: 20, friction: 10 },
  });

  return (
    <animated.span>
      {number.to(n => `${Math.floor(n)}${suffix}`)}
    </animated.span>
  );
}

function AnimatedBar({ height, delay }: { height: number; delay: number }) {
  const props = useSpring({
    from: { height: '0px' },
    to: { height: `${height}px` },
    delay,
    config: config.gentle,
  });

  return (
    <animated.div
      className="absolute bottom-0 left-0 right-0 bg-[#4A154B] rounded-t shadow-lg mx-1"
      style={props}
    />
  );
}

function Overview() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/dashboard/overview`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const overviewData = await response.json();
        setData(overviewData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4A154B]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    { 
      name: 'Total Agents',
      value: data.total_agents,
      change: data.total_agents_increased > 0 ? `+${data.total_agents_increased}` : `${data.total_agents_increased}`,
      trend: data.total_agents_increased >= 0 ? 'up' : 'down',
      icon: Bot,
      description: 'Active agents across all channels'
    },
    { 
      name: 'Messages Answered',
      value: data.messages_answered,
      change: data.messages_answered_increased > 0 ? `+${data.messages_answered_increased}` : `${data.messages_answered_increased}`,
      trend: data.messages_answered_increased >= 0 ? 'up' : 'down',
      icon: MessageSquare,
      description: 'Total messages handled this month'
    },
    { 
      name: 'Users Helped',
      value: data.users_helped,
      change: data.users_helped_increased > 0 ? `+${data.users_helped_increased}` : `${data.users_helped_increased}`,
      trend: data.users_helped_increased >= 0 ? 'up' : 'down',
      icon: Users2,
      description: 'Unique users assisted this month'
    },
    { 
      name: 'Time Saved',
      value: parseInt(data.time_saved),
      change: data.time_saved_increased,
      trend: parseInt(data.time_saved_increased) >= 0 ? 'up' : 'down',
      icon: Clock,
      description: 'Estimated time saved this month'
    },
  ];

  const usageData = Object.entries(data.usage_trends).map(([date, messages]) => ({
    date,
    messages
  }));

  const maxMessages = Math.max(...usageData.map(d => d.messages));
  const minMessages = Math.min(...usageData.map(d => d.messages));

  const usageTrendPercent = data.usage_trends_increased_percentage;

  const parentHeight = 256; // px, matches h-64
  const minBarHeight = 12; // px

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome to Convomate, Ahmed!</h1>
        <p className="text-gray-500 mt-2">Here's an overview of your workspace activity</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:border-[#4A154B] transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 bg-[#4A154B]/10 rounded-lg">
                <stat.icon className="w-6 h-6 text-[#4A154B]" />
              </div>
              <div className={`flex items-center text-sm ${
                stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.trend === 'up' ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
                <span>{stat.change}</span>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500">{stat.name}</h3>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                <AnimatedNumber 
                  value={stat.value} 
                  suffix={stat.name === 'Time Saved' ? 'h' : ''} 
                />
              </p>
              <p className="text-sm text-gray-500 mt-1">{stat.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Usage Trends</h3>
            <p className="text-sm text-gray-500 mt-1">Messages handled per day</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">
                {usageTrendPercent >= 0 ? '+' : ''}
                {usageTrendPercent.toFixed(1)}% vs last month
              </span>
            </div>
          </div>
        </div>

        <div className="h-64 relative">
          <div className="absolute inset-0 flex items-end justify-between">
            {usageData.map((data, index) => {
              let barHeight = 0;
              if (maxMessages === minMessages) {
                barHeight = parentHeight;
              } else {
                barHeight = ((data.messages - minMessages) / (maxMessages - minMessages)) * parentHeight;
                if (barHeight < minBarHeight && data.messages > 0) {
                  barHeight = minBarHeight;
                }
              }
              const date = new Date(data.date);
              return (
                <div
                  key={data.date}
                  className="flex-1 flex flex-col items-center group"
                >
                  <div className="relative flex-1 w-full px-1">
                    <AnimatedBar height={barHeight} delay={index * 50} />
                  </div>
                  <span className="text-xs text-gray-500 mt-2 hidden sm:block">
                    {date.toLocaleDateString(undefined, { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                  <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs rounded px-2 py-1 pointer-events-none">
                    {data.messages} messages
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performing Agents</h3>
          <div className="space-y-4">
            {data.top_agents.map((agent) => (
              <div 
                key={agent.agent_id} 
                className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                onClick={() => navigate(`/dashboard/agents/${agent.agent_id}/edit`)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-[#4A154B] flex items-center justify-center text-white font-medium">
                    {agent.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Agent {agent.name}</p>
                    <p className="text-xs text-gray-500">
                      <AnimatedNumber value={agent.message_count} /> messages
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    <AnimatedNumber value={agent.accuracy} />%
                  </p>
                  <p className="text-xs text-gray-500">accuracy</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Response Quality</h3>
          <div className="space-y-4">
            {[
              { label: 'Helpful', value: data.response_quality.helpful, color: 'bg-green-500' },
              { label: 'Neutral', value: data.response_quality.neutral, color: 'bg-yellow-500' },
              { label: 'Unhelpful', value: data.response_quality.unhelpful, color: 'bg-red-500' },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{item.label}</span>
                  <span className="text-sm text-gray-500">
                    <AnimatedNumber value={item.value} />%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full`}
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Overview;