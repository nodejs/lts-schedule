#!/usr/bin/env node
'use strict';
const Path = require('path');
const Bossy = require('bossy');
const Lib = require('../lib');
const { writeFileSync } = require('node:fs');
const Svg2png = require('svg2png');

const now = new Date();
const oneYearFromNow = new Date();

oneYearFromNow.setFullYear(now.getFullYear() + 1);

const cliArgs = {
  'd': {
    description: 'Input LTS JSON file',
    alias: 'data',
    type: 'string',
    require: false,
    multiple: false,
    default: Path.resolve(__dirname, '..', 'lts.json')
  },
  's': {
    description: 'Query start date',
    alias: 'start',
    type: 'string',
    require: false,
    multiple: false,
    default: now
  },
  'e': {
    description: 'Query end date',
    alias: 'end',
    type: 'string',
    require: false,
    multiple: false,
    default: oneYearFromNow
  },
  'h': {
    description: 'HTML output file',
    alias: 'html',
    type: 'string',
    require: false,
    multiple: false,
    default: null
  },
  'g': {
    description: 'SVG output file',
    alias: 'svg',
    type: 'string',
    require: false,
    multiple: false,
    default: null
  },
  'p': {
    description: 'PNG output file',
    alias: 'png',
    type: 'string',
    require: false,
    multiple: false,
    default: null
  },
  'a': {
    description: 'Animate bars on load',
    alias: 'animate',
    type: 'boolean',
    require: false,
    multiple: false,
    default: false
  },
  'm': {
    description: 'Exclude Main (unstable) in graph',
    alias: 'excludeMain',
    type: 'boolean',
    require: false,
    multiple: false,
    default: false
  },
  'n': {
    description: 'Project Name',
    alias: 'projectName',
    type: 'string',
    require: false,
    multiple: false,
    default: 'Node.js'
  },
  'c': {
    description: 'Current date marker',
    alias: 'currentDateMarker',
    type: 'string',
    require: false,
    multiple: false,
    default: null
  }
};

const args = Bossy.parse(cliArgs, { argv: process.argv });

if (args instanceof Error) {
  Bossy.usage(cliArgs, args.message);
  process.exit(1);
}

const options = {
  data: require(args.data),
  queryStart: new Date(args.start),
  queryEnd: new Date(args.end),
  animate: args.animate,
  excludeMain: args.excludeMain,
  projectName: args.projectName,
  currentDateMarker: args.currentDateMarker
};

const d3n = Lib.create(options);

if (args.html) {
  writeFileSync(Path.resolve(args.html), d3n.html());
}

if (args.svg) {
  writeFileSync(Path.resolve(args.svg), d3n.svgString());
}

if (args.png) {
  writeFileSync(Path.resolve(args.png), Svg2png.sync(Buffer.from(d3n.svgString())));
}
