export function convertStringToFileName(str: string): string {
  return str
    .trim() // Remove leading and trailing whitespace
    .toLowerCase() // Convert to lowercase (optional)
    .replace(/\s+/g, "_") // Replace spaces with underscores
    .replace(/[^a-z0-9_]/g, ""); // Remove all non-alphanumeric characters except underscores
}
