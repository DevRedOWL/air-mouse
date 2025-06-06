export const id = () => {
  var s = "";
  var comb = "abcdefghijklmnopqrstuvwxyz1234567890";
  for (var i = 0; i < 4; i++) {
    var t = "";
    for (var j = 0; j < 5; j++) {
      t += comb[~~(Math.random() * comb.length)];
    }
    if (i !== 3) {
      t += "-";
    }
    s += t;
  }
  return s;
};
import { eventify } from "./events.js";

let getRandomName = () => {
  const namelist =
    "James;Robert;John;Michael;David;William;Richard;Joseph;Thomas;Charles;Christopher;Daniel;Matthew;Anthony;Mark;Donald;Steven;Paul;Andrew;Joshua;Kenneth;Kevin;Brian;George;Timothy;Ronald;Edward;Jason;Jeffrey;Ryan;Jacob;Gary;Nicholas;Eric;Jonathan;Stephen;Larry;Justin;Scott;Brandon;Benjamin;Samuel;Gregory;Alexander;Frank;Patrick;Raymond;Jack;Dennis;Jerry;Tyler;Aaron;Jose;Adam;Nathan;Henry;Douglas;Zachary;Peter;Kyle;Ethan;Walter;Noah;Jeremy;Christian;Keith;Roger;Terry;Gerald;Harold;Sean;Austin;Carl;Arthur;Lawrence;Dylan;Jesse;Jordan;Bryan;Billy;Joe;Bruce;Gabriel;Logan;Albert;Willie;Alan;Juan;Wayne;Elijah;Randy;Roy;Vincent;Ralph;Eugene;Russell;Bobby;Mason;Philip;Louis";
  let names = namelist.split(";");
  return names[Math.floor(Math.random() * names.length)];
};

const createCopy = (o) => JSON.parse(JSON.stringify(o));

CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  this.beginPath();
  this.moveTo(x + r, y);
  this.arcTo(x + w, y, x + w, y + h, r);
  this.arcTo(x + w, y + h, x, y + h, r);
  this.arcTo(x, y + h, x, y, r);
  this.arcTo(x, y, x + w, y, r);
  this.closePath();
  return this;
};

let workingWorld = {};

