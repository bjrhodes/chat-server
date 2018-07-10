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
function getColor() {
    colorIndex++;
    colorIndex = colorIndex >= colors.length ? 0 : colorIndex;
    return colors[colorIndex];
}

const WebSocket = require('ws');
const http = require("http");
const express = require("express");
const mysql = require("mysql");
const colors = shuffle(['#001f3f', '#0074D9', '#7FDBFF', '#39CCCC', '#3D9970', '#2ECC40', '#01FF70', '#FFDC00', '#FF851B', '#FF4136', '#85144b', '#F012BE', '#B10DC9', '#111111', '#AAAAAA', '#DDDDDD']);
var colorIndex = 0;

const db_host = process.env.DB_HOST;
const db_user = process.env.DB_USER;
const db_pass = process.env.DB_PASS;
const db_name = process.env.DB_NAME;
console.log("dbconfig: " + [db_host, db_name, db_user].join(' | '));
const wss = new WebSocket.Server({ port: 8082 });
console.log("websocket Listening on http://127.0.0.1:8082");
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
server.listen('8081', '127.0.0.1');
console.log("HTTP Listening on http://127.0.0.1:8081");

function validateMessage(data) {
    try {
        data = JSON.parse(data);
    } catch (e) {
        return false;
    }
    return data.message && data.username;
}
function dbConnect() {
    return mysql.createConnection({
        host     : db_host,
        user     : db_user,
        password : db_pass,
        database : db_name
    });
}
function sendLatestMessages(ws) {
    dbConnection = dbConnect();
    dbConnection.query('SELECT * FROM `messages` LIMIT 10 ORDER BY id DESC', function (error, messages, fields) {
        if (messages) {
            messages.forEach(function(message) {
                ws.send(JSON.stringify(message));
            });
        }
    });
    dbConnection.end()
}

function broadcast(packet) {
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(packet));
        }
    });
}
wss.on('connection', function connection(ws) {
    var username = null,
        color = getColor();

    sendLatestMessages(ws);

    ws.on('message', function incoming(input) {
        var input, message,
            dbConnection = dbConnect();

        if (!validateMessage(input)) {
            ws.send('{"error":"Invalid input"}');
            return;
        }
        input = JSON.parse(input);
        username = username ? username : input.username;
        message  = {
            username: username,
            color: color,
            message: input.message,
        };
        dbConnection.query('INSERT INTO messages SET ?', message, function (err) {
            if (err) {
                console.log(err);
            }
            broadcast(message);
        });
        dbConnection.end();
    });
});
