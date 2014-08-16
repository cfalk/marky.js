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
      "html": "<!DOCTYPE"+any+"*?>",
      "bash": "#[^\\n]*",
      "nginx": "#[^\\n]*",
  },

  "string": {
      "javascript": "\".*?\"|'.*?'",
      "python": "\".*?\"|'.*?'",
      "ruby": "\".*?\"|'.*?'",
      "html": "\""+any+"*?\"|'"+any+"*?'|[^ >;,\\s]+",
      "bash": "\".*?\"|'.*?'",
      "nginx": "\".*?\"|'.*?'",
  },

  "operator": {
      "javascript": ["+","-","*","/","===", "!=", "==", "=", "<", ">", "\\",
                     "+=", "++", "--", "-=", "*=", ">=", "<=", "%", "%="],
      //Source: https://www.ics.uci.edu/~pattis/ICS-31/lectures/tokens.pdf
      "python": ["+", "-", "*", "/", "//", "%", "**", "==", "!=", "<", ">", "=",
                 "<=", ">=", "and", "not", "or", "&", "|", "~", "^", "<<", ">>",
                 "\\"
                 ],
      "ruby": ["+", "-", "*", "/", "//", "%", "**", "===", "!=", "<=>", ">", "=",
               "<", "==", "equal?","!", "?:", "..", "...", "defined?",
               "<=", ">=", "and", "not", "or", "&", "|", "~", "^", "<<", ">>",
               "\\"],
      "bash": ["+","-","*","/","**","%","+=","-=","*=","/=","%=","<<","<<=","=",
               "==", ">>",">>=","<<=","&","&=","|","|=","~","^","^=","!","&&","||",
               "\\" ],
      "nginx": ["~", "^", "=", "|", "\\"],
      "uwsgi": ["=", "\\"]
  },

  "syntax": {
      "javascript": ["[","]","{","}","(",")",";", ",", ".", ":"],
      "python": ["[","]","{","}","(",")",";", ",", ".", ":"],
      "ruby": ["[","]","{","}","(",")",";", ",", ".", ":"],
      "html": ["<",">","/", "=", "{", "}", ";", ":"],
      "bash": ["[","]", "(", ")", "{", "}", ";"],
      "nginx": ["{", "}", ";", ":", ".", "(", ")"],
      "uwsgi": [".",":",";"]
  },

  "keyword": {
      //Source: http://stackoverflow.com/questions/1661197/valid-characters-for-javascript-variable-names
      "javascript": ["do", "if", "in", "for", "let", "new", "try",
                    "var", "case", "else", "enum", "eval", "false",
                    "null", "this", "true", "void", "with", "break",
                    "catch", "class", "const", "super", "throw", "while",
                    "yield", "delete", "export", "import", "public",
                    "return", "switch", "typeof", "default",
                    "extends", "finally", "package", "private", "continue",
                    "debugger", "function", "arguments", "interface",
                    "protected", "implements", "instanceof", "document",
                    "window", "NaN"],
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
      //Source: https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5/HTML5_element_list
      "html": ["html", "Document", "Element", "head", "title", "base", "link",
               "meta", "style", "Scripting", "Element", "script", "noscript",
               "templateThis", "Sections", "Element", "body", "Represents",
               "section", "nav", "article", "aside", "h1,h2,h3,h4,h5,h6",
               "header", "footer", "address", "mainThis", "Grouping", "Element",
               "p", "hr", "pre", "blockquote", "ol", "ul", "li", "dl", "dt", "dd",
               "figure", "figcaption", "div", "Text-level", "Element", "a", "em",
               "strong", "small", "s", "cite", "q", "dfn", "abbr", "data", "time",
               "code", "var", "samp", "kbd", "sub,sup", "i", "b", "u", "mark",
               "ruby", "rt", "rp", "bdi", "bdo", "span", "br", "wbr", "Edits",
               "Element", "ins", "del", "Embedded", "Element", "img", "iframe",
               "embed", "object", "param", "video", "audio", "source", "track",
               "canvas", "map", "area", "svg", "math", "Tabular", "Element",
               "table", "caption", "colgroup", "col", "tbody", "thead", "tfoot",
               "tr", "td", "th", "Forms", "Element", "form", "fieldset", "legend",
               "label", "input", "button", "select", "datalist", "optgroup",
               "option", "textarea", "keygen", "output", "progress", "meter",
               "Interactive", "Element", "details", "summary", "menuitem", "menu"],
      //Source: http://ss64.com/bash/
      "bash":["!", "[[", "]]", "case", "do", "done", "elif", "else",
              "esac", "fi", "for", "function", "if", "in", "select", "then",
              "time", "until", "while",
              "alias", "apropos", "apt-get", "aptitude", "aspell", "awk",
              "basename", "bash", "bc", "bg", "break", "builtin", "bzip2",
              "cal", "case", "cat", "cd", "cfdisk", "chgrp", "chmod", "chown",
              "chroot", "chkconfig", "cksum", "clear", "cmp", "comm", "command",
              "continue", "cp", "cron", "crontab", "csplit", "cut", "date", "dc",
              "dd", "ddrescue", "declare", "df", "diff", "diff3", "dig", "dir",
              "dircolors", "dirname", "dirs", "dmesg", "du", "echo", "egrep",
              "eject", "enable", "env", "ethtool", "eval", "exec", "exit",
              "expect", "expand", "export", "expr", "false", "fdformat",
              "fdisk", "fg", "fgrep", "file", "find", "fmt", "fold", "for",
              "format", "free", "fsck", "ftp", "function", "fuser", "gawk",
              "getopts", "grep", "groupadd", "groupdel", "groupmod", "groups",
              "gzip", "hash", "head", "help", "history", "hostname", "iconv",
              "id", "if", "ifconfig", "ifdown", "ifup", "import", "install",
              "jobs", "join", "kill", "killall", "less", "let", "link", "ln",
              "local", "locate", "logname", "logout", "look", "lpc", "lpr",
              "lprint", "lprintd", "lprintq", "lprm", "ls", "lsof", "make",
              "man", "mkdir", "mkfifo", "mkisofs", "mknod", "more", "mount",
              "mtools", "mtr", "mv", "mmv", "netstat", "nice", "nl", "nohup",
              "notify-send", "nslookup", "open", "op", "passwd", "paste",
              "pathchk", "ping", "pkill", "popd", "pr", "printcap", "printenv",
              "printf", "ps", "pushd", "pv", "pwd", "quota", "quotacheck",
              "quotactl", "ram", "rcp", "read", "readarray", "readonly", "reboot",
              "rename", "renice", "remsync", "return", "rev", "rm", "rmdir",
              "rsync", "screen", "scp", "sdiff", "sed", "select", "seq", "set",
              "sftp", "shift", "shopt", "shutdown", "sleep", "slocate", "sort",
              "source", "split", "ssh", "strace", "su", "sudo", "sum", "suspend",
              "sync", "tail", "tar", "tee", "test", "time", "timeout", "times",
              "touch", "top", "traceroute", "trap", "tr", "true", "tsort", "tty",
              "type", "ulimit", "umask", "umount", "unalias", "uname", "unexpand",
              "uniq", "units", "unset", "unshar", "until", "uptime", "useradd",
              "userdel", "usermod", "users", "uuencode", "uudecode", "v", "vdir",
              "vi", "vmstat", "wait", "watch", "wc", "whereis", "which", "while",
              "who", "whoami", "wget", "write", "xargs", "xdg-open", "yes", "zip",
              ".", "!!", "###", "service"],
      "nginx": ["user", "include", "worker_processes", "error_log", "pid",
                "worker_rlimit_nofile", "events", "http", "index", "default_type",
                "access_log", "sendfile", "root", "server_name", "fastcgi_pass",
                "location", "server", "listen", "upstream", "proxy_pass",
                "expires", "tcp_nopush", "log_format", "worker_connections", "if",
                "else", "server_name", "uwsgi_pass", "alias"
               ],
      "uwsgi": ["plugins","chdir","module","env","master","socket","processes",
                "harakiri","max-requests","vacuum","daemonize",

               ]
  },

  "bool": {
      "javascript": ["true", "false"],
      "python": ["True", "False"],
      "ruby": ["true", "false"],
      "html": "(#|.|)[a-zA-Z0-9-_*]+",
      "bash": ["true", "false"],
      "uwsgi": ["True", "False"],
  },

  "identifier": {
      "javascript": "[a-zA-Z_$]+[a-zA-Z0-9_$]*",
      "python": "[a-zA-Z_$]+[a-zA-Z0-9_]*",
      "ruby": "($|@?@?)[a-zA-Z_]+[a-zA-Z0-9_]*(\\?|\\!)?",
      "html": "[a-zA-Z_-]+",
      "nginx": "[$a-zA-Z_\.]+",
      "uwsgi": "[$a-zA-Z_\.]+",
  },

  "number": {
      "javascript": "[0-9]*\\.?[0-9]+",
      "python": "[0-9]+(\\.[0-9]+)?",
      "ruby": "[0-9]+(\\.[0-9]+)?",
      "html": "#[a-fA-F0-9]{3}([a-fA-F0-9]{3})?",
      "bash": "[0-9]+(\\.[0-9]+)?",
      "nginx": "[0-9]+(\\.[0-9]+)?",
      "uwsgi": "[0-9]+(\\.[0-9]+)?",
  },

  "special": {
      "html":"[a-zA-Z]+",
      "nginx":"(http://|https://)[^;\\s]+",
      "bash":"[a-zA-Z]+",
      "uwsgi":"\\[uwsgi\\]"
  },

  "regex": {
      "javascript":"/.+?/",
      "nginx":".+?"
  },

  "filename": {
      "bash":"/?([\\.a-zA-Z0-9_-]+/?)+|/",
      "nginx":"/?([\\.a-zA-Z0-9_-]+/?)+|/",
      "uwsgi":"/?([\\.a-zA-Z0-9_-]+/?)+|/",
  },

  "attributeKey": {
      "html":"[a-zA-Z-]+", //Used for: CSS Attribute Keys
  },

  "attributeVal": {
      "html":"\\\"?[a-zA-Z-\\s]+\\\"?", //Used for: CSS Attribute Vals
      "nginx":"([0-9]+?\\.){3}[0-9](:[0-9]+)?",
      "uwsgi":"([0-9]+?\\.){3}[0-9](:[0-9]+)?",
  },

  "innards": {
      "html":"[^<\\s][^<]+?[^<\\s]*|[^<\\s]*[^<]+?[^<\\s]"
  },

  "option": {
      "bash": "-[-a-zA-Z0-9_]+",
  }
}


