import * as Sentry from '@sentry/node';

function monitoringEnabled() {
  return Boolean(process.env.SENTRY_DSN);
}

export function initServerMonitoring() {
  if (!monitoringEnabled()) return;

  const tracesSampleRate = Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0');

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
    release: process.env.SENTRY_RELEASE || 'company-social-platform@0.1.0',
    tracesSampleRate: Number.isFinite(tracesSampleRate) ? tracesSampleRate : 0,
  });
}

export function monitoringRequestMiddleware(req, res, next) {
  const requestId = crypto.randomUUID();
  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);

  const startedAt = Date.now();
  res.on('finish', () => {
    if (res.statusCode >= 500) {
      console.error(JSON.stringify({
        level: 'error',
        source: 'http-response',
        requestId,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: Date.now() - startedAt,
        username: req.headers['x-username'] ?? null,
        role: req.headers['x-role'] ?? null,
      }));
    }
  });

  next();
}

export function captureBackendError(error, context = {}) {
  if (monitoringEnabled()) {
    Sentry.withScope((scope) => {
      for (const [key, value] of Object.entries(context)) {
        scope.setExtra(key, value);
      }
      Sentry.captureException(error);
    });
  }

  console.error(JSON.stringify({
    level: 'error',
    source: 'backend-exception',
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : null,
    ...context,
  }));
}

export function monitoringErrorMiddleware(err, req, res, next) {
  captureBackendError(err, {
    requestId: req.requestId ?? null,
    method: req.method,
    path: req.originalUrl,
    username: req.headers['x-username'] ?? null,
    role: req.headers['x-role'] ?? null,
  });

  if (res.headersSent) {
    return next(err);
  }

  return res.status(500).json({
    error: 'Internal Server Error',
    requestId: req.requestId ?? null,
  });
}

export function registerProcessErrorHandlers() {
  process.on('unhandledRejection', (reason) => {
    captureBackendError(reason, { source: 'unhandledRejection' });
  });

  process.on('uncaughtException', (error) => {
    captureBackendError(error, { source: 'uncaughtException' });
  });
}
