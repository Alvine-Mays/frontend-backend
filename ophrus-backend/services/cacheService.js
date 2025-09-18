const Redis = require('ioredis');
const { logger } = require('../utils/logging');

class CacheService {
  constructor() {
    this.redis = null;
    this.isConnected = false;
    this.init();
  }

  async init() {
    try {
      // Configuration Redis
      const redisConfig = {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        db: process.env.REDIS_DB || 0,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        keepAlive: 30000,
        connectTimeout: 10000,
        commandTimeout: 5000
      };

      this.redis = new Redis(redisConfig);

      this.redis.on('connect', () => {
        logger.info('Redis: Connexion établie');
        this.isConnected = true;
      });

      this.redis.on('ready', () => {
        logger.info('Redis: Prêt à recevoir des commandes');
      });

      this.redis.on('error', (err) => {
        logger.error('Redis: Erreur de connexion', { error: err.message });
        this.isConnected = false;
      });

      this.redis.on('close', () => {
        logger.warn('Redis: Connexion fermée');
        this.isConnected = false;
      });

      this.redis.on('reconnecting', () => {
        logger.info('Redis: Tentative de reconnexion...');
      });

      // Tenter la connexion
      await this.redis.connect();
      
    } catch (error) {
      logger.error('Redis: Échec d\'initialisation', { error: error.message });
      this.isConnected = false;
    }
  }

  // Vérifier si Redis est disponible
  isAvailable() {
    return this.isConnected && this.redis && this.redis.status === 'ready';
  }

  // Obtenir une valeur du cache
  async get(key) {
    if (!this.isAvailable()) {
      logger.debug('Cache: Redis non disponible pour GET', { key });
      return null;
    }

    try {
      const value = await this.redis.get(key);
      if (value) {
        logger.debug('Cache: HIT', { key });
        return JSON.parse(value);
      }
      logger.debug('Cache: MISS', { key });
      return null;
    } catch (error) {
      logger.error('Cache: Erreur GET', { key, error: error.message });
      return null;
    }
  }

  // Définir une valeur dans le cache
  async set(key, value, ttl = 3600) {
    if (!this.isAvailable()) {
      logger.debug('Cache: Redis non disponible pour SET', { key });
      return false;
    }

    try {
      const serializedValue = JSON.stringify(value);
      await this.redis.setex(key, ttl, serializedValue);
      logger.debug('Cache: SET', { key, ttl });
      return true;
    } catch (error) {
      logger.error('Cache: Erreur SET', { key, error: error.message });
      return false;
    }
  }

  // Supprimer une valeur du cache
  async del(key) {
    if (!this.isAvailable()) {
      logger.debug('Cache: Redis non disponible pour DEL', { key });
      return false;
    }

    try {
      await this.redis.del(key);
      logger.debug('Cache: DEL', { key });
      return true;
    } catch (error) {
      logger.error('Cache: Erreur DEL', { key, error: error.message });
      return false;
    }
  }

  // Supprimer plusieurs clés par pattern
  async delPattern(pattern) {
    if (!this.isAvailable()) {
      logger.debug('Cache: Redis non disponible pour DEL_PATTERN', { pattern });
      return false;
    }

    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        logger.debug('Cache: DEL_PATTERN', { pattern, count: keys.length });
      }
      return true;
    } catch (error) {
      logger.error('Cache: Erreur DEL_PATTERN', { pattern, error: error.message });
      return false;
    }
  }

  // Incrémenter une valeur
  async incr(key, ttl = 3600) {
    if (!this.isAvailable()) {
      logger.debug('Cache: Redis non disponible pour INCR', { key });
      return null;
    }

    try {
      const value = await this.redis.incr(key);
      if (value === 1) {
        // Première incrémentation, définir TTL
        await this.redis.expire(key, ttl);
      }
      return value;
    } catch (error) {
      logger.error('Cache: Erreur INCR', { key, error: error.message });
      return null;
    }
  }

  // Vérifier l'existence d'une clé
  async exists(key) {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const exists = await this.redis.exists(key);
      return exists === 1;
    } catch (error) {
      logger.error('Cache: Erreur EXISTS', { key, error: error.message });
      return false;
    }
  }

  // Obtenir le TTL d'une clé
  async ttl(key) {
    if (!this.isAvailable()) {
      return -1;
    }

    try {
      return await this.redis.ttl(key);
    } catch (error) {
      logger.error('Cache: Erreur TTL', { key, error: error.message });
      return -1;
    }
  }

  // Fermer la connexion Redis
  async close() {
    if (this.redis) {
      await this.redis.quit();
      logger.info('Redis: Connexion fermée proprement');
    }
  }

  // Méthodes utilitaires pour les clés de cache
  static keys = {
    property: (id) => `property:${id}`,
    properties: (filters) => `properties:${Buffer.from(JSON.stringify(filters)).toString('base64')}`,
    user: (id) => `user:${id}`,
    userByEmail: (email) => `user:email:${email}`,
    searchResults: (query) => `search:${Buffer.from(query).toString('base64')}`,
    stats: () => 'stats:general',
    rateLimitAuth: (ip) => `ratelimit:auth:${ip}`,
    rateLimitGeneral: (ip) => `ratelimit:general:${ip}`
  };
}

// Instance singleton
const cacheService = new CacheService();

module.exports = cacheService;