var precedence = {  // Earliest === Highest Precedence
  "default": [
      "multilineComment", "inlineComment",
      "attributeKey", "attributeVal", "innards",
      "string", "regex", "bool", "operator",
      "keyword", "identifier", "special",
      "number", "filename", "option",
      "syntax"
  ],
}

var borders = { //Precedence: Language, Default, None ("")
  /*
  "example": {
    "feature": {
      "left":"pattern" //(If one side given, other is "".
    },
    "feature2": "pattern" //Applies pattern to both sides.
  }
  */
  "html": {
    "string":{
      "left":"=\\s*",
    },
    "identifier":{
      "right":"\\s*\\="+any+"+?\\>"
    },
    "keyword":{
      "left":"\\<\\s*/?\\s*",
      "right":"[^>]*>"
    },
    "special": {
      "left":"\\<\\s*/?\\s*",
      "right":"[^a-zA-Z]"
    },
    "attributeKey": {
      "right":"\\s*:\\s*"
    },
    "attributeVal": {
      "left":"\\s*:\\s*",
      "right":"[,;]"
    },
    "bool": {
      "right": "\\s*{"
    },
    "innards": {
      "left":"\\>[\\s\\n\\r]*",
      "right":"[\\s\\n\\r]*\\<",
    }
  },

  "bash": {
    "keyword":"^|\\s|$",
    "filename": {
      "left":"[\\s=]",
    },
    "special": "\\s|^|$",
    "option":"",
  },

  "nginx": {
    "keyword":"^|\\s|$",
    "filename": {
      "left":"[\\s]"
    },
    "regex": {
      "left": "~\\*?\\s+",
      "right":"\\s*\\{"
    },
    "identifier":{
    },
  },

  "uwsgi": {
    "identifier":{
      "left":"(?:=\\s*)|(?::\\s*)|(?:\\.)|(?:^[a-zA-Z_-]+\\s+)"
    },
    "keyword": {
      "right":"\\s*[^\\s]"
    },
    "filename": {
      "left":"[\\s*=]",
    }
  },

  "default": {
    "keyword":"[^a-zA-Z]|^|$",
    "inlineComment": {
      "left":"(?!:[^\"].*\")|(?!:[^'].*')|^",
    },
    "regex":"[^\\.]", //TODO: Simplistic
    "filename": {
      "left":"[\\s^]",
      "right":"\\s|$|;"
    }
  }
}


