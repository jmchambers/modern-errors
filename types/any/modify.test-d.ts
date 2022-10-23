import {
  expectType,
  expectAssignable,
  expectNotAssignable,
  expectError,
} from 'tsd'

import modernErrors, { Plugin, ErrorInstance } from '../main.js'

const barePlugin = { name: 'test' as const }
const plugin = { ...barePlugin, instanceMethods: { instanceMethod() {} } }

type BErrorInstance = ErrorInstance<[typeof barePlugin]>
type PErrorInstance = ErrorInstance<[typeof plugin]>

const PAnyError = modernErrors([plugin])
const paError = new PAnyError('', { cause: '' })

expectAssignable<Error>(paError)
expectAssignable<ErrorInstance>(paError)
expectAssignable<BErrorInstance>(paError)
expectAssignable<PErrorInstance>(paError)
expectType<'UnknownError'>(paError.name)

const PSError = PAnyError.subclass('PSError')
const psError = new PSError('')

expectAssignable<Error>(psError)
expectAssignable<ErrorInstance>(psError)
expectAssignable<BErrorInstance>(psError)
expectAssignable<PErrorInstance>(psError)
expectType<'PSError'>(psError.name)

const GPAnyError = modernErrors([{} as Plugin])
const gpaError = new GPAnyError('', { cause: '' })
type GPAErrorInstance = InstanceType<typeof GPAnyError>

expectAssignable<Error>(gpaError)
expectAssignable<ErrorInstance>(gpaError)
expectAssignable<BErrorInstance>(gpaError)
expectNotAssignable<PErrorInstance>(gpaError)
expectAssignable<GPAErrorInstance>(gpaError)
expectType<'UnknownError'>(gpaError.name)

const exception = {} as unknown
if (exception instanceof GPAnyError) {
  expectAssignable<GPAErrorInstance>(exception)
}

const GPSError = GPAnyError.subclass('GPSError')
const gpsError = new GPSError('')
type GPSErrorInstance = InstanceType<typeof GPSError>

expectAssignable<Error>(gpsError)
expectAssignable<ErrorInstance>(gpsError)
expectAssignable<BErrorInstance>(gpsError)
expectNotAssignable<PErrorInstance>(gpsError)
expectAssignable<GPAErrorInstance>(gpsError)
expectAssignable<GPSErrorInstance>(gpsError)
expectType<'GPSError'>(gpsError.name)

if (exception instanceof GPSError) {
  expectAssignable<GPSErrorInstance>(exception)
}

const AnyError = modernErrors()
const SError = AnyError.subclass('SError')
const name = 'test' as const

const MessageMethodAnyError = modernErrors([
  { name, instanceMethods: { message: () => {} } },
])
expectType<Error['message']>(
  new MessageMethodAnyError('', { cause: '' }).message,
)

const AnyOneError = modernErrors([
  { name, properties: () => ({ message: 'test' as const }) },
])
expectType<'test'>(new AnyOneError('', { cause: '' }).message)
expectType<'test'>(
  new SError('', { props: { message: 'test' as const } }).message,
)
expectType<never>(new SError('', { props: { message: true } }))

const AnyTwoError = modernErrors([
  { name, properties: () => ({ stack: 'test' as const }) },
])
expectType<'test'>(new AnyTwoError('', { cause: '' }).stack)
expectType<'test'>(new SError('', { props: { stack: 'test' as const } }).stack)
expectType<never>(new SError('', { props: { stack: true } }))

const AnyThreeError = modernErrors([
  { name, properties: () => ({ name: 'test' }) },
])
const ThreeError = AnyThreeError.subclass('ThreeError')
expectType<'ThreeError'>(new ThreeError('').name)
expectType<'SError'>(new SError('', { props: { name: 'test' } }).name)

const AnyFourError = modernErrors([{ name, properties: () => ({ cause: '' }) }])
const FourError = AnyFourError.subclass('FourError')
expectType<Error['cause']>(new FourError('').cause)
expectType<Error['cause']>(new SError('', { props: { cause: '' } }).cause)

const AnyFiveError = modernErrors([
  { name, properties: () => ({ errors: [''] }) },
])
expectError(new AnyFiveError('', { cause: '' }).errors)
expectError(new SError('', { props: { errors: [''] } }).errors)

const AnySixError = modernErrors([
  {
    name,
    properties: () => ({ prop: 'test' as const }),
    instanceMethods: { prop: () => {} },
  },
])
expectAssignable<Function>(new AnySixError('', { cause: '' }).prop)

const AnySevenError = modernErrors([
  { name, instanceMethods: { prop: () => {} } },
])
expectAssignable<Function>(
  new AnySevenError('', { cause: '', props: { prop: '' } }).prop,
)

const AnyEightError = modernErrors([
  { name, properties: () => ({ prop: 'test' as const }) },
])
expectType<'test'>(
  new AnyEightError('', { cause: '', props: { prop: 'test' as const } }).prop,
)
expectType<never>(
  new AnyEightError('', { cause: '', props: { prop: '' as const } }),
)

const AnyNineError = modernErrors([
  { name: 'one' as const, properties: () => ({ prop: 'one' as const }) },
  { name: 'two' as const, properties: () => ({ prop: 'two' as const }) },
])
expectType<undefined>(new AnyNineError('', { cause: '' }).prop)

expectError(
  new SError('', { cause: new SError('', { props: { prop: true } }) }).prop,
)

const AnyTenError = modernErrors([
  { name, properties: () => ({ prop: 'one' }) },
])
expectError(new SError('', { cause: new AnyTenError('') }).prop)

const AnyElevenError = modernErrors([
  { name, instanceMethods: { instanceMethod: () => {} } },
])
expectError(new SError('', { cause: new AnyElevenError('') }).instanceMethod)
