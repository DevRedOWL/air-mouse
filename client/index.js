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

// Touch move
world.canvas.ontouchstart = function (e) {
  lastTouch = e.touches[0];
};

world.canvas.ontouchend = () => {
  world.Objects = world.Objects.filter((obj) => obj.tag !== "drawing");
};

world.canvas.ontouchmove = () => {
  if (lastTouch.x !== undefined) {
    dx = world.mouse.x - lastTouch.x;
    dy = world.mouse.y - lastTouch.y;
    io.emit(
      "message",
      JSON.stringify({
        deltaX: dx + 1,
        deltaY: dy + 1,
      })
    );
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
  lastTouch.x = world.mouse.x;
  lastTouch.y = world.mouse.y;
};

window.addEventListener("mousemove", () => {
  x.x = world.mouse.x - x.width / 2;
  y.y = world.mouse.y - y.height / 2;
  lastTouch = world.mouse;
});

const FPS = 360;

setInterval(main, 1000 / FPS);