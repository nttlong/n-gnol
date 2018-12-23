
var _absUrl="";

function getServerInfo(sender){
    var ret={
        absUrl:""
    }
    var req = sender.request;
    if (sender.settings.hostDir) {
        ret.absUrl = req.protocol + "://" +req.get('host') + "/" + sender.settings.hostDir;
    }else {
        ret.absUrl = req.protocol + "://" + req.get('host');
    }
    if (sender.app.hostDir!==undefined){
        ret.appUrl = ret.absUrl + "/" + sender.app.hostDir;
    }
    else {
        ret.appUrl = ret.absUrl ;
    }
    ret.static = ret.appUrl+"/static"
    
    ret.JSON=JSON;
    
    return ret;
}
module.exports = getServerInfo