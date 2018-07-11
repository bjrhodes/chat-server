const mysql = require("mysql");

class messageStore {

    constructor(host, username, password, db) {
        this.config = {host: host, user: username, password: password, database: db};
        console.log("dbconfig: " + [this.config.host, this.config.database, this.config.user].join(' | '));
    }

    passThrough (fn) {
        return (val) => fn.call(this).then(() => val);
    }

    done (resolve, reject) {
        return (err, res) => {
            if (err) {
                console.log(err);
                return reject(err);
            }
            resolve(res);
        };
    }

    connect() {
        return mysql.createConnection(this.config);
    }

    latest() {
        return new Promise( ( resolve, reject ) => {
                this.connection = this.connect();
                this.connection.query(
                    'SELECT * FROM `messages` ORDER BY `created` DESC LIMIT 10',
                    this.done(resolve, reject)
                );
            })
            .then((messages) => messages.reverse()) // I want most recent 10, but then oldest to newest
            .then(this.passThrough(this.close)).catch((err) => {
                console.log(err);
                return [];
            });
    }

    insert(message) {
        return new Promise( ( resolve, reject ) => {
                this.connection = this.connect();
                this.connection.query(
                    'INSERT INTO messages SET ?',
                    message,
                    this.done(resolve, reject)
                );
            })
            .then(this.passThrough(this.close))
            .catch((err) => console.log(err));
    }

    close() {
        return new Promise((resolve, reject) => {
            this.connection.end(this.done(resolve, reject));
        });
    }
}

module.exports = messageStore;
