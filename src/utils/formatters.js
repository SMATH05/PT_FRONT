export function formatLabel(value) {
  return String(value ?? '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
}
