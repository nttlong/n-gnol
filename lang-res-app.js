var cache = {};
var AsyncLock = require('async-lock');
var sync = require("./sync");
var lock = new AsyncLock();
var _key = "lang";
var fs = require("fs");
var path = require("path");
var settings = require("./settings");
var convert = require('xml-js');
function fileExists(p) {
    try {
        return fs.statSync(p).isFile();
    }
    catch (e) {

        if (e.code == 'ENOENT') { // no such file or directory. File really does not exist
            console.log("File does not exist.");
            return false;
        }

        console.log("Exception fs.statSync (" + p + "): " + e);
        throw e; // something else went wrong, we don't have rights, ...
    }
}
function dirExists(p) {
    try {
        return fs.statSync(p).isDirectory();
    }
    catch (e) {

        if (e.code == 'ENOENT') { // no such file or directory. File really does not exist
            console.log("File does not exist.");
            return false;
        }

        console.log("Exception fs.statSync (" + p + "): " + e);
        throw e; // something else went wrong, we don't have rights, ...
    }
}
function createAppLang(pathToApp,lang,cb){
    var pathToAppRes=path.sep.join(pathToApp,"resource");
    var pathToAppResLang = path.sep.join(pathToAppRes,lang+".xml");
    lock.acquire(pathToAppResLang,done=>{
        try {
            if (!dirExists(pathToAppRes)) {
                fs.mkdirSync(pathToAppRes);
            }
            if (!fileExists(pathToAppResLang)) {
                fs.writeFileSync(pathToAppResLang, "<root></root>", "utf8");
            }
            done();
        } catch (error) {
            done(error);
        }
    },(e,r)=>{
        cb(e,r);
    })

}
function createAppResLang(pathToApp, lang,app,key,value, cb){
    var pathToAppRes = path.sep.join(pathToApp, "resource");
    var pathToAppResLang = path.sep.join(pathToAppRes, lang + ".xml");
    lock.acquire(pathToAppResLang,done=>{
        try {
            var data = fs.readFileSync(pathToAppResLang, "utf8");
            var json = JSON.parse(convert.xml2json(data, { compact: true }));
            if(!json.root){
                json.root={
                    item:[]
                }
            }
            if (!json.root.item) {
                json.root.item = [];
            }
            if (!(json.root.item instanceof Array)) {
                json.root.item = [json.root.item];
            }
            for (var i = 0; i < json.root.item.length; i++) {
                var item = json.root.item[i];
                cache[lang][app][item._attributes.key] = item._text;
            }
            if (!cache[lang][app][key]) {
                json.root.item.push({
                    _attributes: {
                        key: key
                    },
                    _text: value
                });
                fs.writeFileSync(pathToAppResLang, convert.json2xml(JSON.stringify(json),{compact:true}), "utf8");
                cache[lang][app][key] = value;
            }
            done();
        } catch (error) {
            done(error);
        }
        
    },(e,r)=>{
        cb(e,r);
    })
}
function getAppRes(pathToApp, lang,app,key,value){
    if(!value){
        value=key;
    }
    key=key.toLowerCase();
    key=encodeURIComponent(escape(key));
    if(!cache[lang]){
        cache[lang]={};
    }
    if(!cache[lang][app]){
        sync.sync(createAppLang, [pathToApp, lang]);
        cache[lang][app]={};
    }
    if (!cache[lang][app][key]){
        sync.sync(createAppResLang, [pathToApp, lang,app,key,value]);
    }
    return cache[lang][app][key];
}

module.exports=getAppRes