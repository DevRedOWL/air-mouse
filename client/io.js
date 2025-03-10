import socketIO from "./socketio.js";
const io = socketIO(`http://${location.hostname}:2499`);

export default io;
