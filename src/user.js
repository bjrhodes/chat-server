const colors = new (require('./colors'));

module.exports = class User {
    constructor(username) {
        this.username = username;
        this.color = colors.get();
    }
    setUsername(username) {
        this.username = username;
    }
}