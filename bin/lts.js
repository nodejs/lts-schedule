#!/usr/bin/env node
'use strict';
const Path = require('path');
const { parseArgs } = require('util');
const Lib = require('../lib');
const now = new Date();
const nowString = now.toISOString().slice(0, 10);

const cliArgs = {
  help: {
    description: 'Print usage',
    short: 'h',
    type: 'boolean'
  },
  data: {
    description: 'Input LTS JSON file',
    short: 'd',
    type: 'string',
    default: Path.resolve(__dirname, '..', 'lts.json')
  },
  start: {
    description: 'Query start date',
    short: 's',
    type: 'string',
    default: nowString
  },
  end: {
    description: 'Query end date',
    short: 'e',
    type: 'string',
    default: `${now.getUTCFullYear() + 1}-${nowString.slice(5)}`
  },
  html: {
    description: 'HTML output file',
    short: 'h',
    type: 'string'
  },
  svg: {
    description: 'SVG output file',
    short: 'g',
    type: 'string'
  },
  png: {
    description: 'PNG output file',
    short: 'p',
    type: 'string'
  },
  animate: {
    description: 'Animate bars on load',
    short: 'a',
    type: 'boolean',
    default: false
  },
  excludeMain: {
    description: 'Exclude Main (unstable) in graph',
    short: 'm',
    type: 'boolean',
    default: false
  },
  projectName: {
    description: 'Project Name',
    short: 'n',
    type: 'string',
    default: 'Node.js'
  },
  currentDateMarker: {
    description: 'Current date marker',
    short: 'c',
    type: 'string'
  }
};

let args;
try {
  args = parseArgs({
    args: process.argv.slice(2),
    options: cliArgs,
    strict: true
  }).values;
} catch (error) {
  printUsage();
  throw error;
}

function printUsage () {
  console.log('Usage: lts [options]');
  console.log('');
  console.log('Options:');
  for (const [key, value] of Object.entries(cliArgs)) {
    const short = value.short ? `-${value.short}, ` : '';
    const defaultVal = value.default ? `[=${value.default}]` : '';
    console.log(`  ${short}--${key}${defaultVal}  ${value.description}`);
  }
  console.log('');
}

if (args.help) {
  printUsage();
  return;
}

// Merge defaults with provided arguments
const options = {
  data: require(Path.resolve(args.data)),
  queryStart: new Date(args.start),
  queryEnd: new Date(args.end),
  html: args.html ? Path.resolve(args.html) : null,
  svg: args.svg ? Path.resolve(args.svg) : null,
  png: args.png ? Path.resolve(args.png) : null,
  animate: args.animate,
  excludeMain: args.excludeMain,
  projectName: args.projectName,
  currentDateMarker: args.currentDateMarker
};

Lib.create(options);
