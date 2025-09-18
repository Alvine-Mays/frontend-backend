// Utilitaires pour l'accessibilité (A11y)

// Gestion du focus pour les modales et overlays
export class FocusManager {
  constructor() {
    this.focusStack = [];
  }

  // Capturer le focus dans un élément
  trapFocus(element) {
    const focusableElements = this.getFocusableElements(element);
    
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Sauvegarder l'élément actuellement focusé
    const previouslyFocused = document.activeElement;
    this.focusStack.push(previouslyFocused);

    // Focuser le premier élément
    firstElement.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }

      if (e.key === 'Escape') {
        this.releaseFocus();
      }
    };

    element.addEventListener('keydown', handleKeyDown);

    // Retourner une fonction de nettoyage
    return () => {
      element.removeEventListener('keydown', handleKeyDown);
      this.releaseFocus();
    };
  }

  // Libérer le focus
  releaseFocus() {
    const previouslyFocused = this.focusStack.pop();
    if (previouslyFocused && previouslyFocused.focus) {
      previouslyFocused.focus();
    }
  }

  // Obtenir tous les éléments focusables dans un conteneur
  getFocusableElements(container) {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    return Array.from(container.querySelectorAll(focusableSelectors))
      .filter(element => {
        return element.offsetWidth > 0 && 
               element.offsetHeight > 0 && 
               !element.hidden;
      });
  }
}

// Instance globale du gestionnaire de focus
export const focusManager = new FocusManager();

// Hook React pour la gestion du focus
export const useFocusTrap = (isActive) => {
  const containerRef = React.useRef();
  const cleanupRef = React.useRef();

  React.useEffect(() => {
    if (isActive && containerRef.current) {
      cleanupRef.current = focusManager.trapFocus(containerRef.current);
    }

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [isActive]);

  return containerRef;
};

// Gestion des annonces pour les lecteurs d'écran
export class ScreenReaderAnnouncer {
  constructor() {
    this.liveRegion = null;
    this.init();
  }

  init() {
    // Créer une région live pour les annonces
    this.liveRegion = document.createElement('div');
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.setAttribute('aria-atomic', 'true');
    this.liveRegion.setAttribute('aria-relevant', 'text');
    this.liveRegion.style.position = 'absolute';
    this.liveRegion.style.left = '-10000px';
    this.liveRegion.style.width = '1px';
    this.liveRegion.style.height = '1px';
    this.liveRegion.style.overflow = 'hidden';
    
    document.body.appendChild(this.liveRegion);
  }

  // Annoncer un message
  announce(message, priority = 'polite') {
    if (!this.liveRegion) return;

    this.liveRegion.setAttribute('aria-live', priority);
    this.liveRegion.textContent = message;

    // Nettoyer après un délai
    setTimeout(() => {
      if (this.liveRegion) {
        this.liveRegion.textContent = '';
      }
    }, 1000);
  }

  // Annoncer avec priorité urgente
  announceUrgent(message) {
    this.announce(message, 'assertive');
  }
}

// Instance globale de l'annonceur
export const screenReader = new ScreenReaderAnnouncer();

// Utilitaires pour les couleurs et contrastes
export const colorUtils = {
  // Calculer la luminance relative d'une couleur
  getLuminance(r, g, b) {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },

  // Calculer le ratio de contraste entre deux couleurs
  getContrastRatio(color1, color2) {
    const l1 = this.getLuminance(...color1);
    const l2 = this.getLuminance(...color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  },

  // Vérifier si le contraste respecte les standards WCAG
  meetsWCAG(color1, color2, level = 'AA', size = 'normal') {
    const ratio = this.getContrastRatio(color1, color2);
    
    if (level === 'AAA') {
      return size === 'large' ? ratio >= 4.5 : ratio >= 7;
    } else {
      return size === 'large' ? ratio >= 3 : ratio >= 4.5;
    }
  },

  // Convertir hex en RGB
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : null;
  }
};

// Détection des préférences utilisateur
export const userPreferences = {
  // Vérifier si l'utilisateur préfère les animations réduites
  prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  // Vérifier si l'utilisateur préfère le mode sombre
  prefersDarkMode() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  },

  // Vérifier si l'utilisateur préfère un contraste élevé
  prefersHighContrast() {
    return window.matchMedia('(prefers-contrast: high)').matches;
  },

  // Écouter les changements de préférences
  onPreferenceChange(callback) {
    const mediaQueries = [
      '(prefers-reduced-motion: reduce)',
      '(prefers-color-scheme: dark)',
      '(prefers-contrast: high)'
    ];

    const listeners = mediaQueries.map(query => {
      const mq = window.matchMedia(query);
      mq.addListener(callback);
      return () => mq.removeListener(callback);
    });

    return () => listeners.forEach(cleanup => cleanup());
  }
};

