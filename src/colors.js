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

module.exports = class Colors {
    constructor() {
        this.index = 0;
        this.colors = shuffle(['#001f3f', '#0074D9', '#7FDBFF', '#39CCCC', '#3D9970', '#2ECC40', '#01FF70', '#FFDC00', '#FF851B', '#FF4136', '#85144b', '#F012BE', '#B10DC9', '#111111', '#AAAAAA', '#DDDDDD']);
    }
    get() {
        this.index++;
        this.index = this.index >= this.colors.length ? 0 : this.index;
        return this.colors[this.index];
    }
}