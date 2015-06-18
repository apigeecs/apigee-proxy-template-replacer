# API PROXY GENERATION FROM TEMPLATE

See use in ```app.js```.  There are ```proxy-replacer.js``` and ```proxy-generator.js``` libraries.  The replacer interacts
directly with the XML to replace the sections and variables.  Please see ```API PROXY TEMPLATE REPLACER``` below for more 
details.  The generator leverages the replacer and will write the finished template to an output folder (currently ```output```).

To use:

1. ```npm install```
2. ```node app.js```

View the output created in the```./output``` directory.  You can alter the template located in ```./proxy-templates```.

# API PROXY TEMPLATE REPLACER

This replacer will read a json file with named key value pairs and alter an Apigee Edge API Proxy that contains
template directives.  Based on directives(detailed below) in the bundle's XML files, the replacer will utilities will
remove and/or configure the API proxy.

For examples, please see the files located in ```./files``` directory and example usages of replacer utilities 
in ```app.js```.

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

 

