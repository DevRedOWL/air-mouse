const app = require("express")();
const server = require("http").createServer(app);
const { Server } = require("socket.io");

const io = new Server(server, {
  cors: {
    origins: "*:*",
  },
});
const port = 2499;
const colors = require("colors");

const control = require("@nut-tree-fork/nut-js");
let altTabTimer;

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

        var mouseX = await control.mouse.getPosition().then(function (result) {
          return result.x;
        });
        var mouseY = await control.mouse.getPosition().then(function (result) {
          return result.y > 0 ? result.y : -result.y;
        });
        var scale = 1.1;
        control.mouse.setPosition(
          new control.Point(mouseX + deltaX * scale, mouseY + deltaY * scale)
        );
      });

      // LMB
      socket.on("lHold", async (message) => {
        console.log(`(i) Received Mouse LeftHold`.yellow);
        control.mouse.pressButton(control.Button.LEFT);
      });
      socket.on("lRelease", async (message) => {
        console.log(`(i) Received Mouse LeftRelease`.yellow);
        control.mouse.releaseButton(control.Button.LEFT);
      });
      socket.on("lClick", async (message) => {
        console.log(`(i) Received Mouse LeftClick`.yellow);
        control.mouse.leftClick();
      });

      // RMB
      socket.on("rClick", async (message) => {
        console.log(`(i) Received Mouse RightClick`.yellow);
        control.mouse.rightClick();
      });

      // SB
      socket.on("space", async (message) => {
        console.log(`(i) Received Mouse Space`.yellow);
        control.keyboard.pressKey(control.Key.Space);
        control.keyboard.releaseKey(control.Key.Space);
      });

      // Volume
      socket.on("volUp", async (message) => {
        console.log(`(i) Received Keyboard VolUp`.yellow);
        control.keyboard.pressKey(control.Key.AudioVolUp);
        control.keyboard.releaseKey(control.Key.AudioVolUp);
      });
      socket.on("volDown", async (message) => {
        console.log(`(i) Received Keyboard VolDown`.yellow);
        control.keyboard.pressKey(control.Key.AudioVolDown);
        control.keyboard.releaseKey(control.Key.AudioVolDown);
      });

      // Rewind
      socket.on("revBck", async (message) => {
        console.log(`(i) Received Keyboard RevBck`.yellow);
        control.keyboard.pressKey(control.Key.Left);
        control.keyboard.releaseKey(control.Key.Left);
      });
      socket.on("revFwd", async (message) => {
        console.log(`(i) Received Keyboard RevFwd`.yellow);
        control.keyboard.pressKey(control.Key.Right);
        control.keyboard.releaseKey(control.Key.Right);
      });
      socket.on("playPause", async (message) => {
        console.log(`(i) Received Keyboard PlayPause`.yellow);
        control.keyboard.pressKey(control.Key.AudioPause);
        control.keyboard.releaseKey(control.Key.AudioPause);
      });

      // AltTab
      socket.on("altTab", async (message) => {
        console.log(`(i) Received Keyboard AltTab`.yellow);
        clearTimeout(altTabTimer);
        control.keyboard.pressKey(control.Key.LeftAlt);
        control.keyboard.pressKey(control.Key.Tab);

        altTabTimer = setTimeout(() => {
          control.keyboard.releaseKey(control.Key.Tab);
          control.keyboard.releaseKey(control.Key.LeftAlt);
        }, 1000);
      });

      // Windows button
      socket.on("winHold", async (message) => {
        console.log(`(i) Received Mouse WinHold`.yellow);
        control.keyboard.pressKey(control.Key.LeftWin, control.Key.LeftShift);
      });
      socket.on("winRelease", async (message) => {
        console.log(`(i) Received Mouse WinRelease`.yellow);
        control.keyboard.releaseKey(control.Key.LeftWin, control.Key.LeftShift);
      });

      // Text input
      socket.on("swipeUpAction", async (message) => {
        try {
          const { text } = JSON.parse(message);
          console.log(`(i) Received Text: ${text}`.yellow);

          // Copy text to clipboard
          await control.clipboard.setContent(text);

          // Paste the text using Ctrl+V (Windows/Linux) or Cmd+V (Mac)
          await control.keyboard.pressKey(control.Key.LeftControl, control.Key.V);
          await control.keyboard.releaseKey(control.Key.LeftControl, control.Key.V);

          // On Mac, use LeftMeta instead of LeftControl
          // await control.keyboard.pressKey(control.Key.LeftMeta, Key.V);
          // await control.keyboard.releaseKey(control.Key.LeftMeta, Key.V);

          console.log("(i) Text pasted successfully!".green);
        } catch (error) {
          console.error("(x) Error pasting text:", error);
        }
      });

      // AUX
      socket.on("getPos", async (message) => {
        await control.mouse.getPosition().then(function (result) {
          console.log(result.x, result.y);
        });
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

    app.get("/index.js", (req, res) => {
      res.sendFile(__dirname + "/client/index.js");
    });

    app.get("/life.js", (req, res) => {
      res.sendFile(__dirname + "/client/life.js");
    });

    app.get("/events.js", (req, res) => {
      res.sendFile(__dirname + "/client/events.js");
    });

    app.get("/socketio.js", (req, res) => {
      res.sendFile(__dirname + "/client/socketio.js");
    });

    app.get("/style.css", (req, res) => {
      res.sendFile(__dirname + "/client/style.css");
    });

    app.get("/*.svg", (req, res) => {
      const filePath = __dirname + "/client" + req.path;
      res.sendFile(filePath);
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
