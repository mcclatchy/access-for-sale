import * as d3 from 'd3-selection';
import { Viz } from './modules/graphic';

function graphicResize() {
    let graphicWidth = graphic.node().offsetWidth;

    let vizWidth = window.innerHeight > graphicWidth ? graphicWidth : window.innerHeight;

    let vizMargin = innerWidth < 600 ? 0 : graphicWidth / 7;

    viz = new Viz(graphicWidth, graphicWidth, vizMargin);
    // Empties graphic before creating new one
    viz.clearGraphic();
    // Render new graphic
    nodes = viz.renderGraphic();
}

function init() {
    let container = d3.select('.interactive');
    let graphic = container.select('.interactive__graphic');
    let viz = new Viz(graphic.node().offsetWidth, 600);
    viz.renderGraphic();
}

function heightResize() {
    graphic.style('height', `${graphic.node().offsetWidth}px`);
}

function sendHeight() {
    window.parent.postMessage({
        sentinel: 'amp',
        type: 'embed-size',
        height: document.body.scrollHeight
    }, '*');
}

document.addEventListener('DOMContentLoaded', function () {
    init();
    sendHeight();
});