const heightOffset = 180;
export class World {
  constructor(
    props = {
      canvas: null,
      doc: document,
      G: { x: 0, y: 0.001 },
      pattern: "color",
      background: "#000",
      color: "#fff",
      size: {
        width: window.innerWidth,
        height: window.innerHeight - heightOffset,
      },
      hasLimits: true,
      responsive: true,
      tag: "map",
      border: { width: 0, background: "#000", pattern: "color" },
      sprites: {},
      onmousemove: null,
      onclick: null,
      onmouseup: null,
      rotation: 0,
    }
  ) {
    eventify(this);

    this.canvas = props.canvas || null;
    this.doc = props.doc || document;
    this.G = props.G || { x: 0, y: 0.001 };
    this.pattern = props.pattern || "color";
    this.background = props.background || "#000";
    this.color = props.color || "#fff";
    this.size = props.size || {
      width: window.innerWidth,
      height: window.innerHeight - heightOffset,
    };
    this.hasLimits = props.hasLimits !== undefined ? props.hasLimits : true;
    this.tag = this.tag || "map";
    this.border = props.border || {
      width: 0,
      background: "#000",
      pattern: "color",
    };
    this.sprites = this.sprites || {};

    this.G = props.G || { x: 0, y: 0.001 };
    this.Objects = [];
    this.keys = {};

    if (!this.canvas) {
      this.canvas = this.doc.createElement("canvas");
      this.canvas.width = this.size.width;
      this.canvas.height = this.size.height;
      this.doc.body.appendChild(this.canvas);
    }
    this.ctx = this.canvas.getContext("2d");
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.set = (k, v) => {
      this[k] = v;
    };

    this.responsive = props.responsive !== undefined ? props.responsive : true;
    if (this.responsive) {
      var ta = () => {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height - heightOffset;
      };
      window.addEventListener("resize", ta);
    }

    this.rotation = props.rotation != undefined ? props.rotation : 0;

    this.borderY = {
      type: "rectangle",
      pattern: this.border.pattern,
      background: this.border.background,
      width: this.border.width,
      height: this.height,
      x: 0,
      y: 0,
      tag: "border",
      border: this.border,
    };
    this.borderX = {
      type: "rectangle",
      pattern: this.border.pattern,
      background: this.border.background,
      width: this.width,
      height: this.border.width,
      x: 0,
      y: 0,
      tag: "border",
      border: this.border,
    };
    this.borderYW = {
      type: "rectangle",
      pattern: this.border.pattern,
      background: this.border.background,
      width: this.border.width,
      height: this.height,
      x: this.width - this.border.width,
      y: 0,
      tag: "border",
      border: this.border,
    };

    this.borderXW = {
      type: "rectangle",
      pattern: this.border.pattern,
      background: this.border.background,
      width: this.width,
      height: this.border.width,
      x: 0,
      y: this.height - this.border.width,
      tag: "border",
      name: "borderXW",
      border: this.border,
    };

    this.hasLimits == true &&
      [this.borderX, this.borderY, this.borderXW - 1, this.borderYW].forEach(
        (o) => {
          this.register(new Shape({ ...o, physics: false }));
        }
      );

    this.onLoad = (c) => window.addEventListener("load", c);
    this.doc.addEventListener("keydown", (e) => {
      this.keys[e.key] = true;
    });
    this.doc.addEventListener("keyup", (e) => {
      this.keys[e.key] = false;
    });

    this.tag = this.tag || "map";

    Object.keys(this.sprites).forEach((k, i) => {
      this.sprites[k] = {};
      this.sprites[k].image = new Image();
      this.sprites[k].image.src = this.sprites[k].src;
      this.sprites[k].image.decode().then(() => {
        this.sprites[k].width = this.sprites[k].image.width;
        this.sprites[k].height = this.sprites[k].image.height;
      });
    });

    this.mouse = {
      x: 0,
      y: 0,
    };

    this.canvas.addEventListener("mousemove", (e) => {
      this.mouse.x = e.offsetX;
      this.mouse.y = e.offsetY;
    });

    this.canvas.addEventListener("touchmove", (e) => {
      e.preventDefault();
      this.mouse.x = ~~e.touches[0].clientX;
      this.mouse.y = ~~e.touches[0].clientY;
    });

    this.mousedown = props.mousedown || (() => {});
    this.mouseup = props.mouseup || (() => {});
    this.mousemove = props.mousemove || (() => {});

    this.canvas.addEventListener("mousedown", (e) => this.mousedown(e));
    this.canvas.addEventListener("mouseup", (e) => this.mouseup(e));
    this.canvas.addEventListener("mousemove", (e) => this.mousemove(e));

    this.emit("load");

    workingWorld = this;
  }
  key = {
    isPressed: (k) => this.keys[k],
  };
  destroy() {
    this.canvas.remove();
    this.Objects = [];
    delete this;
  }
  register(object) {
    this.Objects.push(object);
  }
  unregister(object) {
    this.Objects.forEach(
      (o, i) => o.id === object.id && this.Objects.splice(i, 1)
    );
  }
  center(ob, disaVel = false) {
    ob.x = this.canvas.width / 2;
    ob.y = this.canvas.height / 2;
    if (disaVel) {
      ob.velocity = {
        x: 0,
        y: 0,
      };
    }
  }

