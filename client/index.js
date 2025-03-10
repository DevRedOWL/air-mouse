import { World, Shape, id, Text, image } from "./life.js";
import socketIO from "./socketio.js";

window["Shape"] = Shape;

const io = socketIO(`http://${location.hostname}:2499`);

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
var lButton = document.getElementById("lmb_click");
var mediaSwitchButton = document.getElementById("media_switch");
var winButton = document.getElementById("alt_tab");
var mediaSwitchButtonSvg = document.getElementById("media_switch_icon");

var classicButtons = document.getElementById("classic_buttons");
var mediaButtons = document.getElementById("media_buttons");

io.on("native-click", (e) => {
  Text({
    text: `Native Click`,
    x: 10,
    y: 90,
    background: "black",
  });
});

// Handle clicks

const buttonActions = [
  { id: "rmb_click", event: "rClick" },
  { id: "vol_up", event: "volUp" },
  { id: "vol_down", event: "volDown" },
  { id: "rev_bck", event: "revBck" },
  { id: "rev_fwd", event: "revFwd" },
  { id: "play_pause", event: "playPause" },
  { id: "space", event: "space" },
];

document.addEventListener(
  "DOMContentLoaded",
  () => {
    buttonActions.forEach(({ id, event }) => {
      const button = document.getElementById(id);
      if (button) {
        button.onclick = () => io.emit(event, JSON.stringify({}));
      }
    });
    mediaButtons.style.display = "none";
  },
  false
);

mediaSwitchButton.onclick = function (e) {
  // Toggle visibility
  if (classicButtons.style.display === "none") {
    classicButtons.style.display = "flex";
    mediaButtons.style.display = "none";
    mediaSwitchButtonSvg.setAttribute("data", "icons/video.svg");
  } else {
    classicButtons.style.display = "none";
    mediaButtons.style.display = "flex";
    mediaSwitchButtonSvg.setAttribute("data", "icons/mouse.svg");
  }
};

// Handle LMB
lButton.onclick = function (e) {
  if (isLockedLMB) {
    console.log("LMB unlock");
    isLockedLMB = false;
    lButton.children[0].style.setProperty("filter", "invert()");
    io.emit("lRelease", JSON.stringify({}));
  } else {
    io.emit("lClick", JSON.stringify({}));
  }
};

var lmbTimer;
var touchduration = 500; //length of time we want the user to touch before we do something
let isLockedLMB = false;
lButton.ontouchstart = function touchstart() {
  lmbTimer = setTimeout((onlongtouch) => {
    console.log("LMB lock");
    isLockedLMB = true;
    io.emit("lHold", JSON.stringify({}));
    lButton.children[0].style.setProperty("filter", "contrast(0.5)");
  }, touchduration);
};
lButton.ontouchend = function touchend() {
  if (lmbTimer) clearTimeout(lmbTimer); //stops short touches from firing the event
};

// Handle window hold
winButton.onclick = function (e) {
  if (isLockedWin) {
    console.log("Win unlock");
    isLockedWin = false;
    winButton.children[0].style.setProperty("filter", "invert()");
    io.emit("winRelease", JSON.stringify({}));
  } else {
    io.emit("altTab", JSON.stringify({}));
  }
};
var winTimer;
var touchduration = 500;
let isLockedWin = false;
winButton.ontouchstart = function touchstart() {
  winTimer = setTimeout((onlongtouch) => {
    console.log("Win lock");
    isLockedWin = true;
    io.emit("winHold", JSON.stringify({}));
    winButton.children[0].style.setProperty("filter", "contrast(0.5)");
  }, touchduration);
};
winButton.ontouchend = function touchend() {
  if (winTimer) clearTimeout(winTimer);
};

// Main loop
function main() {
  world.update();

  world.canvas.ontouchstart = function (e) {
    lastTouch = e.touches[0];
  };

  // world.canvas.ondblclick = function (e) {
  //     io.emit('dblclick', JSON.stringify({}));
  //     console.log('DBC')
  //     world.Objects = world.Objects.filter(obj => obj.tag !== 'drawing');
  // }

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

  Text({
    text: "Зажмите кнопку переключения окон для перемещения",
    x: 10,
    y: world.height - 80,
    size: "14px",
    background: "#242424",
  });
  Text({
    text: "между экранами при помощи стрелок перемотки",
    x: 10,
    y: world.height - 60,
    size: "14px",
    background: "#242424",
  });
  Text({
    text: "Потяните пробел для ввода текста",
    x: 10,
    y: world.height - 30,
    size: "14px",
    background: "#242424",
  });
}

window.addEventListener("mousemove", () => {
  x.x = world.mouse.x - x.width / 2;
  y.y = world.mouse.y - y.height / 2;
  lastTouch = world.mouse;
});

const FPS = 360;

setInterval(main, 1000 / FPS);

// Dragger space
const swipeButton = document.getElementById("space");

let startY = 0;
let movedY = 0;
const triggerDistance = 50; // Distance to trigger action and max swipe distance

swipeButton.addEventListener("touchstart", (e) => {
  startY = e.touches[0].clientY;
});

swipeButton.addEventListener("touchmove", (e) => {
  movedY = e.touches[0].clientY - startY;

  // Restrict movement to a max of -50px (upward only)
  if (movedY < 0 && Math.abs(movedY) <= triggerDistance) {
    swipeButton.style.transform = `translateY(${movedY}px)`;
  }
});

swipeButton.addEventListener("touchend", () => {
  // Trigger action if swiped exactly 50px up
  if (Math.abs(movedY) >= triggerDistance - 10) {
    // Vibration feedback
    if (navigator.vibrate) {
      navigator.vibrate(100); // Vibrate for 100ms
    }
    console.log("Swipe up action triggered!");
    setTimeout(() => {
      const text = prompt('Введите текст на клавиатуре');
      io.emit("swipeUpAction", JSON.stringify({ text }));
    }, 300);
  }

  // Reset button position
  swipeButton.style.transition = "transform 0.3s ease";
  swipeButton.style.transform = "translateY(0)";

  // Clear transition
  swipeButton.style.transition = "";

  // Reset values
  startY = 0;
  movedY = 0;
});
