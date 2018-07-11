const WebSocket = require('ws');
const Connection = require('./connection.js');
const MessageStore = require("./message-store.js");
const messageStore = new MessageStore(process.env.DB_HOST, process.env.DB_USER, process.env.DB_PASS, process.env.DB_NAME);

module.exports = class Chat {
    constructor(wss) {
        this.wss = wss;
        this.wss.on('connection', (ws) => this.newConnection(ws));
    }

    broadcast(message) {
        let payload = JSON.stringify(message);
        this.wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(payload);
            }
        });
    }

    incoming(input, connection, ws) {
        this.validateInput(input)
            .then((valid) => connection.updateInput(valid))
            .then((message) => Promise.all([messageStore.insert(message), this.broadcast(message)]))
            .catch((err) => {
                console.log(err);
                ws.send('{"error":"Invalid input"}')
            });
    }

    sendLatest(ws) {
        messageStore.latest().then((messages) => {
            messages.forEach((message) => {
                ws.send(JSON.stringify(message));
            });
        });
    }

    newConnection(ws) {
        var connection = new Connection();
        this.sendLatest(ws);
        ws.on('message', (input) => this.incoming(input, connection, ws));
    }

    validateInput(str) {
        return new Promise((resolve, reject) => {
            let obj = JSON.parse(str);
            if (obj.message && obj.username) {
                resolve(obj);
            } else {
                reject();
            }
        });
    }
}