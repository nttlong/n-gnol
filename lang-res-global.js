var cache={};
var AsyncLock = require('async-lock');
var sync=require("./sync");
var lock = new AsyncLock();
var _key="lang";
var fs=require("fs");
var path=require("path");
var settings=require("./settings");
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
function createFile(lang,cb){
    var resDir = path.sep.join(settings.workingDir, "resource");
    var resFile = path.join(resDir, lang + ".xml");
    lock.acquire(resFile, done => {
        try {
            
            if(!dirExists(resDir)){
                fs.mkdirSync(resDir)
            }
            
            if (!fileExists(resFile)){
                fs.writeFileSync(resFile, '<root></root>','utf8');

            }
            done();
        } catch (err) {
            done(err);
        }
    }, (e, r) => {
        cb(e,r);
    })
}
function syncFromFile(lang,key,value,cb){
    var resDir = path.sep.join(settings.workingDir, "resource");
    var resFile = path.join(resDir, lang + ".xml");
    lock.acquire(resFile,done=>{
       try {
           var data = fs.readFileSync(resFile, 'utf8');
           var json =JSON.parse(convert.xml2json(data, { compact: true}));
           if(!json.root){
               json.root={
                   item:[]
               }
           }
           if (json.root.item===undefined){
               json.root.item=[];
           }
           if(!(json.root.item instanceof Array)){
               json.root.item = [json.root.item];
           }    
           for(var i=0;i<json.root.item.length;i++){
               cache[lang][json.root.item[i]._attributes.key]=json.root.item[i]._text;
           }
           if (cache[lang][key]===undefined){
               json.root.item.push({
                   _attributes: {
                       key: key
                   },
                   _text: value
               });
               var xml = convert.json2xml(JSON.stringify(json), { compact: true,indentText:true });
               fs.writeFileSync(resFile, xml, 'utf8');
           }
           
           
           cache[lang][key]=value;
           done();
        } catch (e) {
            console.log('Error:', e.stack);
            done(e);
        }
    },(e,r)=>{
        cb(e,r);
    })
}
function getGlobalRes(lang,key,value){
    if(!value){
        value=key
    }
    key=key.toLowerCase();
    key=encodeURIComponent(escape(key));
    if(cache[lang]===undefined){
        var ret=sync.sync(createFile,[lang]);
        cache[lang]={};
    }
    if(cache[lang][key]===undefined){
        var ret=sync.sync(syncFromFile,[lang,key,value]);
    }
    return cache[lang][key];

}

module.exports={
    getGlobalRes: getGlobalRes
}