import { API_ENDPOINTS } from '../config/constants';
import { loadStripe } from '@stripe/stripe-js';
import { STRIPE_CONFIG } from '../config/constants';
import { auth } from '../config/firebase';

export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const user = auth.currentUser;
  if (!user) throw new Error('No user logged in');
  
  const token = await user.getIdToken();
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }
  
  return response.json();
};

export const subscriptionService = {
  createSession: async (email: string) => {
    const token = await auth.currentUser?.getIdToken();
    const res = await fetch(`${API_ENDPOINTS.SUBSCRIPTION}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer_email: email })
    });
    return res.json();
  },
  
  getSubscription: async () => {
    const token = await auth.currentUser?.getIdToken();
    const res = await fetch(`${API_ENDPOINTS.GET_SUBSCRIPTION}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },
  
  getInvoices: async () => {
    const token = await auth.currentUser?.getIdToken();
    const res = await fetch(`${API_ENDPOINTS.INVOICES}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },
  
  getBillingHistory: async () => {
    const token = await auth.currentUser?.getIdToken();
    const res = await fetch(`${API_ENDPOINTS.BILLING_HISTORY}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },
  
  cancelSubscription: async () => {
    const token = await auth.currentUser?.getIdToken();
    const res = await fetch(`${API_ENDPOINTS.CANCEL_SUBSCRIPTION}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },
  
  resumeSubscription: async () => {
    const token = await auth.currentUser?.getIdToken();
    const res = await fetch(`${API_ENDPOINTS.RESUME_SUBSCRIPTION}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },
  
  createPortalSession: async () => {
    const token = await auth.currentUser?.getIdToken();
    const res = await fetch(`${API_ENDPOINTS.PORTAL}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },
  
  updatePaymentMethod: async () => {
    const token = await auth.currentUser?.getIdToken();
    const res = await fetch(`${API_ENDPOINTS.PAYMENT_METHOD}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },
};

export const integrationService = {
  syncGoogleDrive: async () => {
    return fetchWithAuth(API_ENDPOINTS.GOOGLE_SYNC, {
      method: 'POST',
    });
  },
  
  syncNotion: async () => {
    return fetchWithAuth(API_ENDPOINTS.NOTION_SYNC, {
      method: 'POST',
    });
  },
  
  syncJira: async () => {
    return fetchWithAuth(API_ENDPOINTS.JIRA_SYNC, {
      method: 'POST',
    });
  },
  
  syncClickUp: async () => {
    return fetchWithAuth(API_ENDPOINTS.CLICKUP_SYNC, {
      method: 'POST',
    });
  },
  
  syncGitBook: async () => {
    return fetchWithAuth(API_ENDPOINTS.GITBOOK_SYNC, {
      method: 'POST',
    });
  },
};

export const stripeService = {
  initialize: async () => {
    const stripe = await loadStripe(STRIPE_CONFIG.PUBLIC_KEY);
    if (!stripe) {
      throw new Error('Failed to load Stripe');
    }
    return stripe;
  },
}; 