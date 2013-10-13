var data = require("sdk/self").data;
var panels = require("sdk/panel");
var storage = require("sdk/simple-storage").storage;
var tabs = require("sdk/tabs");
var widgets = require("sdk/widget");

/**
 * "onLoad" callback.
 *
 * @param {array} opts options provided
 * @returns {undefined}
 */
exports.main = function(opts) {
  switch(opts.loadReason)
  {
    case "install":
      var today = new Date();
      storage.dayStartsAt = 4;
      storage.lastRun = today.getTime() - 86400000;
      storage.tabList = [];
      break;
    case "enable":
      dailyTabs.open();
      break;
    case "startup":
      dailyTabs.open();
      break;
  }
};

/**
 * Toolbar widget and panel.
 */
var widgetPanel = panels.Panel({
  width: 215,
  height: 95,
  contentURL: data.url("widget.html"),
  contentScriptFile: data.url("widget.js")
});
var widget = widgets.Widget({
  id: "daily-tabs-toolbar-widget",
  label: "Daily Tabs",
  contentURL: data.url("images/icon.png"),
  panel: widgetPanel
});
widgetPanel.on("show", function() {
  widgetPanel.port.emit("widget_panel_show");
});
widgetPanel.port.on("add_current", function(end) {
  widgetPanel.hide();
  dailyTabs.add(tabs.activeTab.url, end);
});
widgetPanel.port.on("panel_resize", function(size) {
  widgetPanel.resize(size.width, size.height);
});

/**
 * Daily Tabs functions.
 */
var dailyTabs = function() {
	return {
		add: function(url, end) {
      end = end + (storage.dayStartsAt * 3600000);
			storage.tabList.push([url, end]);
		},
    open: function() {
      var now = new Date();
      var todaysRun = new Date(now.getFullYear(), now.getMonth(), now.getDate(), storage.dayStartsAt, 0, 0, 0);
      now = now.getTime();
      todaysRun = todaysRun.getTime();
      var yesterdaysRun = todaysRun - 86400000;
      if(((now > todaysRun) && (todaysRun > storage.lastRun)) ||
              (storage.lastRun < yesterdaysRun)) {
        for(var i = 0; i < storage.tabList.length; i++) {
          var tab = storage.tabList[i];
          if(tab[1] < todaysRun) {
            storage.tabList.splice(i, 1);
          } else {
            tabs.open(tab[0]);
          }
          if(tab[1] < (todaysRun + 86400000)) {
            storage.tabList.splice(i, 1);
          }
        }
        storage.lastRun = now;
      }
    }
	};
}();

/**
 * "onUnload" callback.
 *
 * @param {string} reason
 * @returns {undefined}
 */
exports.onUnload = function(reason) {
  switch(reason)
  {
    case "uninstall":
      delete storage.dayStartsAt;
      delete storage.lastRun;
      delete storage.tabList;
      break;
  }
};