const express = require("express");
const app = express();
const server = require("http").createServer(app);
const { Server } = require("socket.io");

const io = new Server(server, {
  cors: {
    origins: "*:*",
  },
});
const port = 2499;
const colors = require("colors");

const {
  Key,
  keyboard,
  mouse,
  Button,
  clipboard,
  Point,
} = require("@nut-tree-fork/nut-js");
let altTabTimer;

// MacOS and Windows support
var isWindows = process.platform === "win32";
const serviceButtons = {
  LeftControl: isWindows ? Key.LeftControl : Key.LeftSuper,
  LeftWindows: isWindows ? Key.LeftWin : Key.LeftSuper,
  LeftAlt: isWindows ? Key.LeftAlt : Key.LeftSuper,
};
console.log(`Running with ${isWindows ? "Windows API" : "MacOS API"}`.cyan);

app.use(express.static(__dirname + "/client"));

require("dns").lookup(
  require("os").hostname(),
  { family: 4 },
  function (err, localAddress, fam) {
    io.on("connection", (socket) => {
      console.log("[+] Client Connected".cyan);
      socket.on("message", async (message) => {
        var obj = JSON.parse(message);
        var deltaX = obj.deltaX;
        var deltaY = obj.deltaY;

        console.log(
          `(i) Received Mouse DeltaPosition: X:${deltaX}, Y:${deltaY}`.yellow
        );

        var mouseX = await mouse.getPosition().then(function (result) {
          return result.x;
        });
        var mouseY = await mouse.getPosition().then(function (result) {
          return result.y > 0 ? result.y : -result.y;
        });
        var scale = 1.1;
        mouse.setPosition(
          new Point(mouseX + deltaX * scale, mouseY + deltaY * scale)
        );
      });

      // LMB
      socket.on("lHold", async (message) => {
        console.log(`(i) Received Mouse LeftHold`.yellow);
        await mouse.pressButton(Button.LEFT);
      });
      socket.on("lRelease", async (message) => {
        console.log(`(i) Received Mouse LeftRelease`.yellow);
        await mouse.releaseButton(Button.LEFT);
      });
      socket.on("lClick", async (message) => {
        console.log(`(i) Received Mouse LeftClick`.yellow);
        await mouse.leftClick();
      });

      // RMB
      socket.on("rClick", async (message) => {
        console.log(`(i) Received Mouse RightClick`.yellow);
        await mouse.rightClick();
      });

      // SB
      socket.on("space", async (message) => {
        console.log(`(i) Received Mouse Space`.yellow);
        await keyboard.pressKey(Key.Space);
        await keyboard.releaseKey(Key.Space);
      });

      // Volume
      socket.on("volUp", async (message) => {
        console.log(`(i) Received Keyboard VolUp`.yellow);
        await keyboard.pressKey(Key.AudioVolUp);
        await keyboard.releaseKey(Key.AudioVolUp);
      });
      socket.on("volDown", async (message) => {
        console.log(`(i) Received Keyboard VolDown`.yellow);
        await keyboard.pressKey(Key.AudioVolDown);
        await keyboard.releaseKey(Key.AudioVolDown);
      });

      // Rewind
      socket.on("revBck", async (message) => {
        console.log(`(i) Received Keyboard RevBck`.yellow);
        await keyboard.pressKey(Key.Left);
        await keyboard.releaseKey(Key.Left);
      });
      socket.on("revFwd", async (message) => {
        console.log(`(i) Received Keyboard RevFwd`.yellow);
        await keyboard.pressKey(Key.Right);
        await keyboard.releaseKey(Key.Right);
      });
      socket.on("playPause", async (message) => {
        console.log(`(i) Received Keyboard PlayPause`.yellow);
        await keyboard.pressKey(Key.AudioPause);
        await keyboard.releaseKey(Key.AudioPause);
      });

      // AltTab
      socket.on("altTab", async (message) => {
        console.log(`(i) Received Keyboard AltTab`.yellow);
        if (altTabTimer) clearTimeout(altTabTimer);
        await keyboard.pressKey(serviceButtons.LeftAlt, Key.Tab);
        await keyboard.releaseKey(Key.Tab);

        altTabTimer = setTimeout(async () => {
          try {
            await keyboard.releaseKey(serviceButtons.LeftAlt, Key.Tab);
          } catch (ex) {
            console.error(ex);
          }
        }, 1000);
      });

      // Windows button
      socket.on("winHold", async (message) => {
        console.log(`(i) Received Mouse WinHold`.yellow);
        await keyboard.pressKey(serviceButtons.LeftWindows, Key.LeftShift);
      });
      socket.on("winRelease", async (message) => {
        console.log(`(i) Received Mouse WinRelease`.yellow);
        await keyboard.releaseKey(serviceButtons.LeftWindows, Key.LeftShift);
      });

      // Text input
      socket.on("swipeUpAction", async (message) => {
        try {
          const { text } = JSON.parse(message);
          console.log(`(i) Received Text: ${text}`.yellow);

          // Copy text to clipboard
          await clipboard.setContent(text);

          // Paste the text using Ctrl+V (Windows/Linux) or Cmd+V (Mac)
          await keyboard.pressKey(serviceButtons.LeftControl, Key.V);

          await keyboard.releaseKey(serviceButtons.LeftControl, Key.V),
            console.log("(i) Text pasted successfully!".green);
        } catch (error) {
          console.error("(x) Error pasting text:", error);
        }
      });

      // AUX
      socket.on("getPos", async (message) => {
        await mouse.getPosition().then(function (result) {
          console.log(result.x, result.y);
        });
      });
      socket.on("disconnect", () => {
        console.log("[-] Client Disconnected".red);
        if (altTabTimer) clearTimeout(altTabTimer);
      });
    });

    io.on("listening", () => {
      console.log(
        `[+] Server Started on http://${localAddress}:${port}\n`.green,
        port
      );
    });

    app.get("/", (req, res) => {
      res.sendFile(__dirname + "/client/index.html");
    });

    io.listen(port);

    app.listen(port + 1, () => {
      console.log(
        (
          `(i) - Client: (` +
          colors.underline(`http://${localAddress}:${port + 1}`) +
          `)\n`
        ).green
      );
    });
  }
);
