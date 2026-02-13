/**
 * Vitest 4 requires regular functions (not arrows) for mockImplementation
 * when the mock is invoked with `new`. Arrow functions cannot be constructors.
 */
export function mockConstructor<T>(implementation: T) {
  return function (this: unknown) {
    return implementation;
  };
}
