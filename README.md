# lts

[![Current Version](https://img.shields.io/npm/v/lts.svg)](https://www.npmjs.org/package/lts)
[![Build Status via Travis CI](https://travis-ci.org/nodejs/lts-schedule.svg?branch=master)](https://travis-ci.org/nodejs/lts-schedule)
[![belly-button-style](https://cdn.rawgit.com/cjihrig/belly-button/master/badge.svg)](https://github.com/cjihrig/belly-button)

A command line utility that generates the Node.js LTS schedule as a graph. Accepts JSON LTS data and a date range as inputs. Writes the LTS graph as HTML, SVG, and PNG files.

## Example Usage

```
node bin/lts.js -s 2017-04-01 -e 2019-04-01 -h output.html -g output.svg -p output.png
```

## Options

- `-d`, `--data` - The path of the input JSON file. The JSON file should be of the same format as the [one in Node's LTS repo](https://github.com/nodejs/LTS/blob/master/schedule.json). If this option is not provided, `lts` uses its own bundled JSON file.
- `-s`, `--start` - The start date of the graph. Internally, this option is passed to `new Date()`. Optional. Defaults to the current date.
- `-e`, `--end` - The end date of the graph. Internally, this option is passed to `new Date()`. Optional. Defaults to one year from the current date.
- `-h`, `--html` - The location to write the HTML output file. Optional.
- `-g`, `--svg` - The location to write the SVG output file. Optional.
- `-p`, `--png` - The location to write the PNG output file. Uses `svg2png` under the hood. Optional.
- `-a`, `--animate` - Animate the bars of the graph on load.
- `-m`, `--excludeMaster` - Exclude the `Master (unstable)` bar that is ever-present at the top of the graph. Optional. Defaults to false
- `-n`, `--projectName` - Provide a project name for the graph which will be displayed on the left axis beside each version. Optional. Defaults to `Node.js`
