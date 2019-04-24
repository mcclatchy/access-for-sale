import { Viz } from './modules/graphic';

const container = document.querySelector('.interactive');

// const mq = window.matchMedia('(orientation: portrait)');
// mq.addListener(handleOrientationChange);

let viz;
let height;

function init() {
  let width = container.clientWidth;

  window.innerWidth < 768 ? (height = 500) : (height = 700);
  viz = new Viz(width, height);
  viz.destroyGraphic();
  viz.renderGraphic();

  const resizer = () => {
    if (width !== container.clientWidth) {
      if (window.innerWidth < 768) {
        height = 500;
      } else {
        height = 700;
      }
      viz = new Viz(container.clientWidth, height);
      viz.destroyGraphic();
      viz.renderGraphic();
      width = container.clientWidth;
    }
  };

  let resizeTaskId = null;

  window.addEventListener('resize', () => {
    if (resizeTaskId !== null) {
      clearTimeout(resizeTaskId);
    }
    resizeTaskId = setTimeout(() => {
      resizeTaskId = null;
      resizer();
      sendHeight();
    }, 150);
  });
}

document.addEventListener('DOMContentLoaded', function() {
  // handleOrientationChange(mq);
  init();
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

// function handleOrientationChange(e) {
//   if (e.matches) {
//     height = 500;
//   } else {
//     height = 700;
//   }
// }
