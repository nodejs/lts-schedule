# lts

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
