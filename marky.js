$(document).on("ready", function() {
// # # # # # # # # # # # # # # # # # # # # # #
var lexer = {
  "multilineComment": {
      "javascript": "/\\*[.\\r\\n\\s\\S]*?\\*/",
      "python": "\"\"\"[.\\r\\n\\s\\S]*?\"\"\""
  },

  "inlineComment": {
      "javascript": "//[^\\n]*",
      "python": "#[^\\n]*"
  },

  "string": {
      "javascript": "\".*?\"|'.*?'",
      "python": "\".*?\"|'.*?'",
  },

  "operator": {
      "javascript": ["+","-","*","/","===", "!=", "==", "=", "<", ">",
                     "+=", "++", "--", "-=", "*=", ">=", "<=", "%", "%="],
      //Source: https://www.ics.uci.edu/~pattis/ICS-31/lectures/tokens.pdf
      "python": ["+", "-", "*", "/", "//", "%", "**", "==", "!=", "<", ">", "=",
                 "<=", ">=", "and", "not", "or", "&", "|", "~", "^", "<<", ">>"]
  },

  "syntax": {
      "javascript": ["[","]","{","}","(",")",";", ",", ".", ":"],
      "python": ["[","]","{","}","(",")",";", ",", ".", ":"]
  },

  "keyword": {
      //Source: http://stackoverflow.com/questions/1661197/valid-characters-for-javascript-variable-names
      "javascript": ["do", "if", "in", "for", "let", "new", "try",
                    "var", "case", "else", "enum", "eval", "false",
                    "null", "this", "true", "void", "with", "break",
                    "catch", "class", "const", "super", "throw", "while",
                    "yield", "delete", "export", "import", "public",
                    "return", "static", "switch", "typeof", "default",
                    "extends", "finally", "package", "private", "continue",
                    "debugger", "function", "arguments", "interface",
                    "protected", "implements", "instanceof"],
      //Source: http://stackoverflow.com/questions/14595922/list-of-python-keywords
      "python": ['as', 'assert', 'break', 'class', 'continue',
                 'def', 'del', 'elif', 'else', 'except', 'exec',
                 'finally', 'for', 'from', 'global', 'if', 'import',
                 'in', 'is', 'lambda', 'pass', 'print',
                 'raise', 'return', 'try', 'while', 'with', 'yield']
  },

  "bool": {
      "javascript": ["true", "false"],
      "python": ["True", "False"]
  },

  "identifier": {
      "javascript": "[a-zA-Z_$]+[a-zA-Z0-9_$]*",
      "python": "[a-zA-Z_$]+[a-zA-Z0-9_]*",
  },

  "number": {
      "javascript": "[0-9]*\\.?[0-9]+",
      "python": "[0-9]*\\.?[0-9]+"
  }
}


var precedence = {  // Earliest === Highest Precedence
  "default": [
      "multilineComment", "inlineComment",
      "string", "bool", "keyword",
      "operator", "identifier",
      "number", "syntax"
  ],
}

var borders = {
  "javascript": { },
  "python": { },
  "default": {
    "keyword":"(?:[^a-zA-Z]|^|$)",
    //"operator":"(?:[^a-zA-Z]|^|$)",
  }
}

var languages = ["javascript", "python"];


function loadRegExpArray(arr) {
  arr = arr.map( function(elem) {
    return elem.replace(
      new RegExp("(\\"+"\\^${}[]().*+-?<>/".split("").join("|\\")+")", "g"),
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

function filterMatches(matchObjs, language){

  //Keep only the larger of two options (regardless of precedence).
  for (var i=0; i<matchObjs.length; i++) {
    var thisDeleted = false;
    var match1 = matchObjs[i];
    if (match1===undefined) continue;

    for (var j=i+1; j<matchObjs.length; j++){
      var match2 = matchObjs[j];
      if (match2===undefined) continue;

      //If matches are the same size, defer to precedence.
      if (match1["end"]-match1["start"] == match2["end"]-match2["start"]) {
        continue;
      }

      if ((match1["start"]<=match2["start"]) && (match1["end"]>=match2["end"])){
        matchObjs[j] = undefined;
      } else if ((match2["start"]<=match1["start"]) && (match2["end"]>=match1["end"])){
      if (match2["text"].indexOf(":")>=0) console.log(match2["text"]);
        matchObjs[i] = undefined;
      }
    }
  }

  matchObjs = matchObjs.filter( function(entry) {
    return entry!==undefined;
  });

  //Sort so that higher-precedence tokens are at front.
  matchObjs.sort(function(a,b) {
    var precOrder = precedence[language];
    if (precOrder===undefined) precOrder = precedence["default"];
    var aPrec = precOrder.indexOf(a["token"])
    var bPrec = precOrder.indexOf(b["token"])
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


function measureMatchQuality(text, matches) {
  var totalChars = 0;
  for (var i=0; i<matches.length; i++) {
    var match = matches[i];
    if (match["token"]=="identifier") continue;
    var length = match["end"]-match["start"];
    totalChars += length;
  }
  return parseFloat(totalChars)/text.length;
}


// # # # # # # # # # # # # # # # # # # # # # #


function markyInferLanguage(text) {
  //TODO: test QUALITY instead of just QUANTITY.
  //TODO: IE: Get the amount of unmatched text.

  var languageMatches = [];
  for (var i=0; i<languages.length; i++) {
    var language = languages[i];
    var matches = markyGetMatches(text, language);

    var quality = measureMatchQuality(text, matches);

    languageMatches.push( {
      "quality":quality,
      "language":language
    });
  }

  languageMatches.sort( function(a,b) {
    return b["quality"]-a["quality"];
  });
  return languageMatches[0]["language"];
}


function markyGetMatches(text, language) {
  //Convert tabs to 4 spaces for cross-browser display continuity.
  var matchObjs = [];

  //Apply each of the language token filters to add the appropriate classes.
  $.each(lexer, function(token, languageOptions){
    var regexContent = languageOptions[language];
    // Escape any characters in array inputs that need to be escaped.
    if (regexContent instanceof Array) {
      regexContent = loadRegExpArray(regexContent);
    }


    // Borders indicate characters that can not be adjacent to a token.
    // Border Priority: language-specific, a cross-language default, then none.
    var border = borders[language][token];
    if (border===undefined) border = borders["default"][token];
    if (border===undefined) border = "";

    var pattern = new RegExp(border+"("+regexContent+")"+border, "gm");
    var matches = text.match(pattern);

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

        var remainingText = text.slice(minIndex)
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

  //Sort and filter the matches to avoid double-matching.
  return filterMatches(matchObjs, language)

}

function markyText(text, language) {
  //Convert tabs to 4 spaces for cross-browser display continuity.
  var formattedText = text.replace(/\t/g, "    ")

  var matches = markyGetMatches(formattedText, language);

  for (var i=0; i < matches.length; i++) {
    var match = matches[i];

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


function markySection($codeSection) {
  var text = $codeSection.text();

  // If the lang isn't given, attempt to infer what it should be.
  var lang = $codeSection.attr("language");
  lang = (lang===undefined) ? markyInferLanguage(text) : lang.toLowerCase();

  // Apply the marky formatting to the element.
  var formattedCode = markyText(text, lang);
  $codeSection.html(formattedCode);
  $codeSection.append("<div class='marky-language'>"+lang+"</div>");
}


function markyDocument() {
 $(".codeSection").each(function() {
   markySection($(this));
 });
}


markyDocument()

// # # # # # # # # # # # # # # # # # # # # # #
});
