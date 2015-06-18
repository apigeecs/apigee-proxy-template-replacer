# Apigee Proxy Template Replacer

This template replacer will take a JSON config alongside an Apigee API proxy template, and create a final
API proxy with the config values replaced.

# Example

    var replacer = require("apigee-proxy-template-replacer");
    
    var template_dir = "./proxy_templates/oauth2";
    var answers_path = "./json_configs/answerExample.json";
    
    
    replacer.createProxy(template_dir,answers_path, function(err, data){
        if(err){
            console.log(err);
        }else{
            //data returned as zip file
            //save to disk or use for uploading to a server
        }
    });
    
# Detailed Documentation

There are two libraries, ```lib/proxy-replacer.js``` and ```lib/proxy-generator.js```.  The replacer interacts
directly with the XML to replace the sections and variables.  Please see ```API Proxy Template Replacer``` below for more 
details.  The generator leverages the replacer and will write the finished template to an output folder (currently ```output```).

The template directory provided should point to an Apigee API proxy like the example ```examples/proxy_templates/oauth2/```.

## API Proxy Template Replacer

This replacer will read a json file with named key value pairs and alter an Apigee Edge API Proxy that contains
template directives.  Based on directives(detailed below) in the bundle's XML files, the replacer will utilities will
remove and/or configure the API proxy.

For examples, please see the json config located in ```./examples/json_configs``` directory and example usage of the 
replacer utilities in ```./examples/app.js```.

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

 

