'use strict';

var replacer = {};

var VARIABLE_IDENTIFIER = "__";
var SECTION_START = "START";
var SECTION_END = "END";
var FOREACH = "FOREACH";


replacer.replaceTemplateValues = function (xml, answers){

    var answerDetails = flattenAnswers(answers);

    for(var k =0; k <answerDetails.length; k++){
        var parts = answerDetails[k].split("==");
        xml = replaceVariable(xml, parts[0], parts[1]);
    }

    var answersObj = JSON.parse(answers);
    for (var key in answersObj){
        if(answersObj[key].constructor === Array){
            xml = replaceForEach(xml, key, answersObj[key])
        }
    }

    return xml.replace(/<!--[\s\S]*?-->/g, "").replace(/^\s*[\r\n]/gm, "");

};

replacer.cleanTemplateXml = function(xml, answers){
    var templateDetails = getTemplateSections(xml);
    //console.log('template details: ',templateDetails);
    var answerDetails = flattenAnswers(answers);

    //for replacing sections, the array location is irrelevant in answers
    for (var i=0; i <answerDetails.length; i++){
        answerDetails[i] = answerDetails[i].replace(/\[.*\]/gm,"");
        //console.log(answerDetails[i]);
    }

    //TODO do this better to provide more options in START/END checks for removal
    for(var j=0; j< templateDetails.length; j++){

        if(answerDetails.indexOf(templateDetails[j]) === -1){
            xml = removeSection(xml,templateDetails[j]);
            //console.log('removing section: '+templateDetails[j]);
        }
    }

    return xml;
    //return xml.replace(/<!--[\s\S]*?-->/g, "").replace(/^\s*[\r\n]/gm, "");
};

/*
 * INTERNAL FUNCTIONS USED IN REPLACER DEFINED BELOW
 *
 *
 */

function removeSection(xml, section){

    var patternString = '<!--START\\s*' + section + '\\s*-->[\\s\\S]*<!--END\\s*' + section + '\\s*-->';
    var regex = new RegExp(patternString, "igm"); //needs to be case insensitive, global, multi line regex match
    //console.log(regex);
    xml = xml.replace(regex, "").replace(/^\s*[\r\n]/gm, ""); //replace the regex with nothing and remove empty lines from result
    return xml;
}



function replaceVariable(xml, section, value){

    var patternString = VARIABLE_IDENTIFIER+regexEscape(section)+VARIABLE_IDENTIFIER;
    var regex = new RegExp(patternString, "igm"); //needs to be case insensitive, global, multi line regex match
    return xml.replace(regex, value); //replace the regex with nothing and remove empty lines from result
}


function replaceForEach(xml, section, values){

    var forEachRegex = new RegExp('<!--FOREACH\\s*'+section+'\\s*-->([\\s\\S]*?)<!--FOREACH\\s*'+section+'\\s*-->');
    //console.log(forEachRegex);
    var matches = xml.match(forEachRegex);

    var results = [];
    if(matches !== null) {
        //console.log(matches);
        var itemXml = matches[1]; //only subgroup in the regex means it will index 1 of matches array
        //console.log(itemXml);
        for (var i = 0; i < values.length; i++) {
            if (values[i].constructor === Array) {
                var newItemXml = itemXml;
                for (var j = 0; j < values[i].length; j++) {
                    newItemXml = replaceVariable(newItemXml, 'item[' + j + ']', values[i][j])
                }
                newItemXml = newItemXml.replace(/^\s*[\r\n]/gm, ""); //strip newlines from current xml so we can put back cleanly
                //console.log(newItemXml);
                if(i===0){
                    newItemXml = newItemXml.trim(); //trim whitespace from first entry to maintain proper indentation
                }
                results.push(newItemXml);
            } else {
                results.push(replaceVariable(itemXml, 'item', values[i]))
            }
        }

        return xml.replace(forEachRegex, results.join("\n")).replace(/^\s*[\r\n]/gm, ""); //join with new line, then remove empty lines
    }

    return xml;
}


function flattenAnswers(answers){

    var obj = JSON.parse(answers);
    var answerDetails = [];
    for(var key in obj){
        if (obj[key].constructor === Array) {
            for (var i = 0; i < obj[key].length; i++) {
                if(obj[key][i].constructor === Array){
                    for(var j=0; j< obj[key][i].length; j++){
                        answerDetails.push(key + "[" + i +"]" + "[" + j + "]"+ "==" + obj[key][i][j]);
                    }
                }else{
                    //answerDetails.push(key + ":" + obj[key][i]);
                    answerDetails.push(key + "[" + i +"]" + "==" + obj[key][i]);
                }

            }
        } else {
            answerDetails.push(key + "==" + obj[key])
            //xml = replaceSection(xml, key, obj[key]);
        }

    }
    //console.log(answerDetails);
    return answerDetails;

}

function getTemplateSections(xml){

    var patternString = '<!--'+SECTION_START+'\\s*(.*)\\s*-->[\\s\\S]*?<!--'+SECTION_END+'\\s(.*)\\s*-->';
    var regex = new RegExp(patternString, "img");
    var finalMatches = [];

    var matches =  xml.match(regex);
    //console.log(matches);
    if(matches !== null) {
        //strip out the actual name:value from the bigger regex match

        for (var i = 0; i < matches.length; i++) {
            matches[i] = matches[i].trim();
            var sectionRegex = new RegExp('<!--' + SECTION_START + '\\s*(.*?)\\s*-->', 'i');
            finalMatches.push(matches[i].match(sectionRegex)[1]);
            //console.log("matches:" +matches[i]);
        }
    }

    //console.log(matches);
    return finalMatches; //strip full match
}

// http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
function regexEscape(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

module.exports = replacer;
