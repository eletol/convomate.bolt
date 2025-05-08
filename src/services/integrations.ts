import { User } from 'firebase/auth';
import { integrationConfig, apiEndpoints } from '../config/firebase';

export const integrationService = {
  // Integration URLs
  getIntegrationUrl: (integration: string, state: string) => {
    const config = integrationConfig[integration as keyof typeof integrationConfig];
    if (!config) throw new Error(`Invalid integration: ${integration}`);

    switch (integration) {
      case 'slack':
        return `https://slack.com/oauth/v2/authorize?client_id=${config.clientId}&scope=${config.scopes}&redirect_uri=${encodeURIComponent(config.redirectUri)}&state=${state}`;
      case 'googleDrive':
        return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${config.clientId}&redirect_uri=${encodeURIComponent(config.redirectUri)}&response_type=code&scope=${config.scopes}&access_type=offline&prompt=consent&state=${state}`;
      case 'notion':
        return `https://api.notion.com/v1/oauth/authorize?client_id=${config.clientId}&redirect_uri=${encodeURIComponent(config.redirectUri)}&response_type=code&owner=user&state=${state}`;
      case 'jira':
        return `https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=${config.clientId}&scope=read:jira-work%20offline_access&redirect_uri=${encodeURIComponent(config.redirectUri)}&state=${state}&response_type=code&prompt=consent`;
      case 'clickup':
        return `https://app.clickup.com/api?client_id=${config.clientId}&redirect_uri=${encodeURIComponent(config.redirectUri)}&response_type=code&state=${state}`;
      case 'gitbook':
        return `https://api.gitbook.com/oauth/authorize?client_id=${config.clientId}&redirect_uri=${encodeURIComponent(config.redirectUri)}&response_type=code&scope=read:content`;
      default:
        throw new Error(`Integration URL not implemented for: ${integration}`);
    }
  },

  // Sync Operations
  syncIntegration: async (user: User, integration: string) => {
    const token = await user.getIdToken();
    // Map googleDrive to google for API endpoint
    const endpointKey = integration === 'googleDrive' ? 'google' : integration;
    const endpoint = apiEndpoints[endpointKey as keyof typeof apiEndpoints];
    if (!endpoint) throw new Error(`Invalid integration: ${integration}`);

    const response = await fetch(`${apiEndpoints.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to sync ${integration}`);
    }

    return response.json();
  },

  // Checkout
  createCheckoutSession: async (user: User) => {
    const token = await user.getIdToken();
    const response = await fetch(`${apiEndpoints.baseUrl}${apiEndpoints.checkout}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ customer_email: user.email })
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    return response.json();
  }
}; 