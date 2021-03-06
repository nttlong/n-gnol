var controllersCache = {};
var controllerInstance = {}
var ControllerWrapper = require("./controller-wrapper");
module.exports = function () {
    const express = require('express');
    const epApp = express();
    var Info = require("./app-process-info").Info;
    var settings = require("./settings");

    var fs = require("fs");
    var path = require("path");
    var appsDir = path.sep.join(settings.workingDir, "apps");
    var dirs = fs.readdirSync(appsDir);
    for (var i = 0; i < dirs.length; i++) {
        var appDir = path.sep.join(appsDir, dirs[i]);
        var appSettingPath = path.sep.join(appDir, "settings.js");
        var appSettings = {
            hostDir: dirs[i],
            appDir: appDir,
            staticDir: "static"
        };
        var appName = dirs[i];
        var appSets = require(appSettingPath);
        if (appSets.hostDir === undefined) {
            throw (new Error(`"hostDir" was not found in ${appSettingPath}`));
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
        if(appSets.authenticate.length<4){
            throw (new Error(`"authenticate" in ${appSettingPath} must have 4 params and return true or false`));
        }
        if (appSets.middleWare === undefined) {
            throw (new Error(`"middleWare" was not found in ${appSettingPath}`));
        }

        Object.keys(appSets).forEach(key => {
            appSettings[key] = appSets[key];
        });
        if (appSettings.staticDir === null) {
            appSettings.staticDir = "static";
        }
        if (appSettings.hostDir == null) {
            appSettings.hostDir = dirs[i];
        }
        else if (appSettings.hostDir === "") {
            appSettings.hostDir = null;
        }
        var AppStaticDir = path.sep.join(appDir, appSettings.staticDir);
        if (settings.hostDir != null) {
            if (appSettings.hostDir != null) {
                epApp.use("/" + settings.hostDir + "/" + appSettings.hostDir + '/static', express.static(AppStaticDir));
            }
            else {
                epApp.use("/" + settings.hostDir + '/static', express.static(AppStaticDir));
            }
        }
        else {
            if (appSettings.hostDir != null) {
                epApp.use("/" + appSettings.hostDir + '/static', express.static(AppStaticDir));
            }
            else {
                epApp.use('/static', express.static(AppStaticDir));
            }
        }


        epApp.use("/" + appSettings.hostDir + '/static', express.static(AppStaticDir));
        var stat = fs.statSync(appDir);
        if (stat.isDirectory()) {
            var controllerDir = path.sep.join(appDir, "controllers");
            var controllerDirSubDirs = fs.readdirSync(controllerDir);
            if(controllerDirSubDirs.length==0){
                throw(new Error(`${controllerDir} can not be empty`));
            }
            for (var j = 0; j < controllerDirSubDirs.length; j++) {
                var controllerFile = path.join(controllerDir, controllerDirSubDirs[j]);

                controllersCache[controllerFile] = require(controllerFile);
                var config = controllersCache[controllerFile];
                if((config.url===undefined)||(typeof config.url!="string")){
                    throw (new Error(`url was not found or incorrect type in "${controllerFile}"`))
                }
                if((config.template===undefined)||(typeof config.template!="string")){
                    throw (new Error(`template was not found or incorrect type in "${controllerFile}"`))
                }
                if((config.actions===undefined)||(typeof config.actions!="object")){
                    throw (new Error(`actions was not found or incorrect type in "${controllerFile}"`))
                }

                if (appSettings.hostDir === undefined) {
                    throw (new Error(`"hostDir" was not found in "${appDir}.settings.js"`))
                }
                var controllerConfig = {
                    fileName: controllerFile,
                    url: config.url,
                    template: config.template,
                    app: {
                        hostDir: (appSettings.hostDir == null) ? undefined : appSettings.hostDir,
                        fullPath: appSettings.appDir,
                        name: appName,
                        template: (appSettings.viewsDir == null) ? "views" : appSettings.viewsDir,
                        authenticate: appSettings.authenticate,
                        middleWare: appSettings.middleWare
                    },
                    controllersCache: controllersCache,
                    settings: {
                        app: epApp
                    }

                }
                Object.keys(settings).forEach(k => {
                    controllerConfig.settings[k] = settings[k];
                })
                Object.keys(appSettings).forEach(k => {
                    controllerConfig.app[k] = appSettings[k];
                })
                // var sender={
                //     app:appSettings,
                //     settings:settings
                // }
                controllerInstance[controllerFile] = new ControllerWrapper(controllerConfig, epApp);




            }
        }


    }



    console.log(settings.workingDir);
    return epApp;
}
