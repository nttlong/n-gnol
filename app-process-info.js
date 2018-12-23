class Info{
    constructor(req,res,settings,appSettings){
        this.settings=settings;
        this.app=appSettings;
        this.request=req;
        this.response=res;
    }
}
module.exports={
    Info:Info
}