import io from "./io.js";

// Generalized button handler
export function setupTouchHold(buttonId, eventNames) {
  const button = document.getElementById(buttonId);
  let isLocked = false;
  let timer;
  const touchDuration = 500;

  button.onclick = function () {
    if (isLocked) {
      console.log(`${eventNames.button} unlock`);
      isLocked = false;
      button.children[0].style.setProperty("filter", "invert()");
      io.emit(eventNames.release, JSON.stringify({}));
    } else {
      io.emit(eventNames.click, JSON.stringify({}));
    }
  };

  button.ontouchstart = function () {
    timer = setTimeout(() => {
      console.log(`${eventNames.button} lock`);
      isLocked = true;
      io.emit(eventNames.hold, JSON.stringify({}));
      button.children[0].style.setProperty("filter", "contrast(0.5)");
    }, touchDuration);
  };

  button.ontouchend = function () {
    if (timer) clearTimeout(timer);
  };
}
