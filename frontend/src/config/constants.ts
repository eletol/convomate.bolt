export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://slack-indexer-bjkjj7m6ia-uc.a.run.app';

export const API_ENDPOINTS = {
  SUBSCRIPTION: `${API_BASE_URL}/create-subscription-session`,
  GET_SUBSCRIPTION: `${API_BASE_URL}/get-subscription`,
  INVOICES: `${API_BASE_URL}/get-invoices`,
  BILLING_HISTORY: `${API_BASE_URL}/billing-history`,
  CANCEL_SUBSCRIPTION: `${API_BASE_URL}/cancel-subscription`,
  RESUME_SUBSCRIPTION: `${API_BASE_URL}/resume-subscription`,
  PORTAL: `${API_BASE_URL}/create-portal-session`,
  PAYMENT_METHOD: `${API_BASE_URL}/update-payment-method`,
  GOOGLE_SYNC: `${API_BASE_URL}/google/index-all-oauth_sync`,
  NOTION_SYNC: `${API_BASE_URL}/notion/index-all-oauth_sync`,
  JIRA_SYNC: `${API_BASE_URL}/jira/index-all-oauth_sync`,
  CLICKUP_SYNC: `${API_BASE_URL}/clickup/index-all-oauth_sync`,
  GITBOOK_SYNC: `${API_BASE_URL}/gitbook/index-all-oauth_sync`,
};

export const STRIPE_CONFIG = {
  PUBLIC_KEY: import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_51RIwTMRovLZLWF39IGufvHQ77OYogi75pSgKqSOnOTaNsmSO69hmLRmYdJkWrBL0c9FAtgm4FDXTMJfe4NJNTbEI00nUNvSL3q',
};

export const OAUTH_CONFIG = {
  SLACK: {
    CLIENT_ID: import.meta.env.VITE_SLACK_CLIENT_ID || '8812068083172.8811775174739',
    REDIRECT_URI: `${API_BASE_URL}/slack/oauth/callback`,
    SCOPES: 'app_mentions:read,chat:write,commands,users:read,channels:history,groups:history,im:history,mpim:history,channels:read,groups:read,im:read,mpim:read'
  },
  GOOGLE: {
    CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '151006307201-v8s4jreb6oqbu4447nvog89iljnca4j8.apps.googleusercontent.com',
    REDIRECT_URI: `${API_BASE_URL}/google/oauth/callback`,
    SCOPES: 'https://www.googleapis.com/auth/drive.readonly'
  },
  NOTION: {
    CLIENT_ID: import.meta.env.VITE_NOTION_CLIENT_ID || '1f7d872b-594c-80fe-8da5-0037bca4f26f',
    REDIRECT_URI: `${API_BASE_URL}/notion/oauth/callback`
  },
  JIRA: {
    CLIENT_ID: import.meta.env.VITE_JIRA_CLIENT_ID || 'cV8kB27TKF5gcDkRG2bBgD58cG9Bv9sp',
    REDIRECT_URI: `${API_BASE_URL}/jira/oauth/callback`,
    SCOPES: 'read:jira-work offline_access'
  },
  CLICKUP: {
    CLIENT_ID: import.meta.env.VITE_CLICKUP_CLIENT_ID || 'PJNOEINY8Z4OM9N70Y00W4P8FJICUC32',
    REDIRECT_URI: `${API_BASE_URL}/clickup/oauth/callback`
  }
};

export const UI_CONFIG = {
  DEFAULT_AVATAR_URL: 'https://ui-avatars.com/api/',
  LOGO_URL: 'https://cdn-icons-png.flaticon.com/512/2111/2111615.png',
}; 