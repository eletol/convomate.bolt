import React from 'react';
import { Bot, Mail, Lock, Slack, ArrowRight, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { authService } from '../services/auth';
import { useNavigate } from 'react-router-dom';

interface AuthProps {
  onComplete: (isSignUp: boolean) => void;
}

function Auth({ onComplete }: AuthProps) {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [company, setCompany] = React.useState('');
  const [isEmailVerified, setIsEmailVerified] = React.useState(false);
  const [showVerification, setShowVerification] = React.useState(false);
  const [isResending, setIsResending] = React.useState(false);
  const [verificationCode, setVerificationCode] = React.useState('');
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isSignUp) {
        await authService.signUpWithEmail(email, password, company);
        setShowVerification(true);
      } else {
        await authService.signInWithEmail(email, password);
        onComplete(isSignUp);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setIsResending(true);
    setError('');
    
    try {
      // For now, we'll just simulate a delay since we don't have email verification yet
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend verification code');
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // For now, we'll just simulate email verification
      if (verificationCode === '0000' || verificationCode === '123456') {
        setIsEmailVerified(true);
        setTimeout(() => {
          onComplete(true);
          navigate('/dashboard');
        }, 1500);
      } else {
        setError('Invalid verification code');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSlackAuth = async () => {
    setError('');
    setIsLoading(true);

    try {
      // For now, using Google auth as a placeholder for Slack
      await authService.signInWithGoogle();
      onComplete(isSignUp);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to authenticate with Google');
    } finally {
      setIsLoading(false);
    }
  };

  if (showVerification) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-lg bg-[#4A154B] flex items-center justify-center">
              <Bot className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Verify your email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We've sent a verification email to<br />
            <span className="font-medium text-[#4A154B]">{email}</span>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {isEmailVerified ? (
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Email verified!</h3>
                <p className="mt-1 text-sm text-gray-500">Redirecting you to your dashboard...</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm text-gray-700 mb-4">
                  Please check your email for the verification link to complete your registration.
                </p>
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={isResending || isLoading}
                  className="inline-flex items-center justify-center px-4 py-2 border border-[#4A154B] rounded-md shadow-sm text-sm font-medium text-[#4A154B] bg-white hover:bg-[#4A154B]/5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResending ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Resending...
                    </span>
                  ) : (
                    'Resend Email'
                  )}
                </button>
                {error && (
                  <div className="rounded-md bg-red-50 p-4 mt-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-red-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">{error}</h3>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-lg bg-[#4A154B] flex items-center justify-center">
            <Bot className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Welcome to Convomate
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isSignUp ? 'Create your account' : 'Sign in to your account'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <button
            onClick={handleSlackAuth}
            disabled={isLoading}
            className="w-full flex justify-center items-center px-4 py-2 border border-[#4A154B] rounded-md shadow-sm text-sm font-medium text-[#4A154B] bg-white hover:bg-[#4A154B]/5 mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <FcGoogle className="w-5 h-5 mr-2" />
                {isSignUp ? 'Sign up with Google' : 'Sign in with Google'}
              </>
            )}
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {isSignUp && (
              <>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <div className="mt-1">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#4A154B] focus:border-[#4A154B] sm:text-sm"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                    Company Name
                  </label>
                  <div className="mt-1">
                    <input
                      id="company"
                      name="company"
                      type="text"
                      required
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#4A154B] focus:border-[#4A154B] sm:text-sm"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#4A154B] focus:border-[#4A154B] sm:text-sm"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#4A154B] focus:border-[#4A154B] sm:text-sm"
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#4A154B] hover:bg-[#611f69] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4A154B] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  isSignUp ? 'Create Account' : 'Sign In'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4A154B]"
              >
                {isSignUp ? 'Sign in instead' : 'Create an account'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;