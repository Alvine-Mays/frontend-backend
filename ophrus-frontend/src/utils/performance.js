// Utilitaires pour l'optimisation des performances

// Debounce function
export const debounce = (func, wait, immediate = false) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
};

// Throttle function
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Lazy loading pour les images
export const createImageObserver = (callback, options = {}) => {
  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1
  };

  return new IntersectionObserver(callback, { ...defaultOptions, ...options });
};

// Préchargement d'images
export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

// Préchargement de plusieurs images
export const preloadImages = async (urls) => {
  try {
    const promises = urls.map(url => preloadImage(url));
    return await Promise.all(promises);
  } catch (error) {
    console.warn('Erreur lors du préchargement des images:', error);
    return [];
  }
};

// Optimisation des images (redimensionnement côté client)
export const resizeImage = (file, maxWidth = 800, maxHeight = 600, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculer les nouvelles dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Dessiner l'image redimensionnée
      ctx.drawImage(img, 0, 0, width, height);

      // Convertir en blob
      canvas.toBlob(resolve, 'image/jpeg', quality);
    };

    img.src = URL.createObjectURL(file);
  });
};

// Mesure des performances
export class PerformanceMonitor {
  constructor() {
    this.marks = new Map();
    this.measures = new Map();
  }

  mark(name) {
    const timestamp = performance.now();
    this.marks.set(name, timestamp);
    
    if (performance.mark) {
      performance.mark(name);
    }
  }

  measure(name, startMark, endMark = null) {
    const startTime = this.marks.get(startMark);
    const endTime = endMark ? this.marks.get(endMark) : performance.now();
    
    if (startTime && endTime) {
      const duration = endTime - startTime;
      this.measures.set(name, duration);
      
      if (performance.measure) {
        try {
          performance.measure(name, startMark, endMark);
        } catch (e) {
          // Fallback si les marks n'existent pas dans performance
        }
      }
      
      return duration;
    }
    
    return null;
  }

  getMeasure(name) {
    return this.measures.get(name);
  }

  getAllMeasures() {
    return Object.fromEntries(this.measures);
  }

  clear() {
    this.marks.clear();
    this.measures.clear();
    
    if (performance.clearMarks) {
      performance.clearMarks();
    }
    if (performance.clearMeasures) {
      performance.clearMeasures();
    }
  }

  // Mesurer le temps d'exécution d'une fonction
  async timeFunction(name, fn) {
    this.mark(`${name}-start`);
    const result = await fn();
    this.mark(`${name}-end`);
    const duration = this.measure(name, `${name}-start`, `${name}-end`);
    
    console.log(`${name} took ${duration.toFixed(2)}ms`);
    return result;
  }
}

// Instance globale du moniteur de performance
export const perfMonitor = new PerformanceMonitor();

// Hook React pour mesurer les performances de rendu
export const useRenderPerformance = (componentName) => {
  const renderCount = React.useRef(0);
  const lastRenderTime = React.useRef(performance.now());

  React.useEffect(() => {
    renderCount.current += 1;
    const currentTime = performance.now();
    const timeSinceLastRender = currentTime - lastRenderTime.current;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} render #${renderCount.current} - ${timeSinceLastRender.toFixed(2)}ms since last render`);
    }
    
    lastRenderTime.current = currentTime;
  });

  return renderCount.current;
};

// Optimisation du scroll
export const optimizeScroll = (element, callback, options = {}) => {
  const { throttleMs = 16, passive = true } = options;
  
  const throttledCallback = throttle(callback, throttleMs);
  
  element.addEventListener('scroll', throttledCallback, { passive });
  
  return () => {
    element.removeEventListener('scroll', throttledCallback);
  };
};

// Cache en mémoire simple
export class MemoryCache {
  constructor(maxSize = 100, ttl = 5 * 60 * 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  set(key, value) {
    // Supprimer l'ancienne entrée si elle existe
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    
    // Supprimer les entrées les plus anciennes si on atteint la limite
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  get(key) {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // Vérifier si l'entrée a expiré
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value;
  }

  has(key) {
    return this.get(key) !== null;
  }

  delete(key) {
    return this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}

// Instance globale du cache
export const memoryCache = new MemoryCache();

// Utilitaire pour le chunking de données
export const chunkArray = (array, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

// Traitement par batch pour éviter de bloquer l'UI
export const processBatch = async (items, processor, batchSize = 10, delay = 0) => {
  const chunks = chunkArray(items, batchSize);
  const results = [];
  
  for (const chunk of chunks) {
    const chunkResults = await Promise.all(chunk.map(processor));
    results.push(...chunkResults);
    
    // Petite pause pour ne pas bloquer l'UI
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return results;
};

// Détection des capacités du navigateur
export const getBrowserCapabilities = () => {
  return {
    webp: (() => {
      const canvas = document.createElement('canvas');
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    })(),
    
    intersectionObserver: 'IntersectionObserver' in window,
    
    webWorkers: 'Worker' in window,
    
    serviceWorker: 'serviceWorker' in navigator,
    
    localStorage: (() => {
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
      } catch {
        return false;
      }
    })(),
    
    touchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
  };
};

export default {
  debounce,
  throttle,
  createImageObserver,
  preloadImage,
  preloadImages,
  resizeImage,
  PerformanceMonitor,
  perfMonitor,
  optimizeScroll,
  MemoryCache,
  memoryCache,
  chunkArray,
  processBatch,
  getBrowserCapabilities
};

