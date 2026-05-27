import { test, expect } from '@playwright/test'

test('LruCache memoize works in browser', async ({ page }) => {
  await page.goto('/test/index.html')
  const result = await page.evaluate(async () => {
    const { LruCache } = await import('/src/index.ts')
    const m = new LruCache()
    let callCount = 0
    const fn = async () => {
      callCount++
      return { success: true, value: 42 }
    }
    const result1 = await m.memoize({ key: 'browser-test', fn })
    const result2 = await m.memoize({ key: 'browser-test', fn })
    return { result1, result2, callCount }
  })
  expect(result.result1).toEqual({ success: true, value: 42 })
  expect(result.result2).toEqual({ success: true, value: 42 })
  expect(result.callCount).toBe(1)
})
