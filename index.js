var fs = require('fs');

var options = {
    key: fs.readFileSync('certs/cert.key'),
    cert: fs.readFileSync('certs/cert.crt')
};

var app = require('https').createServer(options);
var io = require('socket.io').listen(app);
app.listen(8000);

let clients = new Map();
let messages = [];
let id = 0;

// event fired every time a new client connects:
io.on("connection", (socket) => {
    console.info(`Client connected [id=${socket.id}]`);
    // initialize this client's sequence number

    let name = "Guest-" + id;
    id++;
    clients.set(socket, name);

    socket.emit("history", messages);

    // when socket disconnects, remove it from the list:
    socket.on("disconnect", () => {
        clients.delete(socket);
        console.info(`Client gone [id=${socket.id}]`);
    });

    socket.on("name", (name) => {
        clients.set(socket, name);
    });

    socket.on("message", (message) => {
        console.log(message);
        let m = {
            "Author": clients.get(socket),
            "Content": message,
            "Time" : new Date()
        }
        messages.push(m)
        socket.broadcast.emit("message", m);
    });
});