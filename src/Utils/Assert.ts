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

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const assert = import.meta.env.DEV ? assertFn : () => {};
export {
    AssertionError
};
