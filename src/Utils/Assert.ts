function assertFn(condition: boolean, message: string) {
    if (!condition) {
        throw new Error(message);
    }
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const assert = import.meta.env.DEV ? assertFn : () => {};