  draw(props) {
    props.type = props.type || "rectangle";
    props.background = props.background || "#000";
    props.pattern = props.pattern || "color";
    props.radius = props.radius || undefined;
    props.width = props.radius || props.width * 2 || 50;
    props.height = props.radius || props.height * 2 || 50;
    props.x = props.x !== undefined ? props.x : this.canvas.width / 2;
    props.y = props.y !== undefined ? props.y : this.canvas.height / 2;
    props.rotation = props.rotation !== undefined ? props.rotation : 0;

    props.x1 = props.x1 !== undefined ? props.x1 : props.x;
    props.y1 = props.y1 !== undefined ? props.y1 : props.y;
    props.x2 = props.x2 !== undefined ? props.x2 : props.x;
    props.y2 = props.y2 !== undefined ? props.y2 : props.y;

    this.ctx.save();
    this.ctx.translate(props.x, props.y);
    this.ctx.rotate(props.rotation);
    switch (props.type) {
      case "rectangle":
        switch (props.pattern) {
          case "color":
            this.ctx.fillStyle = props.background;
            this.ctx.fillRect(props.x, props.y, props.width, props.height);
            break;
          case "image":
            this.ctx.drawImage(
              props.image,
              -props.width / 2,
              -props.height / 2,
              props.width,
              props.height
            );
            break;
        }
        break;
      case "circle":
        switch (props.pattern) {
          case "color":
            this.ctx.fillStyle = props.background;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, props.radius, 0, 2 * Math.PI);
            this.ctx.fill();
            break;
          case "image":
            // draw a circle image
            this.ctx.drawImage(
              props.image,
              -props.radius,
              -props.radius,
              props.radius * 2,
              props.radius * 2
            );
            break;
        }
        break;
      case "dot":
        switch (props.pattern) {
          case "color":
            this.ctx.fillStyle = props.background;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, props.radius, 0, 2 * Math.PI);
            this.ctx.fill();
            break;
          case "image":
            // draw a circle image
            this.ctx.drawImage(
              props.image,
              -props.radius,
              -props.radius,
              props.radius * 2,
              props.radius * 2
            );
            break;
        }
        break;
      case "line":
        this.ctx.strokeStyle = props.background;
        this.ctx.lineWidth = props.width;
        this.ctx.beginPath();
        this.ctx.moveTo(
          props.x1 - workingWorld.width / 2,
          props.y1 - workingWorld.height / 2
        );
        this.ctx.lineTo(
          props.x2 - workingWorld.width / 2,
          props.y2 - workingWorld.height / 2
        );
        this.ctx.stroke();
        break;
    }
    this.ctx.restore();
  }

  collision(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  isTouchingLimits(object) {
    return (
      object.x + object.width > 0 &&
      object.x < workingWorld.width &&
      object.y + object.height > 0 &&
      object.y < workingWorld.height
    );
  }

  getElementsByTagName(tag) {
    return this.Objects.filter((o) => o.tag === tag);
  }

  getElementByTagName(tag) {
    return this.Objects.find((o) => o.tag === tag);
  }

  getElementsByName(name) {
    return this.Objects.filter((o) => o.name === name);
  }

  getElementByName(name) {
    return this.Objects.find((o) => o.name === name);
  }

  getElementsByType(type) {
    return this.Objects.filter((o) => o.type === type);
  }

  preventCollision(a, b) {
    if (typeof b === "object" && b instanceof Array)
      b.forEach((b) => this.preventCollision(a, b));
    else {
      if (a.id !== b.id && this.collision(a, b)) {
        if (!a.isBody || !b.isBody) {
          return;
        }
        if (a.tag !== "border" && b.tag !== "border") {
          if (!a.CCHas(b)) {
            a.onCollision(b, a);
            b.onCollision(a, b);
            a.collideWith(b);
            b.collideWith(a);
          }
        }
        if (a.physics) {
          switch (a.cacheDirection) {
            case "left":
            case "right":
              var foo = ~~(-a.velocity.x * a.rebound);
              a.velocity.x = foo;
              if (foo == 0) {
                a.cacheDirection = "left";
              }
              a.cacheDirection = a.velocity.x < 0 ? "right" : "left";
              if (foo === 0) {
                // get which direction the object is moving
              }
              break;
            case "up":
            case "down":
              var foo = ~~(-a.velocity.y * a.rebound);
              a.velocity.y = foo;
              a.cacheDirection = a.velocity.y < 0 ? "down" : "up";
              if (foo === 0) {
                a.cacheDirection = "down";
              }
              break;
          }
        }
        switch (a.cacheDirection) {
          case "down":
            if (a.y + a.height > b.y) {
              a.y = b.y - a.height;
              a.velocity.x = a.velocity.x * a.friction;
            }
            break;
          case "up":
            if (a.y < b.y + b.height) {
              a.y = b.y + b.height;
              a.velocity.x = a.velocity.x * a.friction;
            }
            break;
          case "left":
            if (a.x < b.x + b.width) {
              a.x = b.x + b.width;
            }
            break;
          case "right":
            if (a.x + a.width > b.x) {
              a.x = b.x - a.width;
            }
            break;
        }
      }

      // Call a.onFinishCollision(b) when a is not touching b anymore
      else if (!this.collision(a, b) && b.CCHas(a)) {
        a.finishCollideWith(b);
        b.finishCollideWith(a);
        a.onFinishCollision(b, a);
        b.onFinishCollision(a, b);
      }
    }
  }

  update(optionalPrefixCallback = null) {
    this.ctx.clearRect(0, 0, this.width, this.height);
    switch (this.pattern) {
      case "color":
        this.draw({
          pattern: "color",
          background: this.background,
          x: 0,
          y: 0,
          width: this.width,
          height: this.height,
        });
        break;
      case "image":
        this.draw({
          pattern: "image",
          image: this.background.image,
          x: 0,
          y: 0,
          width: this.width,
          height: this.height,
        });
        break;
    }
    optionalPrefixCallback && optionalPrefixCallback();
    this.Objects.forEach((o) => {
      if (o.physics) {
        // if there is something under the object, do nothing
        if (
          this.getElementsByType("border").some((b) => this.collision(o, b))
        ) {
          o.velocity.y = 0;
          o.velocity.x = 0;
          switch (o.cacheDirection) {
            case "down":
              o.cacheDirection = "up";
              break;
            case "up":
              o.cacheDirection = "down";
              break;
            case "left":
              o.cacheDirection = "right";
              break;
            case "right":
              o.cacheDirection = "left";
              break;
          }
        } else {
          o.velocity.x += this.G.x;
          o.velocity.y += this.G.y;
        }
        o.move("left", -o.velocity.x);
        o.move("down", o.velocity.y);
      }
      o.draw();
    });
    this.preventCollision(this, workingWorld.Objects);
  }

  getCursorPosition() {
    return {
      x: this.mouse.x,
      y: this.mouse.y,
    };
  }

  loadMapFromStringArray(map, mapRef) {
    let res = {};
    map.forEach((line, y) => {
      line.split("").forEach((c, x) => {
        const len = line.length;
        mapRef[c] &&
          (() => {
            if (!res[c]) res[c] = [];
            res[c].push(
              mapRef[c]({
                mapWidth: workingWorld.width,
                mapHeight: workingWorld.height,
                x: x * (workingWorld.width / len),
                y: y * (workingWorld.height / map.length),
                width: workingWorld.width / len,
                height: workingWorld.height / map.length,
                Cindex: x,
                Lindex: y,
              })
            );
          })();
      });
    });
    return res;
  }

  HoveredObjects() {
    return workingWorld.Objects.filter((o) => {
      return (
        o.x < this.mouse.x &&
        o.x + o.width > this.mouse.x &&
        o.y < this.mouse.y &&
        o.y + o.height > this.mouse.y
      );
    });
  }

  getEmptySpace(exceptObject) {
    const emptySpaceRanges = [];
    let occupied = [];

    this.Objects.forEach((o) => {
      if (o.tag !== "border" && o.tag !== "emptySpace" && o.tag !== "player") {
        occupied.push({
          x: o.x,
          y: o.y,
          width: o.width,
          height: o.height,
        });
      }
    });

    if (exceptObject) {
      occupied.forEach((o) => {
        if (o.x === exceptObject.x && o.y === exceptObject.y) {
          occupied.splice(occupied.indexOf(o), 1);
        }
      });
    }

    occupied.forEach((o) => {
      const x = o.x;
      const y = o.y;
      const width = o.width;
      const height = o.height;

      const left = x;
      const right = x + width;
      const up = y;
      const down = y + height;

      const leftRange = {
        start: left,
        end: right,
      };
      const rightRange = {
        start: left,
        end: right,
      };
      const upRange = {
        start: up,
        end: down,
      };
      const downRange = {
        start: up,
        end: down,
      };

      emptySpaceRanges.push(leftRange);
      emptySpaceRanges.push(rightRange);
      emptySpaceRanges.push(upRange);
      emptySpaceRanges.push(downRange);
    });

    emptySpaceRanges.sort((a, b) => a.start - b.start);

    // this will return: [{ start: 0, end: 100 }, { start: 200, end: 300 }]
  }
}

