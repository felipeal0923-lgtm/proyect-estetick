// Polyfills for Node.js versions < 20 (Required by newer Expo/Metro versions)
if (!Array.prototype.toReversed) {
  Array.prototype.toReversed = function() { return [...this].reverse(); };
}
if (!Array.prototype.toSorted) {
  Array.prototype.toSorted = function(compareFn) { return [...this].sort(compareFn); };
}
if (!Array.prototype.toSpliced) {
  Array.prototype.toSpliced = function(start, deleteCount, ...items) {
    const copy = [...this];
    copy.splice(start, deleteCount, ...items);
    return copy;
  };
}

const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

module.exports = config;
