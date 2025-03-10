import io from "./io.js";
import { setupTouchHold } from "./touchHold.js";

// Handle click and press
document.getElementById("rmb_click").onclick = function (e) {
  io.emit("rClick", JSON.stringify({}));
};
document.addEventListener(
  "DOMContentLoaded",
  () => {
    const buttonActions = [
      { id: "vol_up", event: "AudioVolUp" },
      { id: "vol_down", event: "AudioVolDown" },
      { id: "rev_bck", event: "Left" },
      { id: "rev_fwd", event: "Right" },
      { id: "play_pause", event: "AudioPause" },
      { id: "space", event: "Space" },
    ];

    buttonActions.forEach(({ id, event }) => {
      const button = document.getElementById(id);
      if (button) {
        button.onclick = () => io.emit("keyPress", event);
      }
    });

    // Hide media buttons initially
    if (mediaButtons) {
      mediaButtons.style.display = "none";
    }
  },
  false
);

// Handle switch of bottom pad layers
var classicButtons = document.getElementById("classic_buttons");
var mediaButtons = document.getElementById("media_buttons");
document.getElementById("media_switch").onclick = function (e) {
  const svgIcon = document.getElementById("media_switch_icon");

  // Toggle visibility
  if (classicButtons.style.display === "none") {
    classicButtons.style.display = "flex";
    mediaButtons.style.display = "none";
    svgIcon.setAttribute("data", "icons/video.svg");
  } else {
    classicButtons.style.display = "none";
    mediaButtons.style.display = "flex";
    svgIcon.setAttribute("data", "icons/mouse.svg");
  }
};

// Handle touch-hold events
setupTouchHold("lmb_click", {
  button: "LMB",
  click: "lClick",
  hold: "lHold",
  release: "lRelease",
});
setupTouchHold("alt_tab", {
  button: "Win",
  click: "altTab",
  hold: "winHold",
  release: "winRelease",
});

// Handle swipe-up space button event
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
      navigator.vibrate(20); // Vibrate for 100ms
    }
    console.log("Swipe up action triggered!");
    setTimeout(() => {
      const text = prompt("Введите текст на клавиатуре");
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
