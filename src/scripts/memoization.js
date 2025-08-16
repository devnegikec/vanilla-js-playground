/**
 * Deep equality comparison function
 * @param {*} a - First value to compare
 * @param {*} b - Second value to compare
 * @returns {boolean} - True if values are deeply equal
 */
function deepEquals(a, b) {
  // Check for strict equality (handles primitives and same reference)
  if (a === b) return true;
  
  // Check for null/undefined
  if (a == null || b == null) return a === b;
  
  // Check if both are objects
  if (typeof a !== 'object' || typeof b !== 'object') return false;
  
  // Handle arrays
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEquals(a[i], b[i])) return false;
    }
    return true;
  }
  
  // Handle Date objects
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }
  
  // Handle RegExp objects
  if (a instanceof RegExp && b instanceof RegExp) {
    return a.toString() === b.toString();
  }
  
  // Handle objects
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  
  if (keysA.length !== keysB.length) return false;
  
  for (let key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!deepEquals(a[key], b[key])) return false;
  }
  
  return true;
}

/**
 * Memoization function that works with any type of input using deep equals comparison
 * @param {Function} fn - Function to memoize
 * @param {number} maxCacheSize - Maximum cache size (optional, defaults to 100)
 * @returns {Function} - Memoized function
 */
function memoize(fn, maxCacheSize = 100) {
  if (typeof fn !== 'function') {
    throw new Error('First argument must be a function');
  }
  
  const cache = [];
  
  return function memoized(...args) {
    // Check if we have a cached result for these arguments
    const cachedEntry = cache.find(entry => 
      entry.args.length === args.length && 
      entry.args.every((arg, index) => deepEquals(arg, args[index]))
    );
    
    if (cachedEntry) {
      return cachedEntry.result;
    }
    
    // Calculate the result
    const result = fn.apply(this, args);
    
    // Store in cache
    cache.push({ args: [...args], result });
    
    // Maintain cache size limit (LRU - remove oldest entry)
    if (cache.length > maxCacheSize) {
      cache.shift();
    }
    
    return result;
  };
}

/**
 * Enhanced memoization with cache statistics
 * @param {Function} fn - Function to memoize
 * @param {number} maxCacheSize - Maximum cache size
 * @returns {Function} - Memoized function with cache stats
 */
function memoizeWithStats(fn, maxCacheSize = 100) {
  const memoized = memoize(fn, maxCacheSize);
  const stats = { hits: 0, misses: 0, cacheSize: 0 };
  
  const originalCache = memoized.cache || [];
  
  return function memoizedWithStats(...args) {
    const initialCacheSize = originalCache.length;
    const result = memoized.apply(this, args);
    const finalCacheSize = originalCache.length;
    
    if (finalCacheSize > initialCacheSize) {
      stats.misses++;
    } else {
      stats.hits++;
    }
    
    stats.cacheSize = finalCacheSize;
    return result;
  };
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { memoize, memoizeWithStats, deepEquals };
} else if (typeof window !== 'undefined') {
  window.memoize = memoize;
  window.memoizeWithStats = memoizeWithStats;
  window.deepEquals = deepEquals;
}
