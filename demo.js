$(document).on("ready", function() {
  $("h1, h2, h3").each(function() {
    var $this = $(this);
    var url = $this.html().trim().replace(" ","");
    var prefix = "jump-";
    $this.wrap("<a name="+prefix+url+" href=#"+prefix+url+"></a>");
    $this.parent().css({
      "color":"inherit",
      "text-decoration":"inherit",
      "outline":"inherit"
    });
  });
});
