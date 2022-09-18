import { ErrorName } from 'error-custom-class'

type Class<Instance extends object = object, Args extends any[] = any[]> = {
  new (...args: Args): Instance
  prototype: Instance
}

declare class CustomError<
  ErrorNameArg extends ErrorName = ErrorName,
  Options extends object = object,
> extends Error {
  constructor(message: string, options?: Options & ErrorOptions)
  name: ErrorNameArg
}

/**
 * Base class of the `ErrorClasses` passed to `modernErrors()`.
 *
 * @example
 * ```js
 * try {
 *   throw new AuthError('Could not authenticate.')
 * } catch (cause) {
 *   throw new AnyError('Could not read the file.', { cause })
 *   // Still an AuthError
 * }
 * ```
 */
export declare class AnyError<
  ErrorNameArg extends ErrorName,
> extends CustomError<ErrorNameArg> {
  /**
   * Normalizes invalid errors and assigns the `UnknownError` class to
   * _unknown_ errors. This should wrap each main function.
   *
   * @example
   * ```js
   * export const main = async function (filePath) {
   *   try {
   *     return await readContents(filePath)
   *   } catch (error) {
   *     throw AnyError.normalize(error)
   *   }
   * }
   * ```
   */
  static normalize(error: unknown): CustomError<ErrorName>
}

/**
 * Class-specific options
 */
type ClassOptions = {
  /**
   * [Custom class](#custom-logic) to add any methods, `constructor` or
   * properties.
   * It must `extend` from
   * [`Error`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error).
   *
   * @example
   * ```js
   * const { InputError, UnknownError, AnyError } = modernErrors({
   *   // `*.custom` applies to a single class
   *   InputError: {
   *     custom: class extends Error {
   *       constructor(message, options) {
   *         // Modifying `message` or `options` should be done before `super()`
   *         message += message.endsWith('.') ? '' : '.'
   *
   *         // `super()` should be called with both arguments
   *         super(message, options)
   *
   *         // `name` is automatically added, so this is not necessary
   *         // this.name = 'InputError'
   *       }
   *     },
   *   },
   *
   *   // `AnyError.custom` applies to all classes
   *   AnyError: {
   *     custom: class extends Error {
   *       isUserInput() {
   *         return this.message.includes('user')
   *       }
   *     },
   *   },
   *
   *   UnknownError: {},
   * })
   *
   * const error = new InputError('Wrong user name')
   * console.log(error.message) // 'Wrong user name.'
   * console.log(error.isUserInput()) // true
   * ```
   */
  readonly custom?: typeof AnyError<ErrorName>
}

/**
 * Error classes definitions. Object where:
 *   - Each key is the class name, e.g. `InputError`.
 *     One of the classes must be named `UnknownError`.
 *   - Each value is an object with the class options.
 */
type Definitions = {
  readonly UnknownError: ClassOptions
  readonly [ErrorNameArg: ErrorName]: ClassOptions
}

/**
 * Error class returned by `modernErrors()`
 */
type ReturnErrorClass<
  DefinitionsArg extends Definitions,
  ErrorNameArg extends ErrorName,
> = DefinitionsArg[ErrorNameArg]['custom'] extends typeof AnyError<ErrorName>
  ? DefinitionsArg[ErrorNameArg]['custom']
  : typeof AnyError<ErrorNameArg>

/**
 * All error classes returned by `modernErrors()`
 */
type ReturnErrorClasses<DefinitionsArg extends Definitions> = {
  [ErrorNameArg in Exclude<
    keyof DefinitionsArg & ErrorName,
    'AnyError'
  >]: ReturnErrorClass<DefinitionsArg, ErrorNameArg>
}

/**
 * Creates and returns error classes.
 * Also returns their base class `AnyError`.
 *
 * @example
 * ```js
 * export const {
 *   // Custom error classes
 *   InputError,
 *   AuthError,
 *   DatabaseError,
 *   UnknownError,
 *   // Base error class
 *   AnyError,
 * } = modernErrors({
 *   // Custom error classes definitions
 *   InputError: {},
 *   AuthError: {},
 *   DatabaseError: {},
 *   UnknownError: {},
 * })
 * ```
 */
export default function modernErrors<DefinitionsArg extends Definitions>(
  definitions: DefinitionsArg,
): ReturnErrorClasses<DefinitionsArg> & { AnyError: typeof AnyError<ErrorName> }