const exist = (e) => e !== undefined;

export class Shape {
  constructor(
    props = {
      type: "rectangle",
      x: 0,
      y: 0,
      width: 10,
      height: 10,
      isBody: true,
      pattern: "color",
      background: "",
      rotation: 0,
      name: getRandomName(),
      tag: "unknown",
      onCollision: (a, b) => console.log("Collided with:", b.name),
      onFinishCollision: (a, b) =>
        console.log("Finished colliding with:", b.name),
      physics: true,
      rebound: 0.9,
      friction: 0.5,
      id: id(),
      speed: 3,
      velocity: { x: 0, y: 0 },
      border: {
        background: "blue",
        width: 2,
      },
      VEC2: {
        x1: 0,
        y1: 0,
        x2: 1,
        y2: 1,
      },
    },
    isTemplate = false
  ) {
    if (!workingWorld) {
      throw new Error("BrainError: No world is initialized!");
    }

    eventify(this);

    this.type = props.type || "rectangle";
    this.background = props.color || "black";
    this.x = props.x || 0;
    this.y = props.y || 0;
    this.radius = props.radius;
    if (this.radius !== undefined) {
      this.width = this.radius;
      this.height = this.radius;
    } else {
      this.width = props.width || 10;
      this.height = props.height || 10;
    }
    this.isBody = props.isBody !== undefined ? props.isBody : false;
    this.pattern = props.pattern || "color";
    this.background = props.background || "";
    this.rotation = props.rotation || 0;
    this.name = props.name || getRandomName();
    this.tag = props.tag || "unknown";
    this.onCollision =
      props.onCollision ||
      /* ((a, b) => console.log('Collided with:', b.name)); */ (() => {});
    this.onFinishCollision =
      props.onFinishCollision ||
      /* ((a, b) => console.log('Finished colliding with:', b.name)); */ (() => {});
    this.collitionObjects = [];
    this.physics = props.physics !== undefined ? props.physics : true;
    this.rebound = props.rebound !== undefined ? props.rebound : 0.9;
    this.friction = props.friction !== undefined ? props.friction : 0.5;

    this.border =
      props.border !== undefined
        ? props.border
        : {
            background: "transparent",
            width: 0,
          };

    this.VEC2 = props.VEC2 || {
      x1: 0,
      y1: 0,
      x2: 1,
      y2: 1,
    };

    this.id = id();

    this.cacheDirection = "right";

    this.speed = props.speed || 3;
    this.velocity = props.velocity || { x: 0, y: 0 };

    workingWorld.register && !isTemplate && workingWorld.register(this);

    return this;
  }

