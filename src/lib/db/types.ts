/**
 * Defines a type for MongoDB projection objects used in the `collection.aggregate()` method.
 * Each key corresponds to a field in the document, and the value must be either:
 * - `1` to include the field in the result, or
 * - `0` to exclude the field from the result.
 */
export type Projection<T> = {
	[K in keyof T]?: 1 | 0;
};
