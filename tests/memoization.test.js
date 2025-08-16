const { memoize, memoizeWithStats, deepEquals } = require('../src/scripts/memoization.js');

describe('Memoization Function Tests', () => {
  
  // Test Case 1: Complex nested object with arrays
  test('Test Case 1: Complex nested object with arrays', () => {
    const complexFunction = (obj) => {
      return JSON.stringify(obj).length + obj.data.items.reduce((sum, item) => sum + item.value, 0);
    };
    
    const memoizedFn = memoize(complexFunction);
    
    const input1 = {
      id: 'user123',
      data: {
        items: [
          { name: 'item1', value: 10, metadata: { tags: ['urgent', 'important'] } },
          { name: 'item2', value: 20, metadata: { tags: ['normal'] } }
        ],
        settings: {
          theme: 'dark',
          notifications: { email: true, push: false }
        }
      }
    };
    
    const result1 = memoizedFn(input1);
    const result2 = memoizedFn(input1); // Should use cache
    
    expect(result1).toBe(result2);
    expect(result1).toBe(JSON.stringify(input1).length + 30);
  });

  // Test Case 2: Multi-dimensional arrays with objects
  test('Test Case 2: Multi-dimensional arrays with objects', () => {
    const matrixProcessor = (matrix) => {
      return matrix.flat(2).reduce((sum, cell) => {
        return sum + (typeof cell === 'object' ? cell.value : cell);
      }, 0);
    };
    
    const memoizedFn = memoize(matrixProcessor);
    
    const input2 = [
      [
        [1, 2, { value: 3, type: 'special' }],
        [4, { value: 5, metadata: { created: new Date('2023-01-01') } }, 6]
      ],
      [
        [{ value: 7, nested: { deep: { very: 'deep' } } }, 8, 9],
        [10, 11, { value: 12, array: [1, 2, 3] }]
      ]
    ];
    
    const result1 = memoizedFn(input2);
    const result2 = memoizedFn(input2); // Should use cache
    
    expect(result1).toBe(result2);
    expect(result1).toBe(78); // Sum of all values
  });

  // Test Case 3: Functions with multiple complex arguments
  test('Test Case 3: Functions with multiple complex arguments', () => {
    const multiArgFunction = (config, data, options) => {
      return `${config.env}-${data.users.length}-${options.features.join(',')}`;
    };
    
    const memoizedFn = memoize(multiArgFunction);
    
    const config = {
      env: 'production',
      database: { host: 'localhost', port: 5432 },
      cache: { redis: { enabled: true, ttl: 3600 } }
    };
    
    const data = {
      users: [
        { id: 1, profile: { name: 'John', preferences: { theme: 'dark' } } },
        { id: 2, profile: { name: 'Jane', preferences: { theme: 'light' } } }
      ],
      metadata: { version: '1.0', timestamp: new Date('2023-01-01') }
    };
    
    const options = {
      features: ['auth', 'logging', 'monitoring'],
      flags: { experimental: true, beta: false }
    };
    
    const result1 = memoizedFn(config, data, options);
    const result2 = memoizedFn(config, data, options); // Should use cache
    
    expect(result1).toBe(result2);
    expect(result1).toBe('production-2-auth,logging,monitoring');
  });

  // Test Case 4: Deep nested objects with similar structures
  test('Test Case 4: Deep nested objects with similar structures', () => {
    const deepProcessor = (obj) => {
      const traverse = (o, depth = 0) => {
        if (typeof o !== 'object' || o === null) return depth;
        return Math.max(...Object.values(o).map(v => traverse(v, depth + 1)));
      };
      return traverse(obj);
    };
    
    const memoizedFn = memoize(deepProcessor);
    
    const input4 = {
      level1: {
        level2: {
          level3: {
            level4: {
              level5: {
                data: 'deep value',
                array: [1, 2, { nested: { more: 'data' } }]
              }
            }
          }
        }
      },
      parallel: {
        branch: {
          leaf: 'value'
        }
      }
    };
    
    const result1 = memoizedFn(input4);
    const result2 = memoizedFn(input4); // Should use cache
    
    expect(result1).toBe(result2);
    expect(result1).toBeGreaterThan(5);
  });

  // Test Case 5: Arrays with mixed data types and nested structures
  test('Test Case 5: Arrays with mixed data types', () => {
    const mixedArrayProcessor = (arr) => {
      return arr.map(item => {
        if (typeof item === 'string') return item.length;
        if (typeof item === 'number') return item * 2;
        if (Array.isArray(item)) return item.length;
        if (typeof item === 'object' && item !== null) return Object.keys(item).length;
        return 0;
      }).reduce((sum, val) => sum + val, 0);
    };
    
    const memoizedFn = memoize(mixedArrayProcessor);
    
    const input5 = [
      'hello world',
      42,
      [1, 2, 3, 4, 5],
      {
        name: 'test',
        data: { nested: true },
        items: [1, 2, 3],
        metadata: { created: new Date(), tags: ['a', 'b'] }
      },
      null,
      undefined,
      true,
      new Date('2023-01-01'),
      /regex/gi
    ];
    
    const result1 = memoizedFn(input5);
    const result2 = memoizedFn(input5); // Should use cache
    
    expect(result1).toBe(result2);
  });

  // Test Case 6: Object with Date, RegExp, and special values
  test('Test Case 6: Objects with Date, RegExp, and special values', () => {
    const specialValueProcessor = (obj) => {
      let score = 0;
      if (obj.date instanceof Date) score += obj.date.getFullYear();
      if (obj.regex instanceof RegExp) score += obj.regex.source.length;
      if (obj.nullValue === null) score += 10;
      if (obj.undefinedValue === undefined) score += 20;
      if (obj.booleanValue === true) score += 5;
      return score + obj.nested.array.length;
    };
    
    const memoizedFn = memoize(specialValueProcessor);
    
    const input6 = {
      date: new Date('2023-12-25'),
      regex: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      nullValue: null,
      undefinedValue: undefined,
      booleanValue: true,
      nested: {
        array: [1, 2, 3, 4, 5, 6, 7],
        object: { key: 'value' }
      }
    };
    
    const result1 = memoizedFn(input6);
    const result2 = memoizedFn(input6); // Should use cache
    
    expect(result1).toBe(result2);
  });

  // Test Case 7: Large array with complex objects
  test('Test Case 7: Large array with complex objects', () => {
    const largeArrayProcessor = (arr) => {
      return arr
        .filter(item => item.active)
        .map(item => item.score * item.multiplier)
        .reduce((sum, val) => sum + val, 0);
    };
    
    const memoizedFn = memoize(largeArrayProcessor);
    
    const input7 = Array.from({ length: 50 }, (_, i) => ({
      id: `item_${i}`,
      active: i % 3 === 0,
      score: Math.floor(Math.random() * 100) + 1,
      multiplier: Math.random() * 2 + 1,
      metadata: {
        created: new Date(2023, i % 12, (i % 28) + 1),
        tags: [`tag_${i % 5}`, `category_${i % 3}`],
        nested: {
          level1: { level2: { value: i * 2 } }
        }
      }
    }));
    
    const result1 = memoizedFn(input7);
    const result2 = memoizedFn(input7); // Should use cache
    
    expect(result1).toBe(result2);
    expect(typeof result1).toBe('number');
  });

  // Test Case 8: Nested functions with closures and complex state
  test('Test Case 8: Complex object with functions and closures', () => {
    const functionProcessor = (obj) => {
      let total = 0;
      if (typeof obj.calculator === 'function') {
        total += obj.calculator(obj.data.numbers);
      }
      total += obj.data.nested.reduce((sum, item) => sum + item.weight, 0);
      return total;
    };
    
    const memoizedFn = memoize(functionProcessor);
    
    const input8 = {
      calculator: (numbers) => numbers.reduce((sum, n) => sum + n * 2, 0),
      data: {
        numbers: [1, 2, 3, 4, 5],
        nested: [
          { name: 'A', weight: 10, config: { enabled: true, priority: 1 } },
          { name: 'B', weight: 20, config: { enabled: false, priority: 2 } },
          { name: 'C', weight: 15, config: { enabled: true, priority: 3 } }
        ]
      },
      metadata: {
        version: '2.1.0',
        features: ['advanced', 'premium'],
        settings: {
          theme: { primary: '#007bff', secondary: '#6c757d' },
          layout: { sidebar: true, header: 'fixed' }
        }
      }
    };
    
    const result1 = memoizedFn(input8);
    const result2 = memoizedFn(input8); // Should use cache
    
    expect(result1).toBe(result2);
    expect(result1).toBe(75); // (1+2+3+4+5)*2 + 10+20+15
  });

  // Test Case 9: Graph-like structure with references
  test('Test Case 9: Graph-like structure with cross-references', () => {
    const graphProcessor = (graph) => {
      let totalConnections = 0;
      let totalWeight = 0;
      
      for (const nodeId in graph.nodes) {
        const node = graph.nodes[nodeId];
        totalConnections += node.connections.length;
        totalWeight += node.weight;
      }
      
      return { totalConnections, totalWeight, nodeCount: Object.keys(graph.nodes).length };
    };
    
    const memoizedFn = memoize(graphProcessor);
    
    const input9 = {
      nodes: {
        'A': {
          id: 'A',
          weight: 10,
          connections: ['B', 'C'],
          data: { type: 'root', metadata: { created: new Date('2023-01-01') } }
        },
        'B': {
          id: 'B',
          weight: 20,
          connections: ['A', 'C', 'D'],
          data: { type: 'intermediate', metadata: { created: new Date('2023-01-02') } }
        },
        'C': {
          id: 'C',
          weight: 15,
          connections: ['A', 'B'],
          data: { type: 'leaf', metadata: { created: new Date('2023-01-03') } }
        },
        'D': {
          id: 'D',
          weight: 25,
          connections: ['B'],
          data: { type: 'leaf', metadata: { created: new Date('2023-01-04') } }
        }
      },
      metadata: {
        graphType: 'directed',
        version: '1.0',
        properties: {
          weighted: true,
          cyclic: false,
          connected: true
        }
      }
    };
    
    const result1 = memoizedFn(input9);
    const result2 = memoizedFn(input9); // Should use cache
    
    expect(result1).toEqual(result2);
    expect(result1.totalConnections).toBe(8);
    expect(result1.totalWeight).toBe(70);
    expect(result1.nodeCount).toBe(4);
  });

  // Test Case 10: Complex recursive data structure
  test('Test Case 10: Complex recursive tree structure', () => {
    const treeProcessor = (tree) => {
      const processNode = (node) => {
        let score = node.value || 0;
        if (node.children && node.children.length > 0) {
          score += node.children.reduce((sum, child) => sum + processNode(child), 0);
        }
        return score * (node.multiplier || 1);
      };
      
      return {
        totalScore: processNode(tree),
        depth: getDepth(tree),
        nodeCount: countNodes(tree)
      };
    };
    
    const getDepth = (node) => {
      if (!node.children || node.children.length === 0) return 1;
      return 1 + Math.max(...node.children.map(getDepth));
    };
    
    const countNodes = (node) => {
      if (!node.children || node.children.length === 0) return 1;
      return 1 + node.children.reduce((sum, child) => sum + countNodes(child), 0);
    };
    
    const memoizedFn = memoize(treeProcessor);
    
    const input10 = {
      id: 'root',
      value: 10,
      multiplier: 1.5,
      metadata: { type: 'root', created: new Date('2023-01-01') },
      children: [
        {
          id: 'child1',
          value: 20,
          multiplier: 2,
          metadata: { type: 'branch', level: 1 },
          children: [
            {
              id: 'grandchild1',
              value: 5,
              multiplier: 1,
              metadata: { type: 'leaf', level: 2 },
              children: []
            },
            {
              id: 'grandchild2',
              value: 8,
              multiplier: 1.2,
              metadata: { type: 'leaf', level: 2 },
              children: []
            }
          ]
        },
        {
          id: 'child2',
          value: 15,
          multiplier: 1.8,
          metadata: { type: 'branch', level: 1 },
          children: [
            {
              id: 'grandchild3',
              value: 12,
              multiplier: 0.8,
              metadata: { type: 'leaf', level: 2 },
              children: []
            }
          ]
        }
      ]
    };
    
    const result1 = memoizedFn(input10);
    const result2 = memoizedFn(input10); // Should use cache
    
    expect(result1).toEqual(result2);
    expect(result1.depth).toBe(3);
    expect(result1.nodeCount).toBe(6);
    expect(typeof result1.totalScore).toBe('number');
  });

  // Test deep equals function separately
  describe('Deep Equals Function Tests', () => {
    test('should handle primitive values', () => {
      expect(deepEquals(1, 1)).toBe(true);
      expect(deepEquals('hello', 'hello')).toBe(true);
      expect(deepEquals(true, true)).toBe(true);
      expect(deepEquals(null, null)).toBe(true);
      expect(deepEquals(undefined, undefined)).toBe(true);
      expect(deepEquals(1, 2)).toBe(false);
    });

    test('should handle arrays', () => {
      expect(deepEquals([1, 2, 3], [1, 2, 3])).toBe(true);
      expect(deepEquals([1, [2, 3]], [1, [2, 3]])).toBe(true);
      expect(deepEquals([1, 2, 3], [1, 2, 4])).toBe(false);
    });

    test('should handle objects', () => {
      expect(deepEquals({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
      expect(deepEquals({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
      expect(deepEquals({ a: 1, b: 2 }, { a: 1, b: 3 })).toBe(false);
    });

    test('should handle Date objects', () => {
      const date1 = new Date('2023-01-01');
      const date2 = new Date('2023-01-01');
      const date3 = new Date('2023-01-02');
      
      expect(deepEquals(date1, date2)).toBe(true);
      expect(deepEquals(date1, date3)).toBe(false);
    });

    test('should handle RegExp objects', () => {
      expect(deepEquals(/abc/g, /abc/g)).toBe(true);
      expect(deepEquals(/abc/g, /abc/i)).toBe(false);
    });
  });

  // Test memoization cache behavior
  describe('Memoization Cache Behavior', () => {
    test('should cache results correctly', () => {
      let callCount = 0;
      const expensiveFunction = (x) => {
        callCount++;
        return x * x;
      };
      
      const memoizedFn = memoize(expensiveFunction);
      
      expect(memoizedFn(5)).toBe(25);
      expect(callCount).toBe(1);
      
      expect(memoizedFn(5)).toBe(25);
      expect(callCount).toBe(1); // Should not increment
      
      expect(memoizedFn(6)).toBe(36);
      expect(callCount).toBe(2);
    });

    test('should respect cache size limit', () => {
      let callCount = 0;
      const fn = (x) => {
        callCount++;
        return x;
      };
      
      const memoizedFn = memoize(fn, 2); // Cache size of 2
      
      memoizedFn(1);
      memoizedFn(2);
      memoizedFn(3); // Should evict first entry
      
      expect(callCount).toBe(3);
      
      memoizedFn(1); // Should call function again (was evicted)
      expect(callCount).toBe(4);
      
      memoizedFn(2); // Should use cache
      memoizedFn(3); // Should use cache
      expect(callCount).toBe(4);
    });
  });
});
