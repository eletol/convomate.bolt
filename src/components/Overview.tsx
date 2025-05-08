import React from 'react';
import { Bot, MessageSquare, Users2, Clock, TrendingUp, ChevronUp, ChevronDown } from 'lucide-react';
import { useSpring, animated, config } from '@react-spring/web';

const stats = [
  { 
    name: 'Total Agents',
    value: 12,
    change: '+2',
    trend: 'up',
    icon: Bot,
    description: 'Active agents across all channels'
  },
  { 
    name: 'Messages Answered',
    value: 2847,
    change: '+147',
    trend: 'up',
    icon: MessageSquare,
    description: 'Total messages handled this month'
  },
  { 
    name: 'Users Helped',
    value: 892,
    change: '+89',
    trend: 'up',
    icon: Users2,
    description: 'Unique users assisted this month'
  },
  { 
    name: 'Time Saved',
    value: 478,
    change: '+24',
    trend: 'up',
    icon: Clock,
    description: 'Estimated time saved this month'
  },
];

const usageData = [
  { date: '2024-03-01', messages: 120 },
  { date: '2024-03-02', messages: 145 },
  { date: '2024-03-03', messages: 132 },
  { date: '2024-03-04', messages: 167 },
  { date: '2024-03-05', messages: 178 },
  { date: '2024-03-06', messages: 189 },
  { date: '2024-03-07', messages: 156 },
  { date: '2024-03-08', messages: 198 },
  { date: '2024-03-09', messages: 167 },
  { date: '2024-03-10', messages: 142 },
  { date: '2024-03-11', messages: 189 },
  { date: '2024-03-12', messages: 203 },
  { date: '2024-03-13', messages: 212 },
  { date: '2024-03-14', messages: 228 },
  { date: '2024-03-15', messages: 221 },
];

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
    from: { height: '0%' },
    to: { height: `${height}%` },
    delay,
    config: config.gentle,
  });

  return (
    <animated.div
      className="absolute bottom-0 left-1 right-1 bg-[#4A154B] rounded-t"
      style={props}
    />
  );
}

function Overview() {
  const maxMessages = Math.max(...usageData.map(d => d.messages));
  const minMessages = Math.min(...usageData.map(d => d.messages));

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
              <span className="text-sm text-green-600">+18.2% vs last month</span>
            </div>
          </div>
        </div>

        <div className="h-64 relative">
          <div className="absolute inset-0 flex items-end justify-between">
            {usageData.map((data, index) => {
              const height = ((data.messages - minMessages) / (maxMessages - minMessages)) * 100;
              return (
                <div
                  key={data.date}
                  className="flex-1 flex flex-col items-center group"
                >
                  <div className="relative flex-1 w-full px-1">
                    <AnimatedBar height={height} delay={index * 50} />
                  </div>
                  <span className="text-xs text-gray-500 mt-2 hidden sm:block">
                    {new Date(data.date).toLocaleDateString(undefined, { 
                      month: 'short', 
                      day: 'numeric' 
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
            {[
              { name: 'HR Assistant', messages: 847, accuracy: 98 },
              { name: 'Product Bot', messages: 634, accuracy: 95 },
              { name: 'Sales Support', messages: 412, accuracy: 92 },
            ].map((agent) => (
              <div key={agent.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-[#4A154B] flex items-center justify-center text-white font-medium">
                    {agent.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{agent.name}</p>
                    <p className="text-xs text-gray-500">
                      <AnimatedNumber value={agent.messages} /> messages
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
              { label: 'Helpful', value: 92, color: 'bg-green-500' },
              { label: 'Neutral', value: 6, color: 'bg-yellow-500' },
              { label: 'Unhelpful', value: 2, color: 'bg-red-500' },
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