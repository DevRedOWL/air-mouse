import { World, Shape, id, Text, image } from "./life.js";
import io from "./io.js";

window["Shape"] = Shape;

const world = new World({
  pattern: "color",
  G: {
    x: 0,
    y: 0,
  },
  border: {
    color: "white",
    width: 1,
  },
  hasLimits: false,
  background: "transparent",
});

window["world"] = world;

var Width = 1;

const y = new Shape({
  type: "rectangle",
  pattern: "color",
  x: 0,
  y: 0,
  width: world.canvas.width,
  height: Width,
  background: "#242424",
});

const x = new Shape({
  type: "rectangle",
  pattern: "color",
  x: 0,
  y: 0,
  width: Width,
  height: world.height,
  background: "#242424",
});

var lastTouch = {};
var dx = 0;
var dy = 0;

// Movement threshold: ignore tiny jitter to prevent drift when finger is held still
const DRIFT_THRESHOLD_PX = 2;

// Double-tap detection (canvas)
var lastTapTime = 0;
var lastTapX = 0;
var lastTapY = 0;
var tapStartX = 0;
var tapStartY = 0;
var tapStartTime = 0;
var tapMaxMovement = 0;
const DOUBLE_TAP_MS = 380;
const DOUBLE_TAP_MAX_DIST_PX = 35;
const TAP_MAX_MOVEMENT_PX = 18;

io.on("native-click", (e) => {
  Text({
    text: `Native Click`,
    x: 10,
    y: 90,
    background: "black",
  });
});

// Main loop
function main() {
  world.update();

  // Button positions
  Text({
    text: "x: " + world.mouse.x.toString(),
    x: 10,
    y: 10,
    background: "#242424",
  });
  Text({
    text: "y: " + world.mouse.y.toString(),
    x: 10,
    y: 30,
    background: "#242424",
  });
  Text({
    text: `dx: ${dx} dy: ${dy}`,
    x: 10,
    y: 50,
    background: "#242424",
  });

  // Helper texts
  Text({
    text: "Зажмите кнопку переключения окон для перемещения",
    x: 10,
    y: world.height - 65,
    size: "14px",
    background: "#242424",
  });
  Text({
    text: "между экранами при помощи стрелок перемотки",
    x: 10,
    y: world.height - 50,
    size: "14px",
    background: "#242424",
  });
  Text({
    text: "Потяните пробел вверх для ввода текста",
    x: 10,
    y: world.height - 30,
    size: "14px",
    background: "#242424",
  });
}

// Touch move (lastTouch must have .x/.y — Touch has .clientX/.clientY, so we init an object)
world.canvas.ontouchstart = function (e) {
  var t = e.touches[0];
  lastTouch = { x: t.clientX, y: t.clientY };
  tapStartX = t.clientX;
  tapStartY = t.clientY;
  tapStartTime = Date.now();
  tapMaxMovement = 0;
};

world.canvas.ontouchend = (e) => {
  world.Objects = world.Objects.filter((obj) => obj.tag !== "drawing");

  // Double-tap: short tap with little movement, and previous tap was recent and close
  if (e.changedTouches && e.changedTouches[0]) {
    var t = e.changedTouches[0];
    var releaseX = t.clientX;
    var releaseY = t.clientY;
    var duration = Date.now() - tapStartTime;
    var isTap = duration < 450 && tapMaxMovement < TAP_MAX_MOVEMENT_PX;
    if (isTap) {
      var distFromLast = Math.hypot(releaseX - lastTapX, releaseY - lastTapY);
      if (lastTapTime && Date.now() - lastTapTime < DOUBLE_TAP_MS && distFromLast < DOUBLE_TAP_MAX_DIST_PX) {
        if (navigator.vibrate) navigator.vibrate(15);
        io.emit("doubleClick", JSON.stringify({}));
        lastTapTime = 0;
      } else {
        lastTapTime = Date.now();
        lastTapX = releaseX;
        lastTapY = releaseY;
      }
    }
  }
};

world.canvas.ontouchmove = () => {
  if (lastTouch.x !== undefined) {
    dx = world.mouse.x - lastTouch.x;
    dy = world.mouse.y - lastTouch.y;
    tapMaxMovement = Math.max(tapMaxMovement, Math.hypot(world.mouse.x - tapStartX, world.mouse.y - tapStartY));

    // Only send deltas above noise threshold to avoid drift when finger is still
    if (Math.abs(dx) > DRIFT_THRESHOLD_PX || Math.abs(dy) > DRIFT_THRESHOLD_PX) {
      io.emit(
        "message",
        JSON.stringify({
          deltaX: dx,
          deltaY: dy,
        })
      );
      lastTouch.x = world.mouse.x;
      lastTouch.y = world.mouse.y;
    }
    x.x = world.mouse.x;
    y.y = world.mouse.y;
  }
  new Shape({
    type: "line",
    pattern: "color",
    VEC2: {
      x1: world.mouse.x,
      y1: world.mouse.y,
      x2: world.mouse.x + dx,
      y2: world.mouse.y + dy,
    },
    background: "#242424",
    width: 15,
    physics: false,
    tag: "drawing",
  });
};

window.addEventListener("mousemove", () => {
  x.x = world.mouse.x - x.width / 2;
  y.y = world.mouse.y - y.height / 2;
  lastTouch = world.mouse;
});

// Scroll strip: swipe up/down to scroll (throttled by distance for smooth UX)
(function () {
  var strip = document.getElementById("scroll_strip");
  if (!strip) return;
  var lastY = 0;
  var accumulated = 0;
  strip.addEventListener("touchstart", function (e) {
    e.preventDefault();
    lastY = e.touches[0].clientY;
    accumulated = 0;
  }, { passive: false });
  strip.addEventListener("touchmove", function (e) {
    e.preventDefault();
    var y = e.touches[0].clientY;
    var dy = y - lastY;
    lastY = y;
    accumulated += dy;
    if (Math.abs(accumulated) < 10) return;
    var direction = accumulated < 0 ? 1 : -1;
    var amount = Math.min(50, Math.max(2, Math.round(Math.abs(accumulated) / 5)));
    io.emit("scroll", JSON.stringify({ direction, amount }));
    accumulated = 0;
    if (navigator.vibrate) navigator.vibrate(5);
  }, { passive: false });
  strip.addEventListener("touchend", function () {
    lastY = 0;
    accumulated = 0;
  });
})();

const FPS = 360;

setInterval(main, 1000 / FPS);