const _ = require('./util')

// 构建storage存储的简单方法，api：set,get,remove

function XXXStorage(name, option) {

    if (!localStorage) throw Error('不支持localStorage的浏览器')
    option = _.extend(option || {}, {
        maxSize: 1024 * 1024 * 2 // 2M. 指的是JSON.stringify后的长度
    })

    if (!name) throw Error('必须制定一个名字');

    this.name = name;

    this._data = JSON.parse(localStorage.getItem(this.name) || '{}');
}

var so = XXXStorage.prototype;


// storage.set('report.showHelper')
so.set = function(path, item) {
    var pathes = path.split('.');
    var len = pathes.length;

    pathes.reduce(function(container, path, index) {
        if (index !== len - 1) {
            return container[path] == undefined ? (container[path] = {}) : container[path]
        } else {
            container[path] = item;
        }
    }, this._data);

    this.sync();
}

so.get = function(path) {
    var pathes = path.split('.');

    return pathes.reduce(function(container, path) {
        if (container == undefined) return container
        return container[path]
    }, this._data);

}

so.remove = function(pathe) {
    var pathes = path.split('.');
    var len = pathes.length;

    pathes.reduce(function(container, path, index) {
        if (index !== len - 1) {
            return container[path]
        } else {
            delete container[path]
        }
    }, this._data);

    this.sync();
}

// 限制sync频率, 其实从初始之后，我们已经无需再从storage中获取数据，内部中即可
so.sync = function() {
    var name = this.name;
    localStorage.setItem(this.name, JSON.stringify(this._data));
}


var storage = new XXXStorage('xxx');

// storage.Storage = XXXStorage;

module.exports =  storage;
