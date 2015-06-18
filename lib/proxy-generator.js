var REPLACER = require('./proxy-replacer.js');
var fs = require('node-fs');
var readDir = require('recursive-readdir');
var path = require("path");
var JSZip = require("jszip");

var generator = {};

generator.createProxy = function(template, answers, callback){
    var templateAbsolutePath = path.resolve(template);
    var answersAbsolutePath = path.resolve(answers);
    console.log("Template Location: "+ templateAbsolutePath);


    var answersData = null;
    templatePath = path.normalize(template);

    // support input from file or direct JSON string
    if(fs.existsSync(answers)){
        answersData = fs.readFileSync(answers, 'utf8');
        console.log("Answers Location: "+ answersAbsolutePath);
    }else{
        answersData = answers;
        console.log("Answers not provided as file.  Assuming direct JSON input.");
    }
    readDir(templatePath, function(err, files){
        if(err){
            console.log("error reading directory");
            callback(err);
        }else{
            // create a new zip archive
            var zip = new JSZip();

            // loop through all the template files and configure/build based on the answers
            for(var i=0; i<files.length; i++){
                var filename = path.basename(files[i]);
                var dirname = path.dirname(files[i].replace(templatePath, ""));
                var basedir = path.basename(dirname);
                // console.log("proxy dir: "+dirname, "base dir: "+basedir);
                var clean = REPLACER.cleanTemplateXml(fs.readFileSync(files[i], 'utf8'), answersData);
                var replaced = REPLACER.replaceTemplateValues(clean, answersData);

                // add the configured file to the zip archive
                var zipFilename = path.resolve(path.join(dirname,filename)).slice(1);
                zip.file(zipFilename, replaced);
            }

            var buffer = zip.generate({type:'nodebuffer',base64:false,compression:'DEFLATE'});
            callback(false, buffer);
        }
    });
};


module.exports = generator;