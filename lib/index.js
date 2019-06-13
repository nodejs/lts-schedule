'use strict';
const Fs = require('fs');
const D3 = require('d3');
const D3Node = require('d3-node');

const styles = `
.current {
  fill: #2aa748;
}
.active {
  fill: #47b4ff;
}
.maintenance {
  fill: #89a19d;
}
.unstable {
  fill: #ffb800;
}
.bar-join {
  fill: #ffffff;
}
.bar-join.unstable, .bar-join.current {
  display: none;
}
.tick text {
  font: 16px sans-serif;
  fill: #89a19d;
}
.axis--y .tick text {
  text-anchor: end;
}
.label {
  fill: #fff;
  font: 20px sans-serif;
  font-weight: 100;
  text-anchor: start;
  dominant-baseline: middle;
  text-transform: uppercase;
}`;


function parseInput (data, queryStart, queryEnd, excludeMaster, projectName) {
  const output = [];

  Object.keys(data).forEach((v) => {
    const version = data[v];
    const name = `${projectName} ${v.replace('v', '')}`;
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

  if (!excludeMaster) {
    output.unshift({
      name: 'Master',
      type: 'unstable',
      start: queryStart,
      end: queryEnd
    });
  }

  return output;
}


function create (options) {
  const { queryStart, queryEnd, html, svg: svgFile, png, animate, excludeMaster, projectName, margin: marginInput } = options;
  const data = parseInput(options.data, queryStart, queryEnd, excludeMaster, projectName);
  const d3n = new D3Node({ svgStyles: styles, d3Module: D3 });
  const margin = marginInput || { top: 30, right: 30, bottom: 30, left: 110 };
  const width = 960 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;
  const xScale = D3.scaleTime()
                   .domain([queryStart, queryEnd])
                   .range([0, width])
                   .clamp(true);
  const yScale = D3.scaleBand()
                   .domain(data.map((data) => { return data.name; }))
                   .range([0, height])
                   .padding(0.3);
  const xAxis = D3.axisBottom(xScale)
                  .tickSize(height)
                  .tickFormat(D3.timeFormat('%b %Y'));
  const yAxis = D3.axisRight(yScale).tickSize(width);
  const svg = d3n.createSVG()
                 .attr('width', width + margin.left + margin.right)
                 .attr('height', height + margin.top + margin.bottom)
                 .append('g')
                 .attr('id', 'bar-container')
                 .attr('transform', `translate(${margin.left}, ${margin.top})`);


  function calculateWidth (data) {
    return xScale(data.end) - xScale(data.start);
  }

  function calculateHeight (data) {
    return yScale.bandwidth();
  }

  function customXAxis (g) {
    g.call(xAxis);
    g.select('.domain').remove();
    g.selectAll('.tick:nth-child(odd) line').attr('stroke', '#89a19d');
    g.selectAll('.tick:nth-child(even) line')
     .attr('stroke', '#89a19d')
     .attr('stroke-dasharray', '2,2');
    g.selectAll('.tick text').attr('y', 0).attr('dy', -10);
  }

  function customYAxis (g) {
    g.call(yAxis);
    g.select('.domain').remove();
    g.selectAll('.tick line').attr('stroke', '#e1e7e7');
    g.selectAll('.tick text').attr('x', 0).attr('dx', -10);
    g.append('line')
     .attr('y1', height)
     .attr('y2', height)
     .attr('x2', width)
     .attr('stroke', '#89a19d');
  }

  svg.append('g')
     .attr('class', 'axis axis--x')
     .call(customXAxis);

  svg.append('g')
     .attr('class', 'axis axis--y')
     .call(customYAxis);

  const bar = svg.selectAll('#bar-container').data(data).enter().append('g');

  const rect = bar.append('rect')
                  .attr('class', (data) => { return `bar ${data.type}`; })
                  .attr('x', (data) => { return xScale(data.start); })
                  .attr('y', (data) => { return yScale(data.name); })
                  .attr('width', calculateWidth)
                  .attr('height', calculateHeight);

  if (animate === true) {
    rect.append('animate')
        .attr('attributeName', 'width')
        .attr('from', 0)
        .attr('to', calculateWidth)
        .attr('dur', '1s');
  }

  bar.append('rect')
     .attr('class', (data) => { return `bar-join ${data.type}`; })
     .attr('x', (data) => { return xScale(data.start) - 1; })
     .attr('y', (data) => { return yScale(data.name); })
     .attr('width', 2)
     .attr('height', calculateHeight)
     .style('opacity', (data) => {
       // Hack to hide on current and unstable
       if ((data.type === 'unstable' || data.type === 'current') ||
           xScale(data.start) <= 0) {
         return 0;
       }

       return 1;
     });

  bar.append('text')
     .attr('class', 'label')
     .attr('x', (data) => {
       return xScale(data.start) + 15;
     })
     .attr('y', (data) => {
        // + 2 is a small correction so the text fill is more centered.
       return yScale(data.name) + (calculateHeight(data) / 2) + 2;
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
