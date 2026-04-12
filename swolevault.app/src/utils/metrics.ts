/**
 * Converts Pounds to Kilograms
 */
export const lbsToKg = (lbs: number): number => {
  return parseFloat((lbs / 2.20462).toFixed(2));
};

/**
 * Converts Feet and Inches to Centimeters
 */
export const ftInToCm = (feet: number, inches: number): number => {
  const totalInches = feet * 12 + inches;
  return parseFloat((totalInches * 2.54).toFixed(2));
};