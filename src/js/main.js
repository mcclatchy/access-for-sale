import * as d3 from 'd3-selection';
import { Viz } from './modules/graphic';


const container = document.querySelector('.interactive');
const graphic = container.querySelector('.interactive__graphic');

const viz = new Viz();

// function graphicResize() {
    // let graphicWidth = graphic.node().offsetWidth;

    // let vizWidth = window.innerHeight > graphicWidth ? graphicWidth : window.innerHeight;

    // let vizMargin = innerWidth < 600 ? 0 : graphicWidth / 7;

    // viz = new Viz(graphicWidth, graphicWidth, vizMargin);
    // Empties graphic before creating new one
    // viz.clearGraphic();
    // Render new graphic
    // nodes = viz.renderGraphic();
// }


window.addEventListener('resize', function () {
    viz.updateGraphic(container.clientWidth, 600);
})

document.addEventListener('DOMContentLoaded', function () {
    viz.renderGraphic();

    sendHeight();
});

function sendHeight() {
  window.parent.postMessage(
    {
      sentinel: 'amp',
      type: 'embed-size',
      height: document.body.scrollHeight
    },
    '*'
  );
}

