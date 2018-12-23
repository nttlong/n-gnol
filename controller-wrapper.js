var method=require("./action-wrapper");
var filewatcher = require('filewatcher');
var ControllerActionSender = require("./controller-action-sender");
var controllerView =require("./view");
var watcher = filewatcher();
class ControllerWrapper{
    /**
     * 
     * @param {*} config 
     * @param {*} app 
     */
    constructor(config,app){
        
        if(config.url===undefined){
            throw("'url' was not found");
        }
        if (config.template===undefined){
            throw ("'template' was not found");
        }
        if (config.fileName===undefined) {
            throw ( new Error("'fileName' was not found"));
        }
        if (config.app===undefined) {
            throw ( new Error("'app' object was not found"));
        }
        if (config.app.hostDir===undefined) {
            throw (new Error("'app.hostDir' object was not found"));
        }
        if (config.app.fullPath===undefined) {
            throw (new Error("'app.fullPath' object was not found"));
        }
        if (config.app.name===undefined) {
            throw (new Error("'app.name' was noy found"));
        }
        if(config.settings===undefined){
            throw(new Error('settings was not found'));
        }
        if(config.settings.app===undefined){
            throw(new Error("'settings.app' was not found"));
        }
        this.settings=config.settings;
        this.url=config.url;
        this.template=config.template;
        this.fileName=config.fileName;
        this.app={
            
        };
        Object.keys(config.app).forEach(k=>{
            this.app[k]=config.app[k];
        })
        this.controllersCache=config.controllersCache;
        this.controller=this.controllersCache[this.fileName];
        this.apply();
        watcher.add(this.fileName);
        var me=this;
        watcher.on('change', (file,stat)=>{
            delete require.cache[file];
            me.controller = require(file);
            console.log('File modified: %s', file);
            if (!stat) console.log('deleted');
        });
        
    }
    execMethod(methodOfActions,req,res,next){
        if (methodOfActions.privilege===undefined) {
            throw (new Error(`The privilege  of action 'get' in ${this.fileName} was not found`))
        }
        var isAllow = methodOfActions.privilege === "public";
        if (!isAllow) {
            var onAuthorize = undefined;
            if (this.app.onAuthorize === null) {
                if (this.settings.onAuthorize === null) {
                    throw (new Error(`onAuthorize was not found in ${me.app.fullPath} or in ${this.settings.workingDir}`))
                } else {
                    onAuthorize = this.settings.onAuthorize;
                }
            } else {
                onAuthorize = this.app.onAuthorize;
            }
            isAllow = onAuthorize(this, req, res,next);
        }
        if (isAllow) {
            var sender = new ControllerActionSender();
            sender.app=this.app;
            sender.request=req;
            sender.response=res;
            sender.settings=this.settings;
            sender.template=this.template;
            sender.url=this.url;
            sender.next=next;
            var ret= methodOfActions.method(sender);
            if (ret instanceof controllerView){
                ret.render()
            }
            return ret;
        } else {
            res.send(401, 'missing authorization');

        }
    }
    apply(){
        if(this.controller.actions===undefined){
            this.controller.actions.get=(sender,req,res)=>{

            }
        }
        var me=this;
        if(this.app.hostDir){
            if(this.settings.hostDir===null){
                this.settings.app.get("/" + this.app.hostDir + "/" + this.url, (req, res, next) => {
                    me.execMethod(me.controller.actions.get, req, res, next);

                });
                if (me.controller.actions.post !== undefined) {
                    this.settings.app.post("/" + this.app.hostDir + "/" + this.url, (req, res, next) => {
                        me.execMethod(me.controller.actions.post, req, res, next);
                    });
                }
            }
            else {
                this.settings.app.get("/" +this.settings.hostDir+"/" + this.app.hostDir + "/" + this.url, (req, res, next) => {
                    me.execMethod(me.controller.actions.get, req, res, next);

                });
                if (me.controller.actions.post !== undefined) {
                    this.settings.app.post("/" + this.settings.hostDir +"/" + this.app.hostDir + "/" + this.url, (req, res, next) => {
                        me.execMethod(me.controller.actions.post, req, res, next);
                    });
                }
            }
            
        }
        else{
            if (this.settings.hostDir === undefined) {
                this.settings.app.get("/"+this.url, (req, res) => {
                    me.execMethod(me.controller.actions.get, req, res, next);
                });
                if (me.controller.actions.post !== undefined) {
                    this.settings.app.post("/" + this.url, (req, res, next) => {
                        me.execMethod(me.controller.actions.post, req, res, next);
                    });
                }
            }
            else {
                this.settings.app.get("/" + this.settings.hostDir +"/" + this.url, (req, res) => {
                    me.execMethod(me.controller.actions.get, req, res, next);
                });
                if (me.controller.actions.post !== undefined) {
                    this.settings.app.post("/" + this.settings.hostDir +"/" + this.url, (req, res, next) => {
                        me.execMethod(me.controller.actions.post, req, res, next);
                    });
                }
            }
        }
       


    }

}
module.exports = ControllerWrapper
