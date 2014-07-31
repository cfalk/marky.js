# marky.js

*"marky.js is a JavaScript tool that automatically applies classes to code features -- letting you easily apply the full power of CSS to your writing"*

---

**Usage**

Using marky.js is simple! If you have a block of code you want to style, just **wrap it in a `.codeSection` class**: 
```
<div class="codeSection"> var x=5; </div>
```


If you have a large section of code **you only need one block**.
```
<div class="codeSection">
var x=5,
    y=10;
myFunction(x+y+10);
</div>
```


If you don't specify a language, marky.js will try to interpret it; however, **you can always specify the language**.
```
<div class="codeSection" language="JavaScript"> ... </div>
```

**Inline code** can be styled by using grave accent wraps: \`if (x): print y\`

---

**Language Support**

Currently, marky.js supports the following languages:

 - JavaScript
 - Python (2.7)
 - Ruby

Future versions plan to support:

 - HTML
 - Bash
