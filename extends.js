String.prototype.join=function(){
    var ret="";
    for(var i=0;i<arguments.length;i++){
        ret+=arguments[i]+this;
    }
    return ret.substring(0,ret.length-this.length);
}