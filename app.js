const WebSocket = require('ws');
const docs = require('./src/docs');
const Chat = require('./src/chat');

docs.serve(8081);

new Chat(new WebSocket.Server({ port: 8082 }));
console.log("Chat server listening on http://127.0.0.1:8082");
