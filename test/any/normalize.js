import test from 'ava'
import { each } from 'test-each'

import { defineClassOpts, createAnyError } from '../helpers/main.js'

const { TestError, UnknownError, AnyError } = defineClassOpts()

test('AnyError.normalize() normalizes unknown errors', (t) => {
  t.true(AnyError.normalize() instanceof Error)
})

test('AnyError.normalize() normalizes known errors', (t) => {
  const error = new TestError('test')
  error.name = 'TestError'
  t.true(Object.getOwnPropertyDescriptor(error, 'name').enumerable)
  error.message = true
  const normalizedError = AnyError.normalize(error)
  t.true(normalizedError instanceof TestError)
  t.is(normalizedError.name, 'TestError')
  t.false(Object.getOwnPropertyDescriptor(error, 'name').enumerable)
  t.is(normalizedError.message, '')
})

each([TestError, UnknownError], ({ title }, ErrorClass) => {
  test(`AnyError.normalize() keeps error class if known | ${title}`, (t) => {
    const error = new ErrorClass('test')
    const sameError = AnyError.normalize(error)
    t.is(error, sameError)
    t.true(sameError instanceof ErrorClass)
  })
})

test('AnyError.normalize() uses UnknownError if unknown', (t) => {
  const unknownError = new Error('test', { cause: '' })
  const error = AnyError.normalize(unknownError)
  t.true(error instanceof UnknownError)
  t.is(error.message, unknownError.message)
})

test('AnyError.normalize() prevents naming collisions', (t) => {
  const { TestError: OtherTestError } = defineClassOpts()
  t.true(AnyError.normalize(new OtherTestError('test')) instanceof UnknownError)
})

test('AnyError.normalize() cannot be called before AnyError.subclass()', (t) => {
  const TestAnyError = createAnyError()
  t.throws(TestAnyError.normalize)
})
