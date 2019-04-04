import * as d3 from 'd3';
import data from './data.json';
import imgs from '../../img/*.jpg';

class Viz {
  constructor(width, winHeight) {
    this.width = width;
    this.height = winHeight;
  }
  renderGraphic() {
    const links = data.links.map(d => Object.create(d));
    const nodes = data.nodes.map(d => Object.create(d));

    const nodeRadius = 12;
    const linkDistance = 35;

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
          .strength(1)
      )
      .force(
        'charge',
        d3
          .forceManyBody()
          .strength(-200)
          // .distanceMax(300)
      )
      .force('collide', d3.forceCollide(nodeRadius))
      // .force('center', d3.forceCenter(width / 2, height / 2))
      .force('x', d3.forceX(width / 2))
      .force('y', d3.forceY(height / 2));

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

    const handleZoom = d3
      .zoom()
      .scaleExtent([1, 10])
      .on('zoom', zoomed);

    svg.call(handleZoom);

    // handleZoom.scaleTo(g, 1.5);

    function zoomed() {
      g.attr('transform', d3.event.transform);
    }

    const linkG = g
      .append('g')
      .selectAll('g')
      .data(links)
      .join('g');

    const line = linkG
      .append('path')
      .attr('id', d => d.index)
      .attr('fill', '#333')
      .attr('stroke-opacity', 0.6)
      .attr('stroke', '#333')
      .attr('stroke-width', '1');

    const lineText = linkG
      .append('text')
      .append('textPath')
      .attr('href', d => `#${d.index}`)
      .attr('startOffset', '50%')
      .append('tspan')
      .attr(
        'style',
        'text-anchor: middle; font: 12px sans-serif; user-select: none'
      )
      .attr('fill', '#333')
      .text('→')
      .attr('dy', 4.35);

    const node = g
      .append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('data-name', d => d.id)
      .attr('class', d => `img-group ${d.group}`)
      .attr('fill', 'none')
      .call(drag(simulation))

    const cir = node
      .append('circle')
      .attr('r', d => groupCheck(d.group))
      .attr('stroke', '#333')
      .attr('stroke-width', 2);

    const mediaURL =
      'https://media.miamiherald.com/static/media/projects/2019/trump-access/images/';

    const img = node
      .append('image')
      .attr('xlink:href', d =>
        imgs[d.photo] !== undefined ? imgs[d.photo] : imgs['Unknown']
      )
      .attr('clip-path', d => `url(#${d.group}-clip)`)
      .attr('width', d => groupCheck(d.group) * 2)
      .attr('height', d => groupCheck(d.group) * 2)
      .attr('x', d => groupCheck(d.group) * -1)
      .attr('y', d => groupCheck(d.group) * -1);

    const tooltip = d3.select('.tooltip');

    tooltip.style('position', 'absolute').style('visibility', 'hidden');

    node.on('touchmove mousemove', d => {
      tooltip.style('visibility', 'visible');
      tooltip.select('.tooltip__about').text(d.tooltip);
      tooltip.select('.tooltip__name').text(d.id);
      tooltip
        .style('top', `${d3.event.pageY - 10}px`)
        .style('left', `${d3.event.pageX + 10}px`);
    });

    node.on('touchend mouseleave', () => tooltip.style('visibility', 'hidden'));

    let trump = node.filter(d => d.id == 'Donald J. Trump').datum();
    let tVict = node.filter(d => d.id == 'Trump Victory').datum();
    let tOrg = node.filter(d => d.id == 'The Trump Organization').datum();

    simulation.on('tick', function() {
      trump.fy = height / 8;
      trump.fx = width / 2;

      tVict.fy = height / 4;
      tVict.fx = (width / 2) + (nodeRadius * 6);

      tOrg.fy = height / 4;
      tOrg.fx = (width / 2) - (nodeRadius * 6);

      line.attr(
        'd',
        d =>
          `M ${computeMinMax(d.source.x, width)} ${computeMinMax(
            d.source.y,
            height
          )} L ${computeMinMax(d.target.x, width)} ${computeMinMax(
            d.target.y,
            height
          )}`
      );
      node.attr(
        'transform',
        d => `translate(${computeMinMax(d.x, width)},${computeMinMax(d.y, height)})`
      );
    });

    function computeMinMax(value, reference) {
      return Math.max(nodeRadius, Math.min(reference - nodeRadius, value))
    }

    function groupCheck(group) {
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
  }
}

function drag(simulation) {
  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = d.x;
    d.fy = d.y;
  }

  return d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);
}

export { Viz };
