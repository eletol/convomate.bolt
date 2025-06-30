import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';
import { API_BASE_URL, OAUTH_CONFIG } from './constants';

// Log environment variables to debug
console.log('Firebase Config:', {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
});

const firebaseConfig = {
  apiKey: "AIzaSyA0O65PYoR4G811GbEBMdiVUbxM6mQr8WY",
  authDomain: "slackbotauth-52108.firebaseapp.com",
  projectId: "slackbotauth-52108",
  storageBucket: "slackbotauth-52108.appspot.com",
  messagingSenderId: "788027405808",
  appId: "1:788027405808:web:695b561f0a6c19c8d9d935"
};

// Validate required config
if (!firebaseConfig.apiKey) {
  throw new Error('Firebase API Key is missing. Please check your .env file.');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

interface IntegrationConfig {
  clientId: string;
  redirectUri: string;
  scopes?: string;
}

export const integrationConfig: Record<string, IntegrationConfig> = {
  slack: {
    clientId: OAUTH_CONFIG.SLACK.CLIENT_ID,
    redirectUri: OAUTH_CONFIG.SLACK.REDIRECT_URI,
    scopes: OAUTH_CONFIG.SLACK.SCOPES
  },
  googleDrive: {
    clientId: OAUTH_CONFIG.GOOGLE.CLIENT_ID,
    redirectUri: OAUTH_CONFIG.GOOGLE.REDIRECT_URI,
    scopes: OAUTH_CONFIG.GOOGLE.SCOPES
  },
  notion: {
    clientId: OAUTH_CONFIG.NOTION.CLIENT_ID,
    redirectUri: OAUTH_CONFIG.NOTION.REDIRECT_URI
  },
  jira: {
    clientId: OAUTH_CONFIG.JIRA.CLIENT_ID,
    redirectUri: OAUTH_CONFIG.JIRA.REDIRECT_URI,
    scopes: OAUTH_CONFIG.JIRA.SCOPES
  },
  clickup: {
    clientId: OAUTH_CONFIG.CLICKUP.CLIENT_ID,
    redirectUri: OAUTH_CONFIG.CLICKUP.REDIRECT_URI
  },
  gitbook: {
    clientId: import.meta.env.VITE_GITBOOK_CLIENT_ID,
    redirectUri: `${import.meta.env.VITE_API_BASE_URL}/gitbook/oauth/callback`
  }
};

export const apiEndpoints = {
  baseUrl: "https://slack-indexer-bjkjj7m6ia-uc.a.run.app",
  google: "/google/index-all-oauth_sync",
  notion: "/notion/index-all-oauth_sync",
  jira: "/jira/index-all-oauth_sync",
  clickup: "/clickup/index-all-oauth_sync",
  gitbook: "/gitbook/index-all-oauth_sync",
  checkout: "/create-subscription-session"
};

export default app; 