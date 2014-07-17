$(document).on("ready", function() {
// # # # # # # # # # # # # # # # # # # # # # #
var lexer = {
  "number": {
      "javascript": "[0-9]*\\.?[0-9]+",
      "python": "[0-9]*\\.?[0-9]+",
  },

  "operator": {
      "javascript": ["+","-","*","/","===", "!=", "==", "=", "<", ">"],
      "python": ["+","-","*","/","=","==", "!=", "<", ">"]
  },

  "syntax": {
      "javascript": ["[","]","{","}","(",")",";", ",", "."],
      "python": ["[","]","{","}","(",")",";", ",", "."]
  },

  "inlineComment": {
      "javascript": "\\\/\\\/",
      "python": "#"
  },

  "multiLineComment": {
      "javascript": "\\\/\\\*.*?\\\*\\\/",
      "python": "\\\"\\\"\\\".*?\\\"\\\"\\\""
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
      "javascript": "[a-zA-Z_$]+[a-zA-Z_$1-9]*",
      "python": ""
  }

}


function loadRegExpArray(arr) {
  arr = arr.map( function(elem) {
    return elem.replace(
      new RegExp("(\\"+"\\^${}[]().*+-?<>".split("").join("|\\")+")"),
      "\\$1");
  });
  return arr.join("|");
}


// # # # # # # # # # # # # # # # # # # # # # #


function markyInferLanguage(text) {
  // TODO: Should test each language and see which "matches" grammar best.
  // TODO: Alternative would be to count keyword instances, but dangerous.
  return "javascript";
}


function markyText(text, language) {


  //Convert tabs to 4 spaces for cross-browser display continuity.
  var formattedText = text.replace(/\t/g, "    ")


  //Apply each of the language token filters to add the appropriate classes.
  $.each(lexer, function(token, languageOptions){
    var regexContent = languageOptions[language];
    // Escape any characters in array inputs that need to be escaped.
    if (regexContent instanceof Array) {
      regexContent = loadRegExpArray(regexContent);
    }

    var operators = "";
    if (token!=="operator") {
      operators = loadRegExpArray( lexer["operator"][language] );
    }

    var numbers = "";
    if (token!=="number") {
      numbers = lexer["number"][language];
    }

    var pre = "(?:\\<\\s*?span.*?\>)?["+operators+numbers+"\\s]*?";
    var post = "["+operators+numbers+"\\s]*?(?:\\<\\/\\s*?span.*?\>)?";

    var regex = new RegExp(pre+"("+regexContent+")"+post);
    console.log(regex);

    var wrapperOpen = "<span class='marky-"+token+"'>";
    var wrapperClose = "</span>";

    formattedText = formattedText.replace(regex, wrapperOpen+"$1"+wrapperClose);

  });



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
