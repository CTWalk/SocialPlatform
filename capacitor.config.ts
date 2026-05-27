import type { CapacitorConfig } from '@capacitor/cli';

const serverUrl = process.env.CAP_SERVER_URL;

const config: CapacitorConfig = {
  appId: process.env.CAP_APP_ID || 'com.company.socialplatform',
  appName: process.env.CAP_APP_NAME || 'Company Social Platform',
  webDir: 'dist/company-social-platform',
  bundledWebRuntime: false,
  ios: {
    contentInset: 'automatic',
  },
  android: {
    allowMixedContent: true,
  },
  server: serverUrl ? {
    url: serverUrl,
    cleartext: true,
  } : undefined,
};

export default config;
