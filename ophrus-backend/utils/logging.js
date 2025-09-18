const winston = require("winston");
const { format, transports } = winston;
const { combine, timestamp, printf, colorize, errors, splat, json } = format;
const path = require("path");
const fs = require("fs");
const DailyRotateFile = require("winston-daily-rotate-file");
const morgan = require("morgan");
const os = require("os");
const crypto = require("crypto");

// 1. Création du dossier logs s'il n'existe pas
const logDir = path.join(__dirname, "..", "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// 2. Niveaux personnalisés
const logLevels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  http: 4,
  debug: 5,
  trace: 6
};

winston.addColors({
  fatal: "red",
  error: "red",
  warn: "yellow",
  info: "cyan",
  http: "magenta",
  debug: "blue",
  trace: "gray"
} );

// 3. Format structuré
const structuredFormat = combine(
  timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
  errors({ stack: true }),
  splat(),
  json()
);

// 4. Format console
const consoleFormat = combine(
  colorize({ all: true }),
  timestamp({ format: "HH:mm:ss" }),
  printf(({ timestamp, level, message, stack, traceId, ...meta }) => {
    const traceInfo = traceId ? `[${traceId}] ` : "";
    const metaInfo = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    return `${timestamp} ${traceInfo}[${level}] ${stack || message}${metaInfo}`;
  })
);

// 5. Logger principal
const logger = winston.createLogger({
  levels: logLevels,
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug"),
  format: structuredFormat,
  defaultMeta: { service: "ophrus-backend" },
  transports: [
    new DailyRotateFile({
      filename: path.join(logDir, "error-%DATE%.log"),
      level: "error",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "30d",
      handleExceptions: true,
      handleRejections: true
    }),
    new DailyRotateFile({
      filename: path.join(logDir, "combined-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "50m",
      maxFiles: "14d"
    }),
    new DailyRotateFile({
      filename: path.join(logDir, "audit-%DATE%.log"),
      level: "info",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "10m",
      maxFiles: "90d",
      format: combine(
        timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
        json()
      )
    }),
    new DailyRotateFile({
      filename: path.join(logDir, "performance-%DATE%.log"),
      level: "http",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "30m",
      maxFiles: "7d"
    } )
  ],
  exceptionHandlers: [
    new DailyRotateFile({
      filename: path.join(logDir, "exceptions-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "10m",
      maxFiles: "30d"
    })
  ],
  rejectionHandlers: [
    new DailyRotateFile({
      filename: path.join(logDir, "rejections-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "10m",
      maxFiles: "30d"
    })
  ]
});

if (process.env.NODE_ENV !== "production") {
  logger.add(new transports.Console({
    format: consoleFormat,
    level: "debug"
  }));
}

// Token trace-id
morgan.token("trace-id", (req) => req.traceId || "no-trace");

// Morgan Middleware
const morganMiddleware = morgan(
  ":remote-addr :method :url :status :res[content-length] - :response-time ms [:date[clf]] \"user-agent\" :trace-id",
  {
    stream: {
      write: (message) => {
        logger.http(message.trim( ));
      }
    }
  }
);

// Middleware de tracing
const requestTracer = (req, res, next) => {
  req.traceId = crypto.randomUUID();
  res.setHeader("X-Trace-Id", req.traceId);
  logger.http("Request started", {
    traceId: req.traceId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get("User-Agent" ),
    contentLength: req.get("Content-Length") || 0,
    timestamp: new Date().toISOString()
  });

  req.startTime = Date.now();
  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - req.startTime;
    logger.http("Request completed", {
      traceId: req.traceId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get("Content-Length" ) || 0,
      timestamp: new Date().toISOString()
    });
    if (duration > 5000) {
      logger.warn("Slow request detected", {
        traceId: req.traceId,
        method: req.method,
        url: req.originalUrl,
        duration: `${duration}ms`
      });
    }
    return originalSend.call(this, data);
  };
  next();
};

// Audit Logger
const auditLogger = {
  logUserAction: (userId, action, details = {}) => {
    logger.info("User action", {
      category: "audit",
      userId,
      action,
      details,
      timestamp: new Date().toISOString()
    });
  },
  logSecurityEvent: (event, details = {}) => {
    logger.warn("Security event", {
      category: "security",
      event,
      details,
      timestamp: new Date().toISOString()
    });
  },
  logDataAccess: (userId, resource, operation, details = {}) => {
    logger.info("Data access", {
      category: "data_access",
      userId,
      resource,
      operation,
      details,
      timestamp: new Date().toISOString()
    });
  },
  logSystemEvent: (event, details = {}) => {
    logger.info("System event", {
      category: "system",
      event,
      details,
      timestamp: new Date().toISOString()
    });
  }
};

// Utilitaires
const logWithContext = (level, message, context = {}) => {
  logger[level](message, {
    ...context,
    timestamp: new Date().toISOString()
  });
};

const logError = (error, context = {}) => {
  logger.error(error.message, {
    stack: error.stack,
    ...context,
    timestamp: new Date().toISOString()
  });
};

const logPerformance = (operation, duration, context = {}) => {
  const level = duration > 1000 ? "warn" : "debug";
  logger[level](`Performance: ${operation}`, {
    duration: `${duration}ms`,
    ...context,
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  logger,
  auditLogger,
  requestTracer,
  morganMiddleware,
  logWithContext,
  logError,
  logPerformance
};
