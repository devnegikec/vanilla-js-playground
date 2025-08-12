import { greet } from '../src/scripts/utils'

test('greet function', () => {
  expect(greet('Alice')).toBe('Hello, Alice!')
})