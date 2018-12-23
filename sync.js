var DEASYNC = require("deasync");
function sync(fn, args, cb) {
    function reject(e) {
        result = {
            error: e
        };
    }
    ;
    function resolve(r) {
        result = {
            result: r
        };
    }
    if (args instanceof Array) {
        var result = undefined;
        var _cb = function (e, r) {
            if (e) {
                result = {
                    error: e
                };
            }
            else {
                result = {
                    result: r
                };
            }
        };
        args.push(_cb);
        fn.apply(fn, args);
        DEASYNC.loopWhile(function () {
            return result === undefined;
        });
        if (result.error) {
            var ex = new Error(result.error.message || "");
            ex.stack = result.error;
            throw (ex);

        }
        else {
            return result.result;
        }
    }
    else {
        var result = undefined;
        fn({
            resolve: resolve,
            reject: reject,
        });
        DEASYNC.loopWhile(function () {
            return result === undefined;
        });
        if (result.error) {
            throw (result.error);
        }
        else {
            return result.result;
        }
    }
};
function CallerResult(fn, args, promiseCaller, callback) {
    this.__fn = fn;
    this.__args = args;
    this.__promiseCaller = promiseCaller;
    this.__callback = callback;
}
CallerResult.prototype.sync = function () {
    var me = this;
    function exec(cb) {
        me.__callback(cb);
    }
    return sync(exec, []);
}
CallerResult.prototype.then = function (cb) {
    if (!this.__promise) {
        this.__promise = new Promise(this.__promiseCaller);
    }
    return this.__promise.then(cb);
}
CallerResult.prototype.promise = function () {
    return new Promise(this.__promiseCaller);
}
CallerResult.prototype.catch = function (cb) {
    if (!this.__promise) {
        this.__promise = new Promise(this.__promiseCaller);
    }
    return this.promise.catch(cb);
}
CallerResult.prototype.call = function (cb) {
    return this.callback(cb);
}
function Executor() {
    this.__functions = [];
    if (arguments.length > 0) {
        for (var i = 0; i < arguments[0].length; i++) {
            this.call(arguments[0][i]);
        }
    }

}
Executor.prototype.call = function () {
    this.__functions.push(caller.apply(caller, arguments).promise());
    return this;
}
Executor.prototype.then = function (cb) {
    if (!this.__allPromise) {
        this.__allPromise = Promise.all(this.__functions);
    }
    return this.__allPromise.then(cb);
}
Executor.prototype.callback = function (cb) {
    Promise.all(this.__functions).then(function (r) {
        cb(null, r);
    }).catch(function (ex) {
        cb(ex);
    });
}
Executor.prototype.sync = function () {
    var me = this;
    function exec(cb) {
        me.callback(cb);
    }
    return sync(exec, []);
}
function caller() {
    var fn = arguments[arguments.length - 1];
    var args = [];
    for (var i = 0; i < arguments.length - 1; i++) {
        args.push(arguments[i]);
    }
    function callback(cb) {
        args.push(cb);
        fn.apply(fn, args);
    }
    var promiseCaller = function (resolve, reject) {
        function cb(e, r) {
            if (e) reject(e);
            else {
                resolve(r);
            }
        }
        args.push(cb);
        fn.apply(fn, args);
    };
    return new CallerResult(fn, args, promiseCaller, callback)
}
function parallel() {
    return new Executor(arguments);
}
module.exports = {
    sync: sync,
    caller: caller,
    parallel: parallel
}