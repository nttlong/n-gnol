require("./extends");
var ControllerActionSender = require("./controller-action-sender")
var apps = {}
class App {
    constructor(config) {
        if (!config.name) {
            throw (`'name' was not found`);
        }
        if (!config.host) {
            throw ('"host" was not found');
        }
        if (!config.templates) {
            config.templates = "views";
        }
        if (!config.controllers) {
            config.controllers = "controllers";
        }
        if(!config.static){
            config.static="static"
        }
        this.name = config.name;
        this.host = config.host;
        this.templates = config.templates;
        this.controllers = config.controllers;
        this.static=config.static
        apps[this.name]=this;

    }
    /**
     * get name of application
     */
    getName() {
        return this.name;
    }
    /**
     * get template path of app
     * @param {string} path 
     */
    setTemplates(path) {
        this.templates = path;
        return this;
    }
    getTemplate() {
        return this.templates
    }
}
/**
 * 
 * @param {name:string,host:string;templates:string;controlers:string} config 
 * @returns{App}
 */
var createApp = (config) => {
    return new App(config);
}
/**
 * 
 * @param {string} name 
 * @returns {App}
 */
var getApp=(name)=>{
    return apps[name];
}
/**
 * 
 * @param {ControllerActionSender} sender
 */
function getControllerSender(sender){
    return sender;
}
module.exports = {
    createApp: createApp,
    getApp:getApp,
    loadApps:require("./load-apps"),
    settings:require("./settings"),
    controller:require("./controller"),
    action:require("./action-wrapper"),
    view:require("./view"),
    ControllerActionSender: ControllerActionSender,
    getControllerSender: getControllerSender,
    Request:require("express").request
};

