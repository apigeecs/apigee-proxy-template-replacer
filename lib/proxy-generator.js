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
            var usedPolices = [];

            for(var i=0; i<files.length; i++) {

                if(files[i].indexOf("apiproxy/proxies/") !== -1 || files[i].indexOf("apiproxy/targets/") !== -1){

                    var matchedPolicies = getUsedPolicyNames(fs.readFileSync(files[i], 'utf8'));
                    if(matchedPolicies !== null){
                        usedPolices = usedPolices.concat(matchedPolicies);
                    }
                }
            }
            var usedPoliciesUniq = removeDuplicates(usedPolices);

            // loop through all the template json_configs and configure/build based on the answers
            for(var i=0; i<files.length; i++){
                var filename = path.basename(files[i]);
                var dirname = path.dirname(files[i].replace(templatePath, ""));
                var clean = REPLACER.cleanTemplateXml(fs.readFileSync(files[i], 'utf8'), answersData);
                var replaced = REPLACER.replaceTemplateValues(clean, answersData);

                // add the configured file to the zip archive
                var zipFilename = path.resolve(path.join(dirname,filename)).slice(1);
                if ( zipFilename.indexOf("apiproxy/policies/") !== -1 &&
                    usedPoliciesUniq.indexOf(getPolicyName(replaced)) === -1){

                    //do nothing if it's a policy and not used
                }else{
                    zip.file(zipFilename, replaced);
                }

            }

            var buffer = zip.generate({type:'nodebuffer',base64:false,compression:'DEFLATE'});
            callback(false, buffer);
        }
    });
};

function getUsedPolicyNames(xml){

    var patternString = '<\\s*Name\\s*>(.*)<\/\\s*Name\\s*>';
    var regex = new RegExp(patternString, "g");

    var matches = [];
    var match;

    while (match = regex.exec(xml)){
        matches.push(match[1]);
    }


    return matches;
}

function getPolicyName(xml){

    var patternString = 'name="(.*)"';
    var regex = new RegExp(patternString);
    var matches = xml.match(regex);

    return matches[1];
}

function removeDuplicates(array){

    var tmp =[];
    array = array.sort();
    for (var i=0; i<array.length;i++){
        if (tmp.indexOf(array[i]) === -1){
            tmp.push(array[i]);
        }
    }

    return tmp;

}

module.exports = generator;