  collideWith(object) {
    this.collitionObjects.push(object);
  }

  finishCollideWith(object) {
    this.collitionObjects.forEach(
      (o, i) => o.id === object.id && this.collitionObjects.splice(i, 1)
    );
  }

  rotate(angle) {
    this.rotation += angle;
  }

  setRotation(angle) {
    this.rotation = angle;
  }

  preloadImages(images) {}

  draw() {
    switch (this.type) {
      case "rectangle":
        if (this.pattern === "color") {
          workingWorld.ctx.fillStyle = this.background;
          workingWorld.ctx.fillRect(this.x, this.y, this.width, this.height);
        }
        if (this.pattern === "gradient") {
          if (!this.background.gradientSettings)
            throw new Error("ArgumentError: No gradient settings found!");
          if (!this.background.gradientSettings.startColor)
            throw new Error("ArgumentError: No start color found!");
          if (!this.background.gradientSettings.endColor)
            throw new Error("ArgumentError: No end color found!");
          let grad = workingWorld.ctx.createGradient(
            this.background.gradientSettings
          );
          grad.addColorStop(0, this.background.gradientStart);
          grad.addColorStop(1, this.background.gradientEnd);
        }
        if (this.pattern === "image") {
          workingWorld.ctx.drawImage(
            this.background.image,
            this.x,
            this.y,
            this.width,
            this.height
          );
          // constructor(
        }

        break;
      case "circle":
        workingWorld.ctx.beginPath();
        workingWorld.ctx.arc(
          this.x + this.width / 2,
          this.y + this.height / 2,
          this.width / 2,
          0,
          2 * Math.PI
        );
        // arc cons
        workingWorld.ctx.fillStyle = this.pattern || this.background;
        workingWorld.ctx.fill();
        break;
      case "line":
        workingWorld.ctx.beginPath();
        workingWorld.ctx.moveTo(this.VEC2.x1, this.VEC2.y1);
        workingWorld.ctx.lineTo(this.VEC2.x2, this.VEC2.y2);
        workingWorld.ctx.strokeStyle = this.background;
        workingWorld.ctx.stroke();
        break;
      case "image":
        workingWorld.ctx.drawImage(
          this.image,
          this.x,
          this.y,
          this.width,
          this.height
        );
        break;
    }
    if (this.border) {
      workingWorld.ctx.strokeStyle = this.border.background;
      var tempWidth = workingWorld.ctx.lineWidth;
      workingWorld.ctx.lineWidth = this.border.width;
      workingWorld.ctx.strokeRect(this.x, this.y, this.width, this.height);
      workingWorld.ctx.lineWidth = tempWidth;
    }
  }

