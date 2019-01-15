#!/usr/bin/env node
'use strict';
const Path = require('path');
const Bossy = require('bossy');
const Lib = require('../lib');
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
    description: 'Exclude Master (unstable) in graph',
    alias: 'excludeMaster',
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
  html: args.html ? Path.resolve(args.html) : null,
  svg: args.svg ? Path.resolve(args.svg) : null,
  png: args.png ? Path.resolve(args.png) : null,
  animate: args.animate,
  excludeMaster: args.excludeMaster,
  projectName: args.projectName
};

Lib.create(options);
