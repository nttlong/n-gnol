var controllersCache={};
var controllerInstance={}
var ControllerWrapper=require("./controller-wrapper");
module.exports =function(){
    const express = require('express');
    const epApp = express();
    var Info=require("./app-process-info").Info;
    var settings=require("./settings");
    
    var fs=require("fs");
    var path=require("path");
    var appsDir=path.sep.join(settings.workingDir,"apps");
    var dirs=fs.readdirSync(appsDir);
    for(var i=0;i<dirs.length;i++){
        var appDir = path.sep.join(appsDir, dirs[i]);
        var appSettingPath=path.sep.join(appDir,"settings.js");
        var appSettings={
            hostDir: dirs[i],
            appDir:appDir,
            staticDir:"static"
        };
        var appName=dirs[i];
        var appSets = require(appSettingPath);
        if(appSets.hostDir===undefined){
            throw(new Error(`"hostDir" was not found in ${appSettingPath}`));
        }
        if (appSets.staticDir === undefined) {
            throw (new Error(`"staticDir" was not found in ${appSettingPath}`));
        }
        if (appSets.viewsDir === undefined) {
            throw (new Error(`"viewsDir" was not found in ${appSettingPath}`));
        }
        if (appSets.authenticate === undefined) {
            throw (new Error(`"authenticate" was not found in ${appSettingPath}`));
        }
        if (appSets.middleWare === undefined) {
            throw (new Error(`"middleWare" was not found in ${appSettingPath}`));
        }
        
        Object.keys(appSets).forEach(key => {
            appSettings[key] = appSets[key];
        });
        if (appSettings.staticDir == null) {
            appSettings.staticDir = "static";
        } 
        var AppStaticDir = path.sep.join(appDir, appSettings.staticDir);
        if(settings.hostDir!=null){
            if (appSettings.hostDir!=null) {
                epApp.use("/" + settings.hostDir+"/" + appSettings.hostDir + '/static', express.static(AppStaticDir));
            }
            else {
                epApp.use("/" + settings.hostDir +'/static', express.static(AppStaticDir));
            }
        }
        else {
            if (appSettings.hostDir!=null) {
                epApp.use("/" + appSettings.hostDir + '/static', express.static(AppStaticDir));
            }
            else {
                epApp.use('/static', express.static(AppStaticDir));
            }
        }
        
      
        epApp.use("/" + appSettings.hostDir + '/static', express.static(AppStaticDir));
        var stat = fs.statSync(appDir);
        if (stat.isDirectory()){
            var controllerDir = path.sep.join(appDir,"controllers");
            var controllerDirSubDirs=fs.readdirSync(controllerDir);
            for(var j=0;j<controllerDirSubDirs.length;j++){
                var controllerFile = path.join(controllerDir, controllerDirSubDirs[j]);
                
                controllersCache[controllerFile] = require(controllerFile);
                var config = controllersCache[controllerFile];
                if (appSettings.hostDir===undefined){
                    throw (new Error(`"hostDir" was not found in "${appDir}.settings.js"`))
                }
                var controllerConfig={
                    fileName:controllerFile,
                    url:config.url,
                    template:config.template,
                    app:{
                        hostDir: (appSettings.hostDir == null) ? undefined : appSettings.hostDir,
                        fullPath:appSettings.appDir,
                        name:appName,
                        template: (appSettings.viewsDir == null) ? "views" : appSettings.viewsDir,
                        authenticate:appSettings.authenticate,
                        middleWare:appSettings.middleWare
                    },
                    controllersCache: controllersCache,
                    settings:{
                        app:epApp
                    }

                }
                Object.keys(settings).forEach(k=>{
                    controllerConfig.settings[k]=settings[k];
                })
                Object.keys(appSettings).forEach(k=>{
                    controllerConfig.app[k]=appSettings[k];
                })
                // var sender={
                //     app:appSettings,
                //     settings:settings
                // }
                controllerInstance[controllerFile] = new ControllerWrapper(controllerConfig,epApp);
                
                
                

            }
        }
            
        
    }
    
   

    console.log(settings.workingDir);
    return epApp;
}