import { expectAssignable, expectNotAssignable } from 'tsd'

import ModernError, { Plugin, ErrorClass } from 'modern-errors'

const barePlugin = { name: 'test' as const }
const fullPlugin = {
  ...barePlugin,
  instanceMethods: { instanceMethod() {} },
  staticMethods: { staticMethod() {} },
}

type BareErrorClass = ErrorClass<[typeof barePlugin]>
type FullErrorClass = ErrorClass<[typeof fullPlugin]>

const BaseError = ModernError.subclass('BaseError', { plugins: [fullPlugin] })

expectAssignable<ErrorClass>(BaseError)
expectAssignable<BareErrorClass>(BaseError)
expectAssignable<FullErrorClass>(BaseError)

const ChildError = BaseError.subclass('ChildError')

expectAssignable<ErrorClass>(ChildError)
expectAssignable<BareErrorClass>(ChildError)
expectAssignable<FullErrorClass>(ChildError)

const CustomError = BaseError.subclass('CustomError', {
  custom: class extends BaseError {
    prop = true
  },
})

expectAssignable<ErrorClass>(CustomError)
expectAssignable<BareErrorClass>(CustomError)
expectAssignable<FullErrorClass>(CustomError)

const WideError = ModernError.subclass('WideError', { plugins: [{} as Plugin] })

expectAssignable<ErrorClass>(WideError)
expectAssignable<BareErrorClass>(WideError)
expectNotAssignable<FullErrorClass>(WideError)

const WideChildError = WideError.subclass('WideChildError')

expectAssignable<ErrorClass>(WideChildError)
expectAssignable<BareErrorClass>(WideChildError)
expectNotAssignable<FullErrorClass>(WideChildError)

const CustomWideError = WideError.subclass('CustomWideError', {
  custom: class extends WideError {
    prop = true
  },
})

expectAssignable<ErrorClass>(CustomWideError)
expectAssignable<BareErrorClass>(CustomWideError)
expectNotAssignable<FullErrorClass>(CustomWideError)