var languages = ["nginx", "uwsgi", "javascript", "python", "ruby", "html", "bash"];
var caseInsensitive = ["html"]
var inferWeights = {
  "multilineComment": 10, //High since most are unique.
  "keyword": 5,
  "syntax": 0.8,
  "filename": 0.5,
  "identifier": 0.5,
  "operator": 0.2,
}

var matchSizeUnimportant = ["innards" ]


function loadRegExpArray(arr) {
  //Prepare escape characters for the RegEx.
  var escapeTokens = "\\"+"^${}[]().*+-?<>/\\|".split("").join("|\\");
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
      if (match1["end"]-match1["start"] == match2["end"]-match2["start"] ||
         matchSizeUnimportant.indexOf(match1["token"])>=0 ||
         matchSizeUnimportant.indexOf(match2["token"])>=0){
        continue;
      }

      if  (match1["start"]<=match2["start"] && match1["end"]>=match2["end"]){
        matchObjs[j] = undefined;
      } else if (match2["start"]<=match1["start"] && match2["end"]>=match1["end"]){
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
  var weightSum = 0;
  for (var i=0; i<matches.length; i++) {
    var match = matches[i];

    // Allow different tokens to have different "weights" in inferences
    var weight = inferWeights[ match["token"] ];
    if (weight===undefined) weight = 1;
    weightSum += weight;

    var length = match["end"]-match["start"];
    totalChars += length;
  }
  var textCoverage = parseFloat(totalChars)/text.length;
  return textCoverage * weightSum;
}


function markyInferLanguage(text) {
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
/*
  "javascript": {
    "keyword":"[^a-zA-Z]|^|$"
  }

  "default": {
    "keyword":"[^a-zA-Z]|^|$",
    "inlineComment": {
      "left":"(!:[^\"].*\")|(!:[^'].*')|^",
    },

*/

function getLeftRightBorders(token, language) {
  var left, right, border;
  var attempt = [language, "default"]

  for (var i=0; i < attempt.length; i++) {
    border = borders[ attempt[i] ];
    if (border===undefined) continue;

    border = border[token]
    if (border===undefined) continue;
    if (typeof border === "string") {
      left = border;
      right = border;
    } else {
      left = border["left"];
      right = border["right"];
    }
    break;
  }

  if (left===undefined) left = "";
  if (right===undefined) right = "";

  return [left, right];
}


var patternCache = {}; //Cache patterns for increased speed.
function markyGetMatches(text, language) {
  //Convert tabs to 4 spaces for cross-browser display continuity.
  var matchObjs = [];
  var matchCase = (caseInsensitive.indexOf(language)>=0) ? "i" : "";

  var timer = new Date(); //TODO:
  //Apply each of the language token filters to add the appropriate classes.
  $.each(lexer, function(token, languageOptions){

    var regexContent = languageOptions[language];
    if (regexContent !== undefined) {

      var pattern = patternCache[language +"_"+ token];
      if (pattern === undefined) {
        // Escape any characters in array inputs that need to be escaped.
        if (regexContent instanceof Array) {
          regexContent = loadRegExpArray(regexContent);
        }


        // Borders indicate characters that can not be adjacent to a token.
        // Border Priority: language-specific, a cross-language default, then none.
        var borderTuple = getLeftRightBorders(token, language);
        var left = borderTuple[0];
        var right = borderTuple[1];
        if (left!=="") left = "(?:"+left+")";
        if (right!=="") right = "(?:"+right+")";

        pattern = new RegExp(left+"("+regexContent+")"+right, "gm"+matchCase);
        patternCache[language +"_"+ token] = pattern;
      }

      var match;
      var timer2 = new Date(); //TODO
      while (match=pattern.exec(text)) {
        var matchedText = match[1];

        var regexStart = match["index"];
        var start = text.slice(regexStart).indexOf(matchedText)+regexStart;
        var end = start+matchedText.length;

        var matchObj = {
          "start":start,
          "end":end,
          "text":matchedText,
          "token":token,
          "language":language
        };

        matchObjs.push(matchObj);
        pattern.lastIndex = end; //Ignore any `border` matches.
      }
  var time2 = new Date() - timer2; //TODO
  if (time2>5) console.log(" -- " + token + " -- " +time2);
    }
  });

  //Sort and filter the matches to avoid double-matching.
  var matchObjs = filterMatches(matchObjs, language)

  var time = new Date() - timer; //TODO
  if (time>5) console.log(language + " -- " +time);

  return matchObjs;
}

function escapeHTML(string) {
  var pre = document.createElement("pre");
  var text = document.createTextNode(string);
  pre.appendChild(text);
  return pre.innerHTML;
}

//Escape enough chars that the browser does not interpret the string as HTML.
function unEscapeHTML(string) {
  return string.replace(/&lt;/g,"<")
               .replace(/&gt;/g,">")
               .replace(/&quot;/g, "\"");
}

function applyMarkyWrapper(match, text) {
  var wrapperOpen = "<span class='marky-"+match["token"]+"'>";
  var wrapperClose = "</span>";

  var textParts = match["text"].split("\n");

  var newText = "";
  for (var i=0; i<textParts.length; i++) {
    var content = escapeHTML(textParts[i]);
    if (content==="") content=" ";

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
  //Grab the content (and escape any inner HTML)
  var text = $codeSection.html().trim()
  text = unEscapeHTML(text);

  // If the lang isn't given, attempt to infer what it should be.
  var lang = $codeSection.attr("language");
  lang = (lang===undefined) ? markyInferLanguage(text) : lang.toLowerCase();

  // Apply the marky formatting to the element.
  var formattedCode = markyText(text, lang);

  //Grab the attributes of the container element.
  attrs = {};
  $.each($codeSection[0].attributes, function(i, attr) {
    attrs[attr.nodeName] = attr.nodeValue;
  });

  //Construct a new container so that textarea/divs are rendered the same.
  var $newBlock = $("<div></div>", attrs).html(formattedCode);
  $newBlock.addClass("marky-"+lang.replace(/ /g,""));
  $newBlock.append("<div class='marky-language'>"+lang+"</div>");

  $codeSection.replaceWith($newBlock);
}


function markyDocument() {
  $(".codeSection").each(function() {
    markySection($(this));
  });
}


var timer = new Date(); //TODO
markyDocument()
console.log((new Date()-timer)/1000.0 + " OVERALL"); //TODO

// # # # # # # # # # # # # # # # # # # # # # #
});
