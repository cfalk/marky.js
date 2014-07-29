$(document).on("ready", function() {
// # # # # # # # # # # # # # # # # # # # # # #
var lexer = {
  "multilineComment": {
      "javascript": "/\\*[.\\r\\n\\s\\S]*?\\*/",
      "python": "\"\"\".*?\"\"\""
  },

  "inlineComment": {
      "javascript": "//[^\\n]*",
      "python": "#"
  },

  "string": {
      "javascript": "\".*?\"|'.*?'",
      "python": "",
  },

  "operator": {
      "javascript": ["+","-","*","/","===", "!=", "==", "=", "<", ">",
                     "+=", "++", "--", "-=", "*=", ">=", "<=" ],
      "python": ["+","-","*","/","=","==", "!=", "<", ">"]
  },

  "syntax": {
      "javascript": ["[","]","{","}","(",")",";", ",", ".", ":"],
      "python": ["[","]","{","}","(",")",";", ",", "."]
  },

  "keyword": {
      //JavaScript Rule from: http://stackoverflow.com/questions/1661197/valid-characters-for-javascript-variable-names
      "javascript": ["do", "if", "in", "for", "let", "new", "try",
                    "var", "case", "else", "enum", "eval", "false",
                    "null", "this", "true", "void", "with", "break",
                    "catch", "class", "const", "super", "throw", "while",
                    "yield", "delete", "export", "import", "public",
                    "return", "static", "switch", "typeof", "default",
                    "extends", "finally", "package", "private", "continue",
                    "debugger", "function", "arguments", "interface",
                    "protected", "implements", "instanceof"],
      "python": []
  },

  "bool": {
      "javascript": ["true", "false"],
      "python": ["True", "False"]
  },

  "identifier": {
      "javascript": "[a-zA-Z_$]+[a-zA-Z0-9_$]*",
      "python": ""
  },

  "number": {
      "javascript": "[0-9]*\\.?[0-9]+",
      "python": "[0-9]*\\.?[0-9]+",
  },


}


var precedence = {  // Earliest === Highest Precedence
  "javascript": [
      "multilineComment", "inlineComment",
      "string", "bool", "keyword",
      "identifier", "number",
      "syntax", "operator",
  ],
  "python": [],
}


function loadRegExpArray(arr) {
  arr = arr.map( function(elem) {
    return elem.replace(
      new RegExp("(\\"+"\\^${}[]().*+-?<>/".split("").join("|\\")+")"),
      "\\$1");
  });
  return arr.join("|");
}


function sparseArrayEmpty(arr, min, max) {
  for (var i=min; i<max; i++) {
    if (arr[i]!==undefined) return false ;
  }
  return true;
}


// # # # # # # # # # # # # # # # # # # # # # #


function markyInferLanguage(text) {
  // TODO: Should test each language and see which "matches" keywords best.
  return "javascript";
}


function markyText(text, language) {

  //Convert tabs to 4 spaces for cross-browser display continuity.
  var formattedText = text.replace(/\t/g, "    ")
  var matchObjs = [];

  //Apply each of the language token filters to add the appropriate classes.
  $.each(lexer, function(token, languageOptions){
    var regexContent = languageOptions[language];
    // Escape any characters in array inputs that need to be escaped.
    if (regexContent instanceof Array) {
      regexContent = loadRegExpArray(regexContent);
    }

    var pattern = new RegExp("("+regexContent+")", "gm");
    var matches = formattedText.match(pattern);
    console.log(pattern);

    var minIndex = 0;
    var instance = {}
    if (matches!==null){
      for (var i=0; i < matches.length; i++) {
        var match = matches[i];

        //Get the number of specific matches that have passed so far.
        var instanceN = 1;
        if (instance[match]===undefined) {
          instance[match] = instanceN;
        } else {
          instance[match]++;
          var instanceN = instance[match];
        }

        var remainingText = formattedText.slice(minIndex)
        var startIndex = remainingText.indexOf(match) + minIndex
        var endIndex = startIndex + match.length;
        minIndex = endIndex;

        var matchObj = {
          "start":startIndex,
          "end":endIndex,
          "text":match,
          "token":token,
        };

        matchObjs.push(matchObj);
      }
    }
  });


  function filterMatches(matchObjs, language){
    //Sort so that higher-precedence tokens are at front.
    matchObjs.sort(function(a,b) {
      var aPrec = precedence[language].indexOf(a["token"])
      var bPrec = precedence[language].indexOf(b["token"])
      return aPrec-bPrec;
    });

    //Filter out the unneeded matches.
    var alreadyUsed = {};
    var usedTokens = [];
    for (var i=0; i < matchObjs.length; i++) {
      var matchObj = matchObjs[i];
      var start = matchObj["start"]
      var end = matchObj["end"]
      if (sparseArrayEmpty(alreadyUsed, start, end)){
        for (var j=start; j<end; j++) alreadyUsed[j] = true;
        usedTokens.push( matchObj );
      } else {
        continue;
      }
    }

    //Now sort from greatest to least end index.
    usedTokens.sort( function(a,b){
      return b["end"]-a["end"];
    });

    return usedTokens;
  };

  //Sort and filter the matches to avoid double-matching.
  filteredObjs = filterMatches(matchObjs, language)

  for (var i=0; i < filteredObjs.length; i++) {
    var match = filteredObjs[i];

    var wrapperOpen = "<span class='marky-"+match["token"]+"'>";
    var wrapperClose = "</span>";

    var textParts = match["text"].split("\n").filter( function(entry) {
      return entry.length;
    });

    var offset = match["end"];
    for (var j=textParts.length-1; j>=0; j--) {
      var text = textParts[j];
      var end = offset;
      var start = end - text.length;
      offset -= text.length;

      var keepNewline = (textParts.length>1)
      if (keepNewline!=="") offset--;

      var wrappedText = wrapperOpen + text + wrapperClose;
      formattedText = formattedText.slice(0, start) +
                      wrappedText +
                      formattedText.slice(end, formattedText.length);
    }
  }


  //Format the text in lines for the HTML container.
  var rawLines =  formattedText.replace(/^\n*/,"").replace(/\n*$/,"").split("\n");
  var lines ="<div class='lineContainer'>"
  var cleanLines = 0;
  for (var i=0; i<rawLines.length; i++){
    lines += "<div class='rawCodeLine'>" +
                     "<span class='lineContent'>" +
                     rawLines[i] +
                     "</span>" +
                     "</div>";
    cleanLines++;
  }
  lines += "</div>";

  //And apply an equal number of .lineNumber elements.
  var lineNumbers = "<div class='lineNumberContainer'>";
  for (var i=0; i<cleanLines; i++){
    lineNumbers += "<div class='lineNumber unselectable'>" +
                   String(i+1) +
                   "</div>";
  }
  lineNumbers += "</div>";


  return lineNumbers + lines;
}


function markySection(codeSection) {
  var text = $(codeSection).text();

  // If the language isn't given, attempt to infer what it should be.
  var language = $(codeSection).attr("language");
  if (language === undefined) language = markyInferLanguage(text)

  // Apply the marky formatting to the element.
  var formattedCode = markyText(text, language);
  $(codeSection).html(formattedCode);
}


function markyDocument() {
 $(".codeSection").each(function() {
   markySection($(this));
 });
}


markyDocument()

// # # # # # # # # # # # # # # # # # # # # # #
});
