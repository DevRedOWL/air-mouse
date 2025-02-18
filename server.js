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
      socket.on("lclick", async (message) => {
        console.log(`(i) Received Mouse LeftClick`.yellow);
        control.mouse.leftClick();
      });

      // RMB
      socket.on("rclick", async (message) => {
        console.log(`(i) Received Mouse RightClick`.yellow);
        control.mouse.rightClick();
      });

      // SB
      socket.on("space", async (message) => {
        console.log(`(i) Received Mouse Space`.yellow);
        control.keyboard.pressKey(control.Key.Space);
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

    app.get("/lmb.svg", (req, res) => {
      res.sendFile(__dirname + "/client/lmb.svg");
    });
    app.get("/rmb.svg", (req, res) => {
      res.sendFile(__dirname + "/client/rmb.svg");
    });
    app.get("/sb.svg", (req, res) => {
      res.sendFile(__dirname + "/client/sb.svg");
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
