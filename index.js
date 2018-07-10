const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });
const http = require("http");
const express = require("express");
const app = express();

const server = http.createServer(app);
app.get('/', function(req, res) {
    res.send("OK");
});
app.get('/favicon.ico', function(req, res) {
    res.send("");
});
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
console.log("Listening on http://127.0.0.1:80");
server.listen('80', '127.0.0.1');

function shuffle (array) {
    var i = 0, j = 0, temp = null;

    for (i = array.length - 1; i > 0; i -= 1) {
        j = Math.floor(Math.random() * (i + 1));
        temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}
var colors = shuffle(['#001f3f', '#0074D9', '#7FDBFF', '#39CCCC', '#3D9970', '#2ECC40', '#01FF70', '#FFDC00', '#FF851B', '#FF4136', '#85144b', '#F012BE', '#B10DC9', '#111111', '#AAAAAA', '#DDDDDD']);
var colorIndex = 0;
function getColor() {
    colorIndex++;
    colorIndex = colorIndex >= colors.length ? 0 : colorIndex;
    return colors[colorIndex];
}

function validateMessage(data) {
    try {
        data = JSON.parse(data);
    } catch (e) {
        return false;
    }
    return data.message && data.username;
}

wss.on('connection', function connection(ws) {
    var username = null,
        color = getColor();

    ws.on('message', function incoming(data) {
        if (!validateMessage(data)) {
            ws.send('{"error":"Invalid data"}');
            return;
        }
        data = JSON.parse(data);
        username = username ? username : data.username;
        data.color = color;

        // Broadcast to everyone else.
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(data));
            }
        });
    });
});
