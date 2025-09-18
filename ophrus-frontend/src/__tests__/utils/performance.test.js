import { debounce, throttle, MemoryCache, chunkArray } from '../../utils/performance';

describe('Performance Utils', () => {
  describe('debounce', () => {
    jest.useFakeTimers();

    test('retarde l\'exécution de la fonction', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    test('annule les appels précédents', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    afterEach(() => {
      jest.clearAllTimers();
    });
  });

  describe('throttle', () => {
    jest.useFakeTimers();

    test('limite la fréquence d\'exécution', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn();
      throttledFn();
      throttledFn();

      expect(mockFn).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(100);
      throttledFn();

      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    afterEach(() => {
      jest.clearAllTimers();
    });
  });

  describe('MemoryCache', () => {
    test('stocke et récupère des valeurs', () => {
      const cache = new MemoryCache(10, 1000);

      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    test('retourne null pour les clés inexistantes', () => {
      const cache = new MemoryCache(10, 1000);
      expect(cache.get('nonexistent')).toBe(null);
    });

    test('expire les valeurs après le TTL', () => {
      jest.useFakeTimers();
      const cache = new MemoryCache(10, 100);

      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');

      jest.advanceTimersByTime(150);
      expect(cache.get('key1')).toBe(null);

      jest.useRealTimers();
    });

    test('respecte la taille maximale', () => {
      const cache = new MemoryCache(2, 1000);

      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      expect(cache.get('key1')).toBe(null); // Supprimé car dépassement de taille
      expect(cache.get('key2')).toBe('value2');
      expect(cache.get('key3')).toBe('value3');
    });
  });

  describe('chunkArray', () => {
    test('divise un tableau en chunks', () => {
      const array = [1, 2, 3, 4, 5, 6, 7];
      const chunks = chunkArray(array, 3);

      expect(chunks).toEqual([
        [1, 2, 3],
        [4, 5, 6],
        [7]
      ]);
    });

    test('gère les tableaux vides', () => {
      const chunks = chunkArray([], 3);
      expect(chunks).toEqual([]);
    });

    test('gère les chunks plus grands que le tableau', () => {
      const array = [1, 2];
      const chunks = chunkArray(array, 5);
      expect(chunks).toEqual([[1, 2]]);
    });
  });
});

