// Minimal logger used across the app to avoid startup errors when a full logger
// (winston/pino) isn't configured. Exports a default object with common
// logging methods: info, warn, error, debug.
const logger = {
  info: (...args) => console.log('[INFO]', ...args),
  warn: (...args) => console.warn('[WARN]', ...args),
  error: (...args) => console.error('[ERROR]', ...args),
  debug: (...args) => {
    // Only print debug in non-production environments
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[DEBUG]', ...args);
    }
  }
};

export default logger;
