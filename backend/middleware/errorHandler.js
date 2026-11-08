function formatErrorCause(error) {
  const messages = [];
  const seen = new Set();
  let current = error;

  while (current && !seen.has(current)) {
    seen.add(current);
    messages.push(
      `${current.name || "Error"}: ${current.message || String(current)}`
    );
    current = current.cause;
  }

  return messages.join(" <- ");
}

function createErrorHandler(logger = console.error) {
  return (error, req, res, next) => {
    if (res.headersSent) {
      return next(error);
    }

    const status =
      Number.isInteger(error.status) && error.status >= 400 && error.status < 500
        ? error.status
        : 500;
    logger(
      `[HTTP ${status}] ${req.method} ${req.originalUrl}: ${formatErrorCause(error)}`
    );
    res.status(status).json({
      success: false,
      message:
        status === 400 && error.type === "entity.parse.failed"
          ? "Invalid JSON request body"
          : status === 500
            ? "Internal server error"
            : error.message,
    });
  };
}

module.exports = { createErrorHandler, formatErrorCause };
