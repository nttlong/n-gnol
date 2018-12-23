var __privileges__=";public;view;insert;update;delete;print;export;import;copyy;custome;"
var ControllerActionSender=require("./controller-action-sender");
class InvalidPrivileges extends Error {
    constructor(message){
        super(`"${message}" is invalid value, the value must be in ${__privileges__}`);

    }
}

class actionWrapper {
    constructor(privilege,fn){
        if (__privileges__.indexOf(";"+privilege+";")==-1){
            throw (new InvalidPrivileges(privilege))
        }
        this.privilege=privilege;
        this.method=fn;
    }
}
/**
 * 
 * @param {string} privilge 
 * @param {ControllerActionSender} sender
 * @param {*} fn 
 */
function createMethod(privilge,fn){
    return new actionWrapper(privilge, fn);
}
module.exports = createMethod