  remove() {
    workingWorld.unregister(this);
  }

  returnStatement() {
    return this;
  }

  isOutOfMap() {
    return (
      this.x < 0 ||
      this.x > workingWorld.width ||
      this.y < 0 ||
      this.y > workingWorld.height
    );
  }

  isOutOfRange(range) {
    return (
      this.x < range.start ||
      this.x > range.end ||
      this.y < range.start ||
      this.y > range.end
    );
  }

  get(p) {
    return this[p];
  }

  set(p, v) {
    this[p] = v;
    return this;
  }

  move(direction, optionalSpeed = null, noMatterCollision = false) {
    this.cacheDirection = direction;
    var movingSpeed = optionalSpeed !== null ? optionalSpeed : this.speed;
    switch (direction) {
      case "up":
        this.y -= movingSpeed;
        break;
      case "down":
        this.y += movingSpeed;
        break;
      case "left":
        this.x -= movingSpeed;
        break;
      case "right":
        this.x += movingSpeed;
        break;
      default:
        break;
    }

    workingWorld.preventCollision(this, workingWorld.Objects);
  }

  follow(target) {
    const x = target.x - this.x;
    const y = target.y - this.y;
    const angle = Math.atan2(y, x);
    this.velocity.x = Math.cos(angle) * this.speed;
    this.velocity.y = Math.sin(angle) * this.speed;

    let directionString = "";
    if (this.velocity.x > 0) {
      directionString += " right";
    }
    if (this.velocity.x < 0) {
      directionString += " left";
    }
    if (this.velocity.y > 0) {
      directionString += " down";
    }
    if (this.velocity.y < 0) {
      directionString += " up";
    }
    directionString = directionString.substring(1);
    directionString.split(" ").forEach((d) => this.move(d));

    workingWorld.preventCollision(this, workingWorld.Objects);
  }

  onCollide(callback) {
    this.onCollision = callback;
  }

  isCollidingWith(target) {
    return workingWorld.collision(this, target);
  }

  CCHas(target) {
    var res = false;
    this.collitionObjects.forEach((o) => {
      o.id === target.id && (res = true);
    });
    return res;
  }

  jump(howHigh) {
    this.velocity.y = -howHigh;
  }
}

export function Text(p) {
  p.text = p.text || "";
  p.background = p.background || "white";
  p.font = p.font || "Arial";
  p.size = p.size || "20px";
  p.x = p.x || 0;
  p.y = p.y || 0;
  p.type = p.type || "fill";

  p.y = p.y + p.size.split("px")[0] / 2;

  workingWorld.ctx.font = p.size + " " + p.font;
  switch (p.type) {
    case "fill":
      workingWorld.ctx.fillStyle = p.background;
      workingWorld.ctx.fillText(p.text, p.x, p.y);
      break;
    case "stroke":
      workingWorld.ctx.strokeStyle = p.background;
      workingWorld.ctx.strokeText(p.text, p.x, p.y);
      break;
    default:
      break;
  }
}

export function image(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.src = src;
  });
}

export async function spritesBETA(spriteObj) {
  for (let key in spriteObj) {
    workingWorld.sprites[key] = await image(spriteObj[key]);
  }
}
