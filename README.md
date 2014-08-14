# <a href="http://marky.caseyfalk.com">marky.js</a>

*"marky.js is a tool that applies classes to code -- letting you easily use the full power of CSS in your writing."*

---

Disclaimer: The tool is not completely comprehensive yet and has bugs (to soon be documented)! I welcome help!

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

Note that if you use a `div` container for your code, the browser may interpret it before marky.js can use it (and thus it may lose formatting). If your code contains HTML, we recommend using a `textarea` block instead of a `div`:

```
<textarea class="codeSection">
<div>
  <a href="/myURL/">Hello world!</a>
</div>
</textarea>
```

---

**Language Support**

Currently, marky.js supports the following languages:

 - JavaScript
 - Python (2.7)
 - Ruby
 - HTML

Future versions plan to support:

 - Bash
