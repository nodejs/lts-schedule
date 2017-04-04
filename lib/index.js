'use strict';
const Fs = require('fs');
const D3 = require('d3');
const D3Node = require('d3-node');

const styles = `
.current {
  fill: green;
}
.active {
  fill: steelblue;
}
.maintenance {
  fill: grey;
}
.unstable {
  fill: gold;
}
.label {
  fill: #fff;
  font: 20px sans-serif;
  font-weight: 100;
  text-anchor: middle;
  dominant-baseline: middle;
  text-transform: uppercase;
}`;


function parseInput (data, queryStart, queryEnd) {
  const output = [];

  Object.keys(data).forEach((v) => {
    const version = data[v];
    const name = `Node.js ${v.replace('v', '')}`;
    const current = version.start ? new Date(version.start) : null;
    const active = version.lts ? new Date(version.lts) : null;
    const maint = version.maintenance ? new Date(version.maintenance) : null;
    let end = version.end ? new Date(version.end) : null;

    if (current === null) {
      throw new Error(`missing start in ${version}`);
    }

    if (end === null) {
      throw new Error(`missing end in ${version}`);
    }

    if (maint !== null) {
      if (maint < queryEnd && end > queryStart) {
        output.push({ name, type: 'maintenance', start: maint, end });
      }

      end = maint;
    }

    if (active !== null) {
      if (active < queryEnd && end > queryStart) {
        output.push({ name, type: 'active', start: active, end });
      }

      end = active;
    }

    if (current < queryEnd && end > queryStart) {
      output.push({ name, type: 'current', start: current, end });
    }
  });

  output.unshift({
    name: 'Master',
    type: 'unstable',
    start: queryStart,
    end: queryEnd
  });

  return output;
}


function create (options) {
  const { queryStart, queryEnd, html, svg: svgFile, png } = options;
  const data = parseInput(options.data, queryStart, queryEnd);
  const d3n = new D3Node({ svgStyles: styles, d3Module: D3 });
  const margin = { top: 20, right: 30, bottom: 30, left: 70 };
  const width = 960 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;
  const xScale = D3.scaleTime()
                   .domain([queryStart, queryEnd])
                   .range([0, width])
                   .clamp(true);
  const yScale = D3.scaleBand()
                   .domain(data.map((data) => { return data.name; }))
                   .range([0, height]);
  const xAxis = D3.axisTop(xScale).tickFormat(D3.timeFormat('%b %Y'));
  const yAxis = D3.axisLeft(yScale);
  const svg = d3n.createSVG()
                 .attr('width', width + margin.left + margin.right)
                 .attr('height', height + margin.top + margin.bottom)
                 .append('g')
                 .attr('transform', `translate(${margin.left}, ${margin.top})`);
  const bar = svg.selectAll('g').data(data).enter().append('g');

  function calculateWidth (data) {
    return xScale(data.end) - xScale(data.start);
  }

  function calculateHeight (data) {
    return yScale.bandwidth();
  }

  svg.append('g')
     .attr('class', 'axis axis--x')
     .call(xAxis);

  svg.append('g')
     .attr('class', 'axis axis--y')
     .call(yAxis);

  bar.append('rect')
     .attr('class', (data) => { return `bar ${data.type}`; })
     .attr('rx', 5)
     .attr('ry', 5)
     .attr('x', (data) => { return xScale(data.start); })
     .attr('y', (data) => { return yScale(data.name); })
     .attr('width', calculateWidth)
     .attr('height', calculateHeight);

  bar.append('text')
     .attr('class', 'label')
     .attr('x', (data) => {
       return xScale(data.start) + (calculateWidth(data) / 2);
     })
     .attr('y', (data) => {
       return yScale(data.name) + (calculateHeight(data) / 2);
     })
     .text((data) => { return data.type; })
     .style('opacity', (data) => {
       // Hack to deal with overflow text.
       const min = data.type.length * 14;
       return +(calculateWidth(data) >= min);
     });

  if (typeof html === 'string') {
    Fs.writeFileSync(html, d3n.html());
  }

  if (typeof svgFile === 'string') {
    Fs.writeFileSync(svgFile, d3n.svgString());
  }

  if (typeof png === 'string') {
    const Svg2png = require('svg2png'); // Load this lazily.

    Fs.writeFileSync(png, Svg2png.sync(Buffer.from(d3n.svgString())));
  }
}

module.exports.create = create;
