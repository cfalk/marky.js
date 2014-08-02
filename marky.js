$(document).on("ready", function() {
// # # # # # # # # # # # # # # # # # # # # # #
var any = "[.\\r\\n\\s\\S]";
var lexer = {
  "multilineComment": {
      "javascript": "/\\*"+any+"*?\\*/",
      "python": "\"\"\""+any+"*?\"\"\"",
      "ruby":"__END__"+any+"*|\\=begin"+any+"*?\\=end",
      "html":"\\<!--"+any+"*--\\>"
  },

  "inlineComment": {
      "javascript": "//[^\\n]*",
      "python": "#[^\\n]*",
      "ruby": "#[^\\n]*",
  },

  "string": {
      "javascript": "\".*?\"|'.*?'|/.*?/",
      "python": "\".*?\"|'.*?'",
      "ruby": "\".*?\"|'.*?'",
  },

  "operator": {
      "javascript": ["+","-","*","/","===", "!=", "==", "=", "<", ">",
                     "+=", "++", "--", "-=", "*=", ">=", "<=", "%", "%="],
      //Source: https://www.ics.uci.edu/~pattis/ICS-31/lectures/tokens.pdf
      "python": ["+", "-", "*", "/", "//", "%", "**", "==", "!=", "<", ">", "=",
                 "<=", ">=", "and", "not", "or", "&", "|", "~", "^", "<<", ">>"],
      "ruby": ["+", "-", "*", "/", "//", "%", "**", "===", "!=", "<=>", ">", "=",
               "<", "==", "equal?","!", "?:", "..", "...", "defined?",
               "<=", ">=", "and", "not", "or", "&", "|", "~", "^", "<<", ">>"]
  },

  "syntax": {
      "javascript": ["[","]","{","}","(",")",";", ",", ".", ":"],
      "python": ["[","]","{","}","(",")",";", ",", ".", ":"],
      "ruby": ["[","]","{","}","(",")",";", ",", ".", ":"],
      "html": ["<",">"]
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
                 'raise', 'return', 'try', 'while', 'with', 'yield'],

      "ruby": ["BEGIN", "END", "alias", "begin", "break", "case", "class",
               "def", "do", "else", "elsif", "end", "ensure", "for", "if", "in",
               "module", "next", "nil", "puts", "print", "redo", "rescue",
               "retry", "return", "self", "super", "then", "undef", "unless",
               "until", "when", "while", "yield", "__FILE__", "__LINE__"],
      "html": ["a", "abbrev", "acronym", "address", "applet", "area", "au",
                "author", "b", "banner", "base", "basefont", "bgsound", "big",
                "blink", "blockquote", "bq", "body", "br", "caption", "center",
                "cite", "code", "col", "colgroup", "credit", "del", "dfn", "dir",
                "div", "dl", "dt", "dd", "em", "embed", "fig", "fn", "font", "form",
                "frame", "frameset", "h1", "h2", "h3", "h4", "h5", "h6", "head",
                "hr", "html", "i", "iframe", "img", "input", "ins", "isindex",
                "kbd", "lang", "lh", "li", "link", "listing", "map", "marquee",
                "math", "menu", "meta", "multicol", "nobr", "noframes", "note",
                "ol", "overlay", "p", "param", "person", "plaintext", "pre", "q",
                "range", "samp", "script", "select", "small", "spacer", "spot",
                "strike", "strong", "sub", "sup", "tab", "table", "tbody", "td",
                "textarea", "textflow", "tfoot", "th", "thead", "title", "tr",
                "tt", "u", "ul", "var", "wbr", "xmp"]
  },

  "bool": {
      "javascript": ["true", "false"],
      "python": ["True", "False"],
      "ruby": ["true", "false"]
  },

  "identifier": {
      "javascript": "[a-zA-Z_$]+[a-zA-Z0-9_$]*",
      "python": "[a-zA-Z_$]+[a-zA-Z0-9_]*",
      "ruby": "($|@?@?)[a-zA-Z_]+[a-zA-Z0-9_]*"
  },

  "number": {
      "javascript": "[0-9]*\\.?[0-9]+",
      "python": "[0-9]*\\.?[0-9]+",
      "ruby": "[0-9]+\\.?[0-9]*",
  }
}


var precedence = {  // Earliest === Highest Precedence
  "default": [
      "multilineComment", "inlineComment",
      "string", "bool", "operator",
      "keyword", "identifier",
      "number", "syntax"
  ],
}

var borders = {
  //"javascript": { ... }, //Example
  "html": {
    //"keyword":"(?:\<\s*\/?\s*)" //TODO
  },
  "default": {
    "keyword":"(?:[^a-zA-Z]|^|$)",
    "inlineComment":"(?:[^\"']|^|$)",
  }
}

var languages = ["javascript", "python", "ruby", "html"];


function loadRegExpArray(arr) {
  //Prepare escape characters for the RegEx.
  var escapeTokens = "\\"+"^${}[]().*+-?<>/|".split("").join("|\\");
  var escapeRegex = new RegExp("("+escapeTokens+")", "g");

  //Sort the tokens by largest to smallest, so that the RegEx will grab
  //  larger tokens first.
  arr.sort(function(a,b) {
    return b.length - a.length;
  })

  //Escape any characters that should be escaped.
  arr = arr.map( function(elem) {
    return elem.replace(escapeRegex, "\\$1");
  });

  //Join the tokens with "|" (or) conditions.
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
    if (match1["end"]-match1["start"]===0) {
      matchObjs[i]=undefined;
      continue;
    }

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
    if (regexContent !== undefined) {
      // Escape any characters in array inputs that need to be escaped.
      if (regexContent instanceof Array) {
        regexContent = loadRegExpArray(regexContent);
      }


      // Borders indicate characters that can not be adjacent to a token.
      // Border Priority: language-specific, a cross-language default, then none.
      var border = borders[language];
      if (border===undefined) border = borders["default"];
      border = border[token]
      if (border===undefined) border = "";

      var pattern = new RegExp(border+"("+regexContent+")"+border, "gm");

      var match;
      while (match=pattern.exec(text)) {
        var matchedText = match[1];
        var regexStart = match["index"];
        var start = text.slice(regexStart).indexOf(matchedText)+regexStart;
        var matchObj = {
          "start":start,
          "end":start+matchedText.length,
          "text":matchedText,
          "token":token,
          "escape":language==="html"
        };
        matchObjs.push(matchObj);
      }
    }
  });

  //Sort and filter the matches to avoid double-matching.
  var matchObjs = filterMatches(matchObjs, language)
  return matchObjs;
}

