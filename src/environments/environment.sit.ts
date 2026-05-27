export const environment = {
  production: false,
  apiBaseUrl: 'https://sit-api.company.example',
  errorMonitoring: {
    enabled: true,
    dsn: '',
    environment: 'sit',
    release: 'company-social-platform@0.1.0',
    tracesSampleRate: 0.1,
  },
};
