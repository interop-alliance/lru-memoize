import { describe, it, expect } from 'vitest'
import delay from 'delay'
import { LruCache } from '../../src/index.js'

describe('API', () => {
  it('has the proper exports', async () => {
    expect(LruCache).toBeDefined()
    const m = new LruCache({ ttl: 10 })
    expect(m).toBeDefined()
    expect(m.memoize).toBeTypeOf('function')
  })
  describe('memoize', () => {
    it('adds an item to the cache', async () => {
      const m = new LruCache()
      let executedTestFn = false
      const testFn = async () => {
        // simulate an async task
        await delay(100)
        executedTestFn = true
        return { success: true, timestamp: Date.now() }
      }
      const result = await m.memoize({
        key: 'test1',
        fn: testFn
      })
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
      expect(result.timestamp).toBeTypeOf('number')
      expect(executedTestFn).toBe(true)

      // the second request should use the cached promise and resolved result
      executedTestFn = false
      const result2 = await m.memoize({
        key: 'test1',
        fn: testFn
      })
      expect(result2).toBeDefined()
      expect(result2).toEqual(result)
      expect(executedTestFn).toBe(false)
    })
    it('adds an item to the cache w/custom `ttl`', async () => {
      const m = new LruCache()
      let executedTestFn = false
      const testFn = async () => {
        // simulate an async task
        await delay(100)
        executedTestFn = true
        return { success: true, timestamp: Date.now() }
      }
      const ttl = 200
      const result = await m.memoize({
        key: 'test1',
        fn: testFn,
        options: { ttl }
      })
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
      expect(result.timestamp).toBeTypeOf('number')
      expect(executedTestFn).toBe(true)

      // the second request should use the cached promise and resolved result
      executedTestFn = false
      const result2 = await m.memoize({
        key: 'test1',
        fn: testFn
      })
      expect(result2).toBeDefined()
      expect(result2).toEqual(result)
      expect(executedTestFn).toBe(false)

      // third test should not find the expired result
      await delay(ttl + 1)
      executedTestFn = false
      const result3 = await m.memoize({
        key: 'test1',
        fn: testFn
      })
      expect(result3).toBeDefined()
      expect(result3).not.toEqual(result)
      expect(executedTestFn).toBe(true)
    })
  })
  describe('delete', () => {
    it('removes an item from the cache', async () => {
      const m = new LruCache()
      let executedTestFn = false
      const testFn = async () => {
        // simulate an async task
        await delay(100)
        executedTestFn = true
        return { success: true, timestamp: Date.now() }
      }
      const result = await m.memoize({
        key: 'test1',
        fn: testFn
      })
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
      expect(result.timestamp).toBeTypeOf('number')
      expect(executedTestFn).toBe(true)

      // the second request should use the cached promise and resolved result
      // that includes the same timestamp
      executedTestFn = false
      const result2 = await m.memoize({
        key: 'test1',
        fn: testFn
      })
      expect(result2).toBeDefined()
      expect(result2.success).toBe(true)
      expect(result2.timestamp).toEqual(result.timestamp)
      expect(executedTestFn).toBe(false)

      // delete the cached promise
      const deleted1 = m.delete('test1')
      // should return `true` because `test1` was removed
      expect(deleted1).toBe(true)
      // should now return `false` because `test1` was already removed
      const deleted2 = m.delete('test1')
      expect(deleted2).toBe(false)

      // after deleting the cache entry, testFn should be executed producing
      // a result with a new timestamp
      executedTestFn = false
      const result3 = await m.memoize({
        key: 'test1',
        fn: testFn
      })
      expect(result3).toBeDefined()
      expect(result3.success).toBe(true)
      expect(result3.timestamp).not.toEqual(result.timestamp)
      expect(executedTestFn).toBe(true)
    })
  })
})