function escapeHTML(string) {
  var pre = document.createElement("pre");
  var text = document.createTextNode(string);
  pre.appendChild(text);
  return pre.innerHTML;
}

function applyMarkyWrapper(match, text) {
  var wrapperOpen = "<span class='marky-"+match["token"]+"'>";
  var wrapperClose = "</span>";

  var textParts = match["text"].split("\n");

  var newText = "";
  for (var i=0; i<textParts.length; i++) {
    var content = textParts[i];
    if (match["escape"]===true) content = escapeHTML(textParts[i]);

    var newLine = (textParts.length-1>i) ? "_!SPACER!_" : "";
    newText += wrapperOpen + content + wrapperClose + newLine
  }

  return text.slice(0, match["start"]) +
                    newText.replace(/_!SPACER!_/g,"\n") +
                    text.slice(match["end"], text.length);
}

function buildMarkyCodeSection(lines) {
  var lineContent ="<div class='lineContainer'>"
  var lineNumbers = "<div class='lineNumberContainer unselectable'>";

  for (var i=0; i<lines.length; i++){
    var line = lines[i];

    if (line.trim()!=="") {
      lineContent += "<div class='codeLine'>" +
                   "<span class='line'>" +
                    line +
                   "</span>" +
                  "</div>";
      lineNumbers += "<div class='lineNumber'>"+(i+1)+"</div>";
    } else {
      lineContent += "<div class='codeLine emptyCodeLine'></div>";
      lineNumbers += "<div class='emptyLineNumber lineNumber'>"+(i+1)+"</div>";
    }
  }

  lineContent += "</div>";
  lineNumbers += "</div>";

  return lineNumbers + lineContent;
}

function markyText(text, language) {
  //Convert tabs to 4 spaces for cross-browser display continuity.
  var text = text.replace(/\t/g, "    ")

  var matches = markyGetMatches(text, language);

  for (var i=0; i < matches.length; i++) {
    text = applyMarkyWrapper(matches[i], text)
  }

  //Format the text in lines for the HTML container.
  var lines =  text.split("\n");
  return buildMarkyCodeSection(lines)
}

function markySection($codeSection) {
  //Escape any inner HTML content.
  var text = $codeSection.html().trim();

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
