# Apigee Proxy Template Replacer

This template replacer will take a JSON config alongside an Apigee API proxy template, and create a final
API proxy with the config values replaced.

# Example


    var path = require("path");
    var fs = require('node-fs');
    var rimraf = require('rimraf');

    var GENERATOR = require("./lib/proxy-generator.js");
    var TEMPLATE_DIR = "./proxy_templates/oauth2";
    var ANSWERS_PATH = "./files/answerExample.json";
    var OUTPUT_DIR = "./output";

    console.log("Begin proxy generation from template...");

    GENERATOR.createProxy(TEMPLATE_DIR,ANSWERS_PATH, function(err, data){
        if(err){
            console.log(err);
        }else{
            var outputDirectory = path.normalize(path.join(__dirname,OUTPUT_DIR));
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



See use in ```index.js```.  There are ```proxy-replacer.js``` and ```proxy-generator.js``` libraries.  The replacer interacts
directly with the XML to replace the sections and variables.  Please see ```API PROXY TEMPLATE REPLACER``` below for more 
details.  The generator leverages the replacer and will write the finished template to an output folder (currently ```output```).

To use:

1. ```npm install```
2. ```node index.js```

View the output created in the```./output``` directory.  You can alter the template located in ```./proxy-templates```.

# API PROXY TEMPLATE REPLACER

This replacer will read a json file with named key value pairs and alter an Apigee Edge API Proxy that contains
template directives.  Based on directives(detailed below) in the bundle's XML files, the replacer will utilities will
remove and/or configure the API proxy.

For examples, please see the files located in ```./files``` directory and example usages of replacer utilities 
in ```index.js```.

## Remove complete sections from XML

        <!--START grantTypes==pw -->
        <Flow name="Accesstoken-PW">
            <Description>Password Grant</Description>
        </Flow>
        <!--END grantTypes==pw -->
        
If the answers json does not have a key named ```grantTypes``` with value of ```"pw"``` or ```["pw"]```, this section will get removed 
when calling the with the ```cleanTemplateXml(xml, answersJson)``` method.

## Replace variables located in XML

    <ProxyEndpoint>
        <Description>__apiDescription__</Description>
    </ProxyEndpoint>
    
Currently variable identifiers for the replacer are ```__```, a double underscore.  Use the following method
 to replace any variables: ```replaceTemplateValues(cleanedXml,answersJson)```.  This results in:
 
    <ProxyEndpoint>
        <Description>My Description that was replaced.</Description>
    </ProxyEndpoint>
 

## Replace snippets of XML in a loop
 
If you have an answer which contains an array (single of multidimensional), you can use the following syntax in your 
template:
    
    <Attributes>
        <!--FOREACH ccTokenAttributes -->
        <Attribute name="__item[0]__" ref="__item[1]__">__item[2]__</Attribute>
        <!--FOREACH ccTokenAttributes -->
    </Attributes>
    
The above means to replace the ```item[i]``` values in the XML snippet for each of the values in the ```ccTokenAttributes```
answer field.  In this case,  ```ccTokenAttributes``` is a multi-dimensional array.

# TODO

1. Provide documentation inline with the proxy template, explaining each of the template functions.
2. Build a couple example templates and answer configuration JSON files.
3. Revamp the remove section logic to parse template and answers better for doing nested array check on existance,
containment, equality, etc.

 

