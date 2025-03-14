class AssertionError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = "AssertionError";
    }
}

function assertFn(condition: boolean, message?: string) {
    if (!condition) {
        throw new AssertionError(message);
    }
}

/**
 * Assert function that only is included in the development build,
 * will get stripped out for production builds
 * 
 * @param condition Assertion condition
 * @param message Error message
 */
// eslint-disable-next-line @typescript-eslint/no-empty-function
export const assert = import.meta.env.DEV ? assertFn : () => {};
export {
    AssertionError
};
