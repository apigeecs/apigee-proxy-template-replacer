var path = require("path");
var fs = require('node-fs');
var rimraf = require('rimraf');
var replacer = require("apigee-proxy-template-replacer");

var template_dir = "./proxy_templates/oauth2";
var answers_path = "./json_configs/answerExample.json";
var output_dir = "./output";

console.log("Begin proxy generation from template...");

replacer.createProxy(template_dir,answers_path, function(err, data){
    if(err){
        console.log(err);
    }else{
        var outputDirectory = path.normalize(path.join(__dirname,output_dir));
        createOutputDirectory(outputDirectory);
        var zipFileAbsolute = path.normalize(path.join(outputDirectory,"/apiproxy_"+new Date().getTime()+".zip"));
        console.log("Writing zip file: "+zipFileAbsolute);
        fs.writeFileSync(zipFileAbsolute, data, 'binary');
        console.log("New API Proxy located at: "+zipFileAbsolute);
    }
    process.exit();
});

function createOutputDirectory(name){

    if (!fs.existsSync(name)) {
        fs.mkdirSync(name, 0777,true);
    }else{
        // rimraf is module to do recursive directory deletes.
        // only doing this for the example so we don't stack zip files
        rimraf.sync(name);
        fs.mkdirSync(name, 0777,true);
    }
}
