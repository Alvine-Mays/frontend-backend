// 📦 Import des dépendances
const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cookieParser = require("cookie-parser");
const { logger, morganMiddleware } = require("./utils/logging");

// 🔑 Configuration des variables d'environnement
dotenv.config();

// 🚀 Initialisation de l'application Express
const app = express();


// 📝 Logs d'initialisation
logger.info("🚀 Démarrage de l'application Ophrus-Immo");
logger.info(`⚙️ Mode: ${process.env.NODE_ENV || 'development'}`);
logger.info(`🟢 Node.js version: ${process.version}`);

// 🛡️ Middlewares de sécurité (AVANT les routes)
const security = require("./middlewares/security");

app.use(security.morgan);               // Logging HTTP
app.use(security.secureHeaders);        // Headers de sécurité
app.use(security.corsOptions);          // CORS
app.use(security.preventHPP);           // Protection HPP
app.use("/api/", security.limiter);     // Rate Limiting sur les API
app.use(security.xssProtection);        // Protection XSS

// 📦 Middlewares globaux
app.use(express.json({
  type: 'application/json',
  limit: '10kb'
}));
app.use(express.urlencoded({
  extended: true,
  limit: '10kb'
}));
app.use(cookieParser());
app.use(morganMiddleware);

// 🛣️ Routes publiques (accessibles sans authentification)
app.use("/api/properties", require("./routes/propertyRoutes"));

// 🔒 Routes protégées (authentification nécessaire)
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/favoris", require("./routes/favorisRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/reservations", require("./routes/reservationRoutes"));

// 🧪 Route de santé (Healthcheck)
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 🌐 Route racine
app.get("/", (req, res) => {
  logger.http("Accès à la route racine");
  res.send("🚀 API backend Ophrus-Immo opérationnelle");
});

// ❌ Middleware 404 - Ressource non trouvée
app.use((req, res, next) => {
  logger.warn(`❌ Route non trouvée: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    status: 404,
    error: "Ressource non trouvée"
  });
});

// 🔥 Middleware global de gestion des erreurs
app.use((err, req, res, next) => {
  logger.error(`🔥 Erreur serveur: ${err.message}`, {
    path: req.path,
    method: req.method,
    ip: req.ip,
    stack: err.stack
  });

  const errorResponse = {
    status: err.status || 500,
    error: "Erreur interne du serveur"
  };

  // En mode dev ➔ afficher le détail de l'erreur
  if (process.env.NODE_ENV !== 'production') {
    errorResponse.message = err.message;
    errorResponse.stack = err.stack;
  }

  res.status(err.status || 500).json(errorResponse);
});

// 🛑 Gestion des erreurs non catchées
process.on('unhandledRejection', (reason, promise) => {
  logger.error('❗ Unhandled Rejection:', { promise, reason });
});

process.on('uncaughtException', (err) => {
  logger.error('❗ Uncaught Exception:', err);
  process.exit(1);
});

// ✅ Export de l'application
module.exports = app;
