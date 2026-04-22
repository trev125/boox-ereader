const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// These are Node.js globals that epubjs tries to use but won't exist in React Native
// We need to provide them before any module that uses them is evaluated
const { Buffer } = require('buffer');
global.Buffer = global.Buffer || Buffer;
const process = require('process');
global.process = global.process || process;

module.exports = config;