// Utilitaires pour les labels et descriptions
export const labelUtils = {
  // Générer un ID unique pour les labels
  generateId(prefix = 'a11y') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  // Associer un label à un élément
  associateLabel(element, labelText, description = null) {
    const labelId = this.generateId('label');
    const descId = description ? this.generateId('desc') : null;

    // Créer le label
    const label = document.createElement('label');
    label.id = labelId;
    label.textContent = labelText;
    label.setAttribute('for', element.id || this.generateId('input'));

    if (!element.id) {
      element.id = label.getAttribute('for');
    }

    // Créer la description si fournie
    if (description) {
      const desc = document.createElement('div');
      desc.id = descId;
      desc.textContent = description;
      desc.className = 'sr-only'; // Classe pour masquer visuellement mais garder accessible
      
      element.setAttribute('aria-describedby', descId);
      element.parentNode.insertBefore(desc, element.nextSibling);
    }

    element.parentNode.insertBefore(label, element);
    return { labelId, descId };
  }
};

// Composant React pour les textes accessibles uniquement aux lecteurs d'écran
export const ScreenReaderOnly = ({ children, as: Component = 'span', ...props }) => {
  return React.createElement(Component, {
    ...props,
    className: `sr-only ${props.className || ''}`,
    children
  });
};

// Hook pour annoncer les changements de page
export const usePageAnnouncement = (title) => {
  React.useEffect(() => {
    if (title) {
      document.title = title;
      screenReader.announce(`Page chargée: ${title}`);
    }
  }, [title]);
};

// Hook pour gérer les raccourcis clavier
export const useKeyboardShortcuts = (shortcuts) => {
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      const modifiers = {
        ctrl: e.ctrlKey,
        alt: e.altKey,
        shift: e.shiftKey,
        meta: e.metaKey
      };

      for (const shortcut of shortcuts) {
        if (shortcut.key === key) {
          const modifierMatch = Object.keys(modifiers).every(mod => 
            Boolean(shortcut[mod]) === modifiers[mod]
          );

          if (modifierMatch) {
            e.preventDefault();
            shortcut.action(e);
            break;
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

// Validation d'accessibilité
export const a11yValidator = {
  // Vérifier qu'un élément a un label accessible
  hasAccessibleLabel(element) {
    return !!(
      element.getAttribute('aria-label') ||
      element.getAttribute('aria-labelledby') ||
      element.querySelector('label[for="' + element.id + '"]') ||
      element.textContent?.trim()
    );
  },

  // Vérifier qu'un élément interactif est accessible au clavier
  isKeyboardAccessible(element) {
    const tabIndex = element.getAttribute('tabindex');
    return element.tagName.toLowerCase() === 'button' ||
           element.tagName.toLowerCase() === 'a' ||
           element.tagName.toLowerCase() === 'input' ||
           element.tagName.toLowerCase() === 'select' ||
           element.tagName.toLowerCase() === 'textarea' ||
           (tabIndex !== null && tabIndex !== '-1');
  },

  // Audit basique d'accessibilité
  auditElement(element) {
    const issues = [];

    if (!this.hasAccessibleLabel(element)) {
      issues.push('Élément sans label accessible');
    }

    if (!this.isKeyboardAccessible(element)) {
      issues.push('Élément non accessible au clavier');
    }

    return issues;
  }
};

export default {
  FocusManager,
  focusManager,
  ScreenReaderAnnouncer,
  screenReader,
  colorUtils,
  userPreferences,
  labelUtils,
  ScreenReaderOnly,
  a11yValidator
};

