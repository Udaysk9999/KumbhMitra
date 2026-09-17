/**
 * Centralized Error Handling and 404 Middleware for AI KumbhMitra
 */

/**
 * 404 Not Found Middleware
 */
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Endpoint ${req.originalUrl} not found`
  });
};

/**
 * Global Centralized Error Handler Middleware
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose bad ObjectId CastError
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Resource not found with invalid id format: ${err.value}`;
  }

  // Handle Mongoose schema ValidationError
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((val) => val.message).join(', ');
  }

  // Handle JSON parse syntax error from body parser
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Malformed JSON payload in request body';
  }

  if (process.env.NODE_ENV !== 'test') {
    console.error(`[Error] ${statusCode} - ${message}`);
    if (statusCode === 500 && err.stack) {
      console.error(err.stack);
    }
  }

  res.status(statusCode).json({
    success: false,
    error: message
  });
};

export default {
  notFoundHandler,
  errorHandler
};
