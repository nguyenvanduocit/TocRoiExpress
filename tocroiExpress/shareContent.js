const MUATOCROI_HOME_URL = 'muatocroi.com';  //Do not add http:// to URL
var notID = 0;
var isUrlHomePage = function(url) {
	return url.match(new RegExp(
			"^https?://(.+\.)?" + MUATOCROI_HOME_URL, "ig"));
}

var openHootlet = function(url, type, content) {
	if (!url || !content) {
		return;
	}
	var address = "http://muatocroi.com/addition/googlechromeEx/MTRNotification/";
	address += "?source=" + encodeURIComponent(url) + "&type=" + encodeURIComponent(type) + "&content="+encodeURIComponent(content);
	window.open(address, "Tóc Rối",'toolbar=no,scrollbars=0,toolbar=0,location=0,resizable=0,status=0,width=400,height=400');
	_gaq.push(['_trackEvent', "Context_"+type, 'clicked']);
}

// Supposed to Called when the user clicks on the browser action icon.

var pageContext = chrome.contextMenus.create({
	"title" : chrome.i18n.getMessage('sharePage'),
	"contexts" : [ "page" ],
	"onclick" : pageOnClick
});

var linkContext = chrome.contextMenus.create({
	"title" : chrome.i18n.getMessage('shareLink'),
	"contexts" : [ "link" ],
	"onclick" : linkOnClick
});

var selectionContext = chrome.contextMenus.create({
	"title" : chrome.i18n.getMessage('shareSelected'),
	"contexts" : [ "selection" ],
	"onclick" : selectionOnClick
});

function selectionOnClick(info, tab) {
	openHootlet(info.pageUrl, "text", info.selectionText);
}

function pageOnClick(info, tab) {
	openHootlet(tab.url, "Link", tab.title);
}

function linkOnClick(info, tab) {
	var title = '-'
	if (info.selectionText) {
		title = info.selectionText;
	}
	
	openHootlet(info.linkUrl, "Link", title);
}