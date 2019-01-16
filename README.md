"# n-gnol" 
How to start?
+++++++++++++++++++
var apps=require("n-gnol");
apps.settings.hostDir=null;
apps.settings.workingDir=__dirname;
try {
    apps.loadApps().listen(1000, function () {
        console.log("OK");
    })
} catch (error) {
    throw(error);
    console.log(error);
}
