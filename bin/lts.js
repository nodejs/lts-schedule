#!/usr/bin/env node
'use strict';
import { resolve } from 'node:path';
import Bossy from 'bossy';
import { create } from '../lib/index.js';

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
    default: resolve(__dirname, '..', 'lts.json')
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
  }
};

const args = Bossy.parse(cliArgs, { argv: process.argv });

if (args instanceof Error) {
  Bossy.usage(cliArgs, args.message);
  process.exit(1);
}

const options = {
  data: await import(args.data),
  queryStart: new Date(args.start),
  queryEnd: new Date(args.end),
  html: args.html ? resolve(args.html) : null,
  svg: args.svg ? resolve(args.svg) : null,
  png: args.png ? resolve(args.png) : null,
  animate: args.animate,
  excludeMain: args.excludeMain,
  projectName: args.projectName
};

create(options);
