const http = require("http");
const express = require("express");
const app = express();

app.use(express.static(__dirname + '/../docs'));
app.use((req, res, next)  => {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

module.exports = {
    serve: function(port) {
        http.createServer(app).listen(port, '127.0.0.1');
        console.log("HTTP Listening on http://127.0.0.1:" + port);
    }
};
