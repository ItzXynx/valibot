import { _isSameValueZero } from '../../../../utils/index.ts';

/**
 * Merge dataset type.
 */
type MergeDataset =
  | { value: unknown; issue?: undefined }
  | { value?: undefined; issue: true };

/**
 * Merges two values into one single output.
 *
 * @param value1 First value.
 * @param value2 Second value.
 *
 * @returns The merge dataset.
 *
 * @internal
 */
// @__NO_SIDE_EFFECTS__
export function _merge(value1: unknown, value2: unknown): MergeDataset {
  // Continue if data type of values match
  if (typeof value1 === typeof value2) {
    // Return first value if both are equal
    if (
      _isSameValueZero(value1, value2) ||
      (value1 instanceof Date &&
        value2 instanceof Date &&
        _isSameValueZero(+value1, +value2))
    ) {
      return { value: value1 };
    }

    // Return deeply merged object
    if (
      value1 &&
      value2 &&
      value1.constructor === Object &&
      value2.constructor === Object
    ) {
      let nextValue = { ...value1 };

      // Deeply merge own entries of `value2` into `nextValue`
      for (const key of Object.keys(value2)) {
        // Hint: Create an own data property before assigning `__proto__` to
        // avoid invoking its inherited setter. Other keys need no extra copy.
        if (key === '__proto__') {
          nextValue = { ...nextValue, [key]: undefined };
        }

        if (Object.prototype.hasOwnProperty.call(value1, key)) {
          // @ts-expect-error
          const dataset = _merge(value1[key], value2[key]);

          // If dataset has issue, return it
          if (dataset.issue) {
            return dataset;
          }

          // Otherwise, replace merged entry
          // @ts-expect-error
          nextValue[key] = dataset.value;

          // Otherwise, just add entry
        } else {
          // @ts-expect-error
          nextValue[key] = value2[key];
        }
      }

      // Return deeply merged object
      return { value: nextValue };
    }

    // Return deeply merged array
    if (Array.isArray(value1) && Array.isArray(value2)) {
      // Continue if arrays have same length
      if (value1.length === value2.length) {
        const nextValue = [...value1];

        // Merge items of `value2` into `nextValue`
        for (let index = 0; index < value1.length; index++) {
          const dataset = _merge(value1[index], value2[index]);

          // If dataset has issue, return it
          if (dataset.issue) {
            return dataset;
          }

          // Otherwise, replace merged items
          nextValue[index] = dataset.value;
        }

        // Return deeply merged array
        return { value: nextValue };
      }
    }
  }

  // Otherwise, return that values can't be merged
  return { issue: true };
}
