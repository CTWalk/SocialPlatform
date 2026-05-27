export const environment = {
  production: false,
  apiBaseUrl: 'https://preprod-api.company.example',
  errorMonitoring: {
    enabled: true,
    dsn: '',
    environment: 'preprod',
    release: 'company-social-platform@0.1.0',
    tracesSampleRate: 0.1,
  },
};
