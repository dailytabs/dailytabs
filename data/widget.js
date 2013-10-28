var today = new Date();

var ey = document.getElementById("daily-tabs-add-end-year");
for(var i = 0; i < 6; i++) {
  var o = document.createElement("option");
  o.value = today.getFullYear() + i;
  o.text = o.value;
  ey.add(o, null);
}
var em = document.getElementById("daily-tabs-add-end-month");
for(var i = 0; i < 12; i++) {
  var o = document.createElement("option");
  o.value = i;
  o.text = i + 1;
  em.add(o, null);
}
var ed = document.getElementById("daily-tabs-add-end-day");
for(var i = 1; i < 32; i++) {
  var o = document.createElement("option");
  o.value = i;
  o.text = i;
  ed.add(o, null);
}

function isValidDate(d) {
  if(Object.prototype.toString.call(d) !== "[object Date]") {
    return false;
  }
  return !isNaN(d.getTime());
}

function resetEnd() {
  var error = document.getElementById("daily-tabs-add-end-error");
  if(error) {
    error.parentNode.removeChild(error);
  }
  self.port.emit("panel_resize", { "width": 215, "height": 95 });
  ey.selectedIndex = 0;
  var nextMonth = today.getMonth() + 2;
  if(nextMonth > 12) {
    nextMonth = 1;
  }
  em.selectedIndex = nextMonth - 1;
  ed.selectedIndex = today.getDate() - 1;
}

function showError(text) {
  var error = document.getElementById("daily-tabs-add-end-error");
  if(!error) {
    error = document.createElement("div");
    error.id = "daily-tabs-add-end-error";
    error.style = "color:red;font-size:.8em;text-align:center";
    self.port.emit("panel_resize", { "width": 215, "height": 111 });
    document.getElementById("daily-tabs-add-end").insertBefore(error, em);
  }
  error.textContent = text;
}

var ac = document.getElementById("daily-tabs-add-current");
ac.addEventListener("click", function() {
  var y = ey.options[ey.selectedIndex].value;
  var m = em.options[em.selectedIndex].value;
  var d = ed.options[ed.selectedIndex].value;
  var end = new Date(y, m, d, 0, 0, 0, 0);
  if(!isValidDate(end)) {
    showError("Invalid date.");
    return;
  }
  if(today > end) {
    showError("Date must be after today.");
    return;
  }
  self.port.emit("add_current", end.getTime());
}, false);

self.port.on("widget_panel_show", resetEnd);