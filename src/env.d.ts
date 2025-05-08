/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
  readonly VITE_FIREBASE_MEASUREMENT_ID: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_STRIPE_PUBLIC_KEY: string
  readonly VITE_SLACK_CLIENT_ID: string
  readonly VITE_GOOGLE_CLIENT_ID: string
  readonly VITE_NOTION_CLIENT_ID: string
  readonly VITE_JIRA_CLIENT_ID: string
  readonly VITE_CLICKUP_CLIENT_ID: string
  readonly VITE_GITBOOK_CLIENT_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 