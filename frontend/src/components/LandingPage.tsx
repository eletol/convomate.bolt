import React from 'react';
import { Bot, ArrowRight, Play, FileText, Globe, Zap, Users2, ChevronDown, Check, X } from 'lucide-react';
import clsx from 'clsx';

interface LandingPageProps {
  isAuthenticated: boolean;
  onAuthComplete?: (isSignUp: boolean) => void;
  onDashboardClick?: () => void;
}

const features = [
  {
    title: 'Train on Files',
    description: 'Upload documents, PDFs, and spreadsheets to train your AI on company knowledge.',
    icon: FileText,
  },
  {
    title: 'Global Access',
    description: 'Access your AI assistant from anywhere, anytime, across all departments.',
    icon: Globe,
  },
  {
    title: 'Instant Setup',
    description: 'Get started in minutes with our intuitive setup process and templates.',
    icon: Zap,
  },
  {
    title: 'Team Collaboration',
    description: 'Share knowledge bases and insights across your entire organization.',
    icon: Users2,
  },
];

const testimonials = [
  {
    type: 'quote',
    quote: "Convomate has transformed how we access information. Our team saves hours every week.",
    author: "Sarah Chen",
    role: "Head of Operations at TechCorp",
    image: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg"
  },
  {
    type: 'stat',
    stat: "9,000+",
    label: "Companies trust Convomate",
    background: "bg-gradient-to-br from-purple-500 to-indigo-600"
  },
  {
    type: 'quote',
    quote: "The AI agents have significantly reduced response times for internal queries.",
    author: "Michael Rodriguez",
    role: "IT Director at GlobalTech",
    image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg"
  },
  {
    type: 'stat',
    stat: "140+",
    label: "Countries served",
    background: "bg-gradient-to-br from-blue-500 to-cyan-600"
  },
  {
    type: 'quote',
    quote: "Setup was incredibly fast, and the results were immediate. A game-changer for us.",
    author: "Emily Watson",
    role: "HR Manager at InnovateCo",
    image: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg"
  },
  {
    type: 'stat',
    stat: "98%",
    label: "Customer satisfaction",
    background: "bg-gradient-to-br from-green-500 to-emerald-600"
  },
];

const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for small teams getting started',
    features: [
      'Up to 5 team members',
      '1 AI agent',
      '1,000 queries per month',
      '1GB storage',
      'Basic email support',
      'Standard response time'
    ]
  },
  {
    name: 'Pro',
    price: '$49',
    description: 'For growing teams that need more power',
    features: [
      'Up to 25 team members',
      'Unlimited AI agents',
      '50,000 queries per month',
      '50GB storage',
      'Priority support',
      'Advanced analytics',
      'Custom training',
      'API access'
    ]
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large organizations with custom needs',
    features: [
      'Unlimited team members',
      'Unlimited AI agents',
      'Unlimited queries',
      'Unlimited storage',
      '24/7 dedicated support',
      'Custom integrations',
      'On-premise deployment',
      'SLA guarantee',
      'Dedicated success manager'
    ]
  }
];

const faqs = [
  {
    question: 'How does Convomate work?',
    answer: 'Convomate uses advanced AI to process and understand your company\'s documents and knowledge base. It creates intelligent agents that can answer questions and provide information instantly, making internal knowledge easily accessible to your team.'
  },
  {
    question: 'What types of files can I use to train the AI?',
    answer: 'Convomate supports a wide range of file formats including PDFs, Word documents, Excel spreadsheets, PowerPoint presentations, and plain text files. You can also connect to platforms like Notion, Confluence, and Google Drive.'
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes, we take security seriously. All data is encrypted both in transit and at rest. We use enterprise-grade security measures and comply with major security standards. Your data is never shared or used to train other models.'
  },
  {
    question: 'How long does it take to set up?',
    answer: 'Most teams are up and running within 15 minutes. The setup process is straightforward: create an account, upload your documents or connect your knowledge sources, and your AI agent will be ready to use.'
  }
];

