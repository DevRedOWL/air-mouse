# AirMouse 🐁🖱️

**A flexible remote mouse control for PC's using a mobile device (IOS/Android) in real time.**

# Setup:

```shell
git clone https://github.com/DevRedOWL/air-mouse/
cd air-mouse
npm install # Installs the Required NPM Packages
```

# Start:

`node server.js` or `npm start`

# Features

## 🖱️ **Basic Controls:**

- **Left Click:** A single press on the button triggers a left-click event.
- **🔒 Left Mouse Button Hold:** A long press on the left mouse button locks it (press is fixed). A second press unlocks it.
- **📌 Mouse Movement:** Dragging across the screen moves the cursor, and the coordinates are sent to the server.

## 🪟 **Window Switching:**

- **Window button:** A single press simulates switching between windows (Alt + Tab).
- **🔒 Window button Hold:** A long press locks the key combination which allows to move window between displays, using the media controls. A second press disables the lock.

## 🎵 **Media Player Controls:**

- **⏯️ Play/Pause**
- **⏮️ Left keyboard button (Acts as rewind in media played)**
- **⏭️ Right keyboard button (Acts as fast forward in media player)**
- **🔊 Volume Up**
- **🔉 Volume Down**

## 🔁 **Mode Switching:**

- The mode switch button toggles between classic control mode and media player mode.
- The icon changes depending on the mode: 🎮 or 🎵.

## ⌨️ **Text Input via Swipe:**

- **⬆️ Swipe on Space Bar:** Swiping the "Space" button upwards opens a text input field.
- After entering text, it is sent to the controlled device as keyboard input.

## 📍 **Coordinate and Movement Display:**

- Real-time display of the current cursor coordinates and movements (`dx`, `dy`).
- Upon double-tap or touch end, drawing lines are removed.

> Maintained and refined by [@DevRedOWL](https://github.com/DevRedOWL) with inspiration from [@rhpo](https://github.com/rhpo) ❤️.
