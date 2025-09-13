'use strict';
const Fs = require('fs');
const D3 = require('d3');
const D3Node = require('d3-node');
const { Temporal } = require("@js-temporal/polyfill");

const styles = `
.beta {
  fill:rgb(240, 240, 75);
}
.current {
  fill: #5fa04e;
}
.active {
  fill: #229ad6;
}
.maintenance {
  fill: #b1bcc2;
}
.unstable,.alpha {
  fill: #e99c40;
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
.label,.label-beta {
  fill: #fff;
  font: 20px sans-serif;
  font-weight: 100;
  text-anchor: start;
  dominant-baseline: middle;
  text-transform: uppercase;
}
.label-beta{
  fill: #000;
}`;

const schedule = {
  title: 'Less frequent LTS',
  currentDuration: { months: 6 },
  activeDuration: [{ months: 24 }, false, false, false],
};
schedule.maintenanceDuration = [
  { months: schedule.currentDuration.months * 3 },
  { months: 2 }, { months: 2 }, { months: 2 },
]

console.log(`\n## ${schedule.title}`);
{
  const ___ = duration_s => Array.isArray(duration_s) ?
    `\n     - for even-numbered releases:${___(duration_s[0])}\n     - for odd-numbered releases:${___(duration_s[1])}` :
    ` ${duration_s ? Temporal.Duration.from(duration_s).months : 0} months`;
  console.log(Object.entries(schedule).map(([key, duration], i) => key === 'title' ? '' :
    `  ${i}. ${key.replace('D', ' d')}:${___(duration)}`
  ).join('\n'));
}
{
  const durations = Object.entries(schedule).filter(c => c[0] !== 'title' && c[0] !== 'alphaDuration' && c[1]).map(c => c[1]);
  const hasArray = durations.some(Array.isArray);
  const __ = arr => arr.reduce((acc, dur) => acc+Temporal.Duration.from(dur).months, 0)
  const ___ = () => hasArray ?
    `\n  - for even-numbered releases: ${__(durations.map(c => (Array.isArray(c) ? c[0] : c) || 'P0M'))} months\n  - for odd-numbered releases: ${__(durations.map(c => (Array.isArray(c) ? c[1] : c) || 'P0M'))} months` :
    ` ${__(durations)} months`;
  console.log(`\n  Total life span (from start of beta until end of maintenance):${___(schedule)}`)
}

const __ = (duration_s, i) => Array.isArray(duration_s) ? duration_s[i % duration_s.length] : duration_s;

function createDataEntry(start, i) {
  const ret = {};

  const alphaDuration = __(schedule.alphaDuration, i);
  const betaDuration = __(schedule.betaDuration, i);
  const currentDuration = __(schedule.currentDuration, i);
  const activeDuration = __(schedule.activeDuration, i);
  const maintenanceDuration = __(schedule.maintenanceDuration, i);

  if (alphaDuration) {
    ret.alpha = start.toString();
    start = start.add(alphaDuration);
  }
  if (betaDuration) {
    ret.beta = start.toString();
    start = start.add(betaDuration);
  }
  ret.start = start.toString();
  start = start.add(currentDuration);
  if (activeDuration) {
    ret.lts = start.toString();
    start = start.add(activeDuration);
  }
  ret.maintenance = start.toString();
  ret.end = start.add(maintenanceDuration).toString();
  return ret;
}

function parseInput (data, queryStart, queryEnd, excludeMain, projectName) {
  const output = [];

  const addData = (v, version) => {
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
    if (version.beta) {
      const start = new Date(version.beta);
      output.push(({ name, type: 'beta', start, end: current }));
      output.push(({ name, type: 'alpha', start: new Date(version.alpha), end: start }));
    }
  }
  Object.entries(data).forEach(v => addData(...v, false));
  const queryEndPlainDate = Temporal.PlainDate.from(queryEnd.toISOString().slice(0, 10));
  for (let start = Temporal.PlainDate.from(data.v26.lts), i = 27; Temporal.PlainDate.compare(queryEndPlainDate, start) === 1; i++) {
    const dataEntry = createDataEntry(start, i);
    addData(`v${i}`, dataEntry);
    const nextStart = Temporal.PlainDate.from(dataEntry.lts || dataEntry.maintenance);
    start = nextStart;
  }

  if (!excludeMain) {
    output.unshift({
      name: 'Main',
      type: 'unstable',
      start: queryStart,
      end: queryEnd
    });
  }

  return output;
}


function create (options) {
  const { queryStart, queryEnd, html, svg: svgFile, png, animate, excludeMain, projectName, margin: marginInput } = options;
  const data = parseInput(options.data, queryStart, queryEnd, excludeMain, projectName);
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
                  .tickFormat(D3.timeFormat('%b%y'));
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
       if ((data.type === 'unstable' || data.type === 'current' || data.type === 'alpha') ||
           xScale(data.start) <= 0) {
         return 0;
       }

       return 1;
     });

  bar.append('text')
     .attr('class', data => data.type=== 'beta' ? 'label-beta' : 'label')
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

    console.log(`\n  ![Release schedule proposal preview](.${svgFile.slice(svgFile.lastIndexOf('/'))})`)
  }

  if (typeof png === 'string') {
    const Svg2png = require('svg2png'); // Load this lazily.

    Fs.writeFileSync(png, Svg2png.sync(Buffer.from(d3n.svgString())));
  }
}

module.exports.create = create;