function LandingPage({ isAuthenticated, onAuthComplete, onDashboardClick }: LandingPageProps) {
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Navigation */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-sm z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-lg bg-[#4A154B] flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="hidden md:flex ml-10 space-x-8">
                <a href="#features" className="text-gray-900 hover:text-[#4A154B] px-3 py-2 text-sm font-medium">
                  Features
                </a>
                <a href="#pricing" className="text-gray-900 hover:text-[#4A154B] px-3 py-2 text-sm font-medium">
                  Pricing
                </a>
                <a href="#faq" className="text-gray-900 hover:text-[#4A154B] px-3 py-2 text-sm font-medium">
                  FAQ
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <button
                  onClick={onDashboardClick}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-[#4A154B] hover:bg-[#611f69]"
                >
                  Dashboard
                  <ArrowRight className="ml-2 -mr-1 w-4 h-4" />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => onAuthComplete?.(false)}
                    className="text-gray-900 hover:text-[#4A154B] px-3 py-2 text-sm font-medium"
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => onAuthComplete?.(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-[#4A154B] hover:bg-[#611f69]"
                  >
                    Get Started
                    <ArrowRight className="ml-2 -mr-1 w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-24">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl" aria-hidden="true">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>
        
        <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-24 pb-16 sm:pt-32 lg:pt-40">
          <div className="mx-auto max-w-2xl lg:max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
              Build your own AI chatbot trained on your data
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
              Upload files, add links, and create a chatbot that answers questions using your content. Save time and improve efficiency across your organization.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <button
                onClick={() => onAuthComplete?.(true)}
                className="rounded-lg bg-[#4A154B] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#611f69] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4A154B]"
              >
                Get Started for Free
              </button>
              <button className="text-sm font-semibold leading-6 text-gray-900 flex items-center">
                <Play className="w-4 h-4 mr-2" />
                Watch Demo
              </button>
            </div>
          </div>
          
          <div className="mt-16 flow-root sm:mt-24">
            <div className="relative rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
              <img
                src="https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg"
                alt="App screenshot"
                className="rounded-lg bg-white shadow-2xl ring-1 ring-gray-900/10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 sm:py-32 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-[#4A154B]">Powerful Features</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to manage internal knowledge
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Streamline information access and boost productivity with our comprehensive feature set.
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
              {features.map((feature) => (
                <div key={feature.title} className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-[#4A154B]">
                      <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    {feature.title}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-lg font-semibold leading-8 tracking-tight text-[#4A154B]">Testimonials</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Trusted by teams worldwide
            </p>
          </div>
          
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={clsx(
                  'relative overflow-hidden rounded-2xl',
                  testimonial.type === 'quote' ? 'bg-white p-8 shadow-lg' : testimonial.background
                )}
              >
                {testimonial.type === 'quote' ? (
                  <blockquote>
                    <p className="text-lg font-medium leading-8 text-gray-900">
                      "{testimonial.quote}"
                    </p>
                    <div className="mt-6 flex items-center gap-x-4">
                      <img
                        className="h-12 w-12 rounded-full bg-gray-50 object-cover"
                        src={testimonial.image}
                        alt={testimonial.author}
                      />
                      <div>
                        <div className="font-semibold text-gray-900">{testimonial.author}</div>
                        <div className="text-sm leading-6 text-gray-600">{testimonial.role}</div>
                      </div>
                    </div>
                  </blockquote>
                ) : (
                  <div className="p-8 text-white">
                    <p className="text-4xl font-bold">{testimonial.stat}</p>
                    <p className="mt-2 text-lg">{testimonial.label}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="py-24 sm:py-32 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Pricing Plans</h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Choose the perfect plan for your team's needs
            </p>
          </div>
          
          <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 items-center gap-y-6 sm:mt-20 sm:gap-y-0 lg:max-w-4xl lg:grid-cols-3">
            {plans.map((plan, planIdx) => (
              <div
                key={plan.name}
                className={clsx(
                  planIdx === 1 ? 'relative shadow-2xl' : 'sm:px-2',
                  'rounded-3xl p-8 ring-1 ring-gray-900/10 sm:mx-6 sm:p-10'
                )}
              >
                <div className="flex items-baseline justify-between gap-x-4">
                  <h3
                    className={clsx(
                      planIdx === 1 ? 'text-[#4A154B]' : 'text-gray-900',
                      'text-lg font-semibold leading-8'
                    )}
                  >
                    {plan.name}
                  </h3>
                  <p className="text-sm leading-6 text-gray-600">per month</p>
                </div>
                <p className="mt-4 text-sm leading-6 text-gray-600">{plan.description}</p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold tracking-tight text-gray-900">{plan.price}</span>
                  {plan.price !== 'Custom' && (
                    <span className="text-sm font-semibold leading-6 text-gray-600">/month</span>
                  )}
                </p>
                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <Check className="h-6 w-5 flex-none text-[#4A154B]" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => onAuthComplete?.(true)}
                  className={clsx(
                    planIdx === 1
                      ? 'bg-[#4A154B] text-white hover:bg-[#611f69]'
                      : 'text-[#4A154B] ring-1 ring-inset ring-[#4A154B] hover:ring-[#611f69]',
                    'mt-8 block w-full rounded-md px-3 py-2 text-center text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4A154B]'
                  )}
                >
                  {plan.price === 'Custom' ? 'Contact sales' : 'Get started'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div id="faq" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Frequently asked questions
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Got questions? We've got answers.
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-2xl">
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border border-gray-200 rounded-lg">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="flex w-full items-center justify-between px-4 py-5 sm:p-6"
                  >
                    <span className="text-lg font-medium text-gray-900">{faq.question}</span>
                    <ChevronDown
                      className={clsx(
                        'h-5 w-5 text-gray-500 transition-transform',
                        openFaq === index ? 'rotate-180' : ''
                      )}
                    />
                  </button>
                  {openFaq === index && (
                    <div className="px-4 pb-5 sm:px-6 sm:pb-6">
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900" aria-labelledby="footer-heading">
        <h2 id="footer-heading" className="sr-only">Footer</h2>
        <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
            <div className="space-y-8">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <span className="text-white text-xl font-bold">Convomate</span>
              </div>
              <p className="text-sm leading-6 text-gray-300">
                Empowering teams with intelligent knowledge access.
              </p>
            </div>
            <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-semibold leading-6 text-white">Product</h3>
                  <ul role="list" className="mt-6 space-y-4">
                    <li>
                      <a href="#features" className="text-sm leading-6 text-gray-300 hover:text-white">
                        Features
                      </a>
                    </li>
                    <li>
                      <a href="#pricing" className="text-sm leading-6 text-gray-300 hover:text-white">
                        Pricing
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-sm leading-6 text-gray-300 hover:text-white">
                        API
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="mt-10 md:mt-0">
                  <h3 className="text-sm font-semibold leading-6 text-white">Company</h3>
                  <ul role="list" className="mt-6 space-y-4">
                    <li>
                      <a href="#" className="text-sm leading-6 text-gray-300 hover:text-white">
                        About
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-sm leading-6 text-gray-300 hover:text-white">
                        Blog
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-sm leading-6 text-gray-300 hover:text-white">
                        Careers
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-semibold leading-6 text-white">Support</h3>
                  <ul role="list" className="mt-6 space-y-4">
                    <li>
                      <a href="#" className="text-sm leading-6 text-gray-300 hover:text-white">
                        Documentation
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-sm leading-6 text-gray-300 hover:text-white">
                        Guides
                      </a>
                    </li>
                    <li>
                      <a href="#faq" className="text-sm leading-6 text-gray-300 hover:text-white">
                        FAQ
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="mt-10 md:mt-0">
                  <h3 className="text-sm font-semibold leading-6 text-white">Legal</h3>
                  <ul role="list" className="mt-6 space-y-4">
                    <li>
                      <a href="#" className="text-sm leading-6 text-gray-300 hover:text-white">
                        Privacy
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-sm leading-6 text-gray-300 hover:text-white">
                        Terms
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-16 border-t border-white/10 pt-8 sm:mt-20 lg:mt-24">
            <p className="text-xs leading-5 text-gray-400">
              &copy; {new Date().getFullYear()} Convomate. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;