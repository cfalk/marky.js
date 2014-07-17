*"marky.js is a JavaScript tool that automatically applies classes to code features -- letting you easily apply the full power of CSS to your writing"*

---

**Usage**

Using marky.js is simple! If you have a block of code that you want to style, just wrap it like so: 
```
<div class="codeSection"> var x=5; </div>
```


marky.js can span multiple lines, so if you have a large section of code **you only need to say so once**.
```
<div class="codeSection">
var x=5,
    y=10;
myFunction(x+y+10);
</div>
```


If you don't specify a language, marky.js will try to interpret the language and features for you; however, **you can always specify the language**.
```
<div class="codeSection" language="JavaScript"> ... </div>
```

---
