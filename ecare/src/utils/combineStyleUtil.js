import clsx from "clsx";

/**
 * Utility function to merge CSS module styles with styles passed through props
 * @param {Object} defaultStyles - The CSS module's default styles
 * @param {Object} customStyles - The styles passed through props
 * @return {Object} - Object containing merged styles
 */
export const combineStyles = (defaultStyles, customStyles = {}) => {
  const mergedStyles = {};

  // Loop through keys in the default styles
  Object.keys(defaultStyles).forEach((key) => {
    // Merge the default style with the corresponding custom style using clsx
    mergedStyles[key] = clsx(defaultStyles[key], customStyles[key]);
  });

  return mergedStyles;
};
