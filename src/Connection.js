const User = require('./user');

module.exports = class Connection {
    constructor() {
        this.user = new User();
    }

    updateInput(input) {
        this.user.setUsername(input.username);
        return {
            username: this.user.username,
            color: this.user.color,
            message: input.message,
        };
    }
}