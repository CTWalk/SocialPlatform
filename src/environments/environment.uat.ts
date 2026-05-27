export const environment = {
  production: false,
  apiBaseUrl: 'https://uat-api.company.example',
  errorMonitoring: {
    enabled: true,
    dsn: '',
    environment: 'uat',
    release: 'company-social-platform@0.1.0',
    tracesSampleRate: 0.1,
  },
};
