const d3 = Object.assign(
  {},
  require('d3-selection'),
  require('d3-force'),
  require('d3-zoom'),
  require('d3-drag')
);
import { event as currentEvent } from 'd3-selection';
import data from './data.json';
import imgs from '../../img/*.jpg';

class Viz {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }
  renderGraphic() {
    const links = data.links.map(d => Object.create(d));
    const nodes = data.nodes.map(d => Object.create(d));

    let nodeRadius = 20;
    let linkDistance = 70;
    let chargeStr = -550;
    let xDenom = 2.2;
    let xStr = 0.02;
    let yDenom = .9;
    let yStr = 0.25;

    let hlColor = '#18aef9';

    if (window.innerWidth < 600) {
      nodeRadius = 15;
      linkDistance = 55;
      chargeStr = -470;
      xDenom = 2.2;
      xStr = 0.1;
      yDenom = .8;
      yStr = 0.2;
    }

    const groupData = [
      { name: 'guest', mx: 1 },
      { name: 'event', mx: 1.5 },
      { name: 'organization', mx: 1.75 },
      { name: 'president', mx: 2 }
    ];

    const width = this.width;
    const height = this.height;

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3
          .forceLink(links)
          .distance(linkDistance)
          .id(d => d.id)
      )
      .force('charge', d3.forceManyBody().strength(chargeStr))
      .force('collide', d3.forceCollide().radius(d => getRadius(d.group)))
      .force('x', d3.forceX(width / xDenom).strength(xStr))
      .force('y', d3.forceY(height * yDenom).strength(yStr));

    if (window.innerWidth >= 600) {
      simulation.force('center', d3.forceCenter(width / 2, height / 2));
    }

    const svg = d3
      .select('.svg')
      .attr('width', width)
      .attr('height', height);

    const defs = svg.append('defs');

    defs
      .selectAll('clipPath')
      .data(groupData)
      .join('clipPath')
      .attr('id', d => d.name + '-clip')
      .append('circle')
      .attr('r', d => nodeRadius * d.mx);

    const g = svg.append('g');

    let extent = [1, 8];

    if (window.innerWidth < 767) extent = [.7, 8];

    const handleZoom = d3
      .zoom()
      .scaleExtent(extent)
      .on('zoom', () => g.attr('transform', currentEvent.transform));

    svg.call(handleZoom);

    const linkG = g
      .append('g')
      .selectAll('g')
      .data(links)
      .join('g');

    const line = linkG
      .append('path')
      .attr('id', d => d.index)
      .attr('stroke-opacity', 0.6)
      .attr('stroke', '#333')
      .attr('stroke-width', '1.5');

    const lineText = linkG
      .append('text')
      .append('textPath')
      .attr('href', d => `#${d.index}`)
      .attr('startOffset', '50%')
      .append('tspan')
      .attr('class', 'link-arrow')
      .attr('fill', '#333')
      .text(d => d.source.id == "Yujing Zhang" | d.source.id == "Safari Night 2019" ? '' : '→')
      .attr('dy', 8.75);

    const node = g
      .append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('data-name', d => d.id)
      .attr('class', d => `img-group ${d.group}`)
      .attr('fill', 'none')
    .call(drag(simulation));

    const cir = node
      .append('circle')
      .attr('r', d => getRadius(d.group))
      .attr('stroke', '#333')
      .attr('stroke-width', 2);
      
    const img = node
      .append('image')
      .attr('xlink:href', d =>
        imgs[d.photo] !== undefined ? imgs[d.photo] : imgs['Unknown']
      )
      .attr('clip-path', d => `url(#${d.group}-clip)`)
      .attr('width', d => getRadius(d.group) * 2)
      .attr('height', d => getRadius(d.group) * 2)
      .attr('x', d => getRadius(d.group) * -1)
      .attr('y', d => getRadius(d.group) * -1);

    const tooltip = d3.select('.tooltip');

    tooltip.select('.tooltip__close').on('click',function () {
      tooltip.style('visibility', 'hidden')
    })

    node.on('touchmove mousemove', function(d) {
      tooltip.style('visibility', 'visible');
      tooltip.select('.tooltip__about').text(d.tooltip);
      tooltip.select('.tooltip__name').html(d.id);

      tooltip
        .style('top', `${currentEvent.pageY - 10}px`)
        .style('left', `${currentEvent.pageX + 10}px`);
    });

    linkG.on('touchmove mousemove', function(d) {
      tooltip.style('visibility', 'visible');
      tooltip.select('.tooltip__name').text('');
      tooltip
        .select('.tooltip__about')
        .html(`${d.source.id} ${d.relationship} ${d.target.id}`);
      tooltip
        .style('top', `${currentEvent.pageY - 10}px`)
        .style('left', `${currentEvent.pageX + 10}px`);

      d3.select(this)
        .select('path')
        .style('stroke', hlColor)
        .style('stroke-opacity', 1)
        .style('stroke-width', '3');

      d3.selectAll(
        `g[data-name="${d.source.id}"] > circle, g[data-name="${
          d.target.id
        }"] > circle`
      )
        .style('stroke', hlColor)
        .style('stroke-width', '6');
    });

    node.on('touchend mouseleave', () => tooltip.style('visibility', 'hidden'));

    linkG.on('touchend mouseleave', function(d) {
      tooltip.style('visibility', 'hidden');

      d3
        .select(this)
        .select('path')
        .node().style = '';

      d3.selectAll(
        `g[data-name="${d.source.id}"] > circle, g[data-name="${
          d.target.id
        }"] > circle`
      )
        .style('stroke', '#333')
        .style('stroke-width', '2');
    });

    let pres = node.filter(d => d.group == 'president').datum();
    let tVict = node.filter(d => d.id == 'Trump Victory').datum();
    let tOrg = node.filter(d => d.id == 'The Trump Organization').datum();

    simulation.on('tick', () => {
      pres.fy = height / 12;
      pres.fx = width / 2;

      tVict.fy = height / 6;
      tVict.fx = width / 2 + nodeRadius * 6;

      tOrg.fy = height / 6;
      tOrg.fx = width / 2 - nodeRadius * 6;

      line.attr(
        'd',
        d => `M ${d.source.x} ${d.source.y} L ${d.target.x} ${d.target.y}`
      );
      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    function getRadius(group) {
      let res;
      switch (group) {
        case 'guest':
          res = groupData[0].mx;
          break;
        case 'event':
          res = groupData[1].mx;
          break;
        case 'organization':
          res = groupData[2].mx;
          break;
        case 'president':
          res = groupData[3].mx;
          break;
      }
      return res * nodeRadius;
    }
    function drag(simulation) {
      function dragstarted(d) {
        if (!currentEvent.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(d) {
        d.fx = currentEvent.x;
        d.fy = currentEvent.y;
      }

      function dragended(d) {
        if (!currentEvent.active) simulation.alphaTarget(0);
        d.fx = currentEvent.x;
        d.fy = currentEvent.y;
      }

      return d3
        .drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
    }
  }
  destroyGraphic() {
    d3.selectAll('.svg g').remove();
    d3.selectAll('svg defs').remove();
  }
}

export { Viz };
