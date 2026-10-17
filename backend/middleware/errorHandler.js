// ====================================
// Global Error Handler Middleware
// ====================================
// This catches any errors that happen in our route handlers.
// Instead of crashing the server, it sends a proper error response.

function errorHandler(err, req, res, next) {
    // Log the error for debugging (visible in terminal)
    console.error('❌ Error:', err.message);
    console.error('Stack:', err.stack);

    // Determine the status code
    const statusCode = err.statusCode || 500;
    const isProduction = process.env.NODE_ENV === 'production';
    const message = isProduction && statusCode >= 500
        ? 'Internal Server Error'
        : err.message || 'Internal Server Error';

    // Send error response
    res.status(statusCode).json({
        error: message,
        // Only show stack trace in development mode
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
}

module.exports = errorHandler;
