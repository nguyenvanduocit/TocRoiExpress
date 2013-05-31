//New install
if(localStorage["AllowSowNotify"] === undefined)
{
	localStorage["AllowSowNotify"] = "true";
	localStorage["AllowCloseNotify"] = "false";
	localStorage["feedSource"] = "http://goiyeu.net/feed,http://muatocroi.com/feed,http://facebook.com/feeds/page.php?format=rss20&id=137877582890027,http://facebook.com/feeds/page.php?format=rss20&id=141920402552158";
	localStorage["IntervalTime"] = 60*3;
	
}
var facebookFeedBase = "http://facebook.com/feeds/page.php?format=rss20&id=";
const isDebug = false;
var INTERVALTIME = 1000*localStorage["IntervalTime"];
var FEEDLIST = "";
var notificationList = [];
var notID = 0;
var postObject = null;
//////////////////////    Get content      //////////////////////////////////

var GetLatestPost = function(isDebug)
{	
        $.getJSON("http://pipes.yahoo.com/pipes/pipe.run?_id=3bc83ae3387d5c8e2812dce57ea6693d&_render=json&count=1"+FEEDLIST,function(result){
        	//If have result
        	if(result.count>0)
        	{
        		item = result.value.items[0];
        		//If have cached, check it if have notify before
        		if (localStorage.cache)
        		{
        			if((localStorage.cache != item.guid.content) || isDebug)
					{
						//We have new post
			            localStorage.cache	= item.guid.content;
			            NotifiNewPost(item);
			        }
			        else
			        {
			        	//old post
			        	console.log("No new post");
			        	//debug
			        	//NotifiNewPost(item);
			        }
        		}
        		else
        		{
        				//We have new post
			            localStorage.cache	= item.guid.content;
			            NotifiNewPost(item);
        		}

	        }
	        else //Get the fuck error
	        {
	        	console.log("Got error");
	        	console.log(result);
	        }
        },'json');
}
function NotifiNewPost(item)
{
	if(item == null)
		return;
	doNotify(item);
}
function updateFeedList()
{
	NewFEEDLIST = "";
	Things = localStorage["feedSource"].split(',');
	for (var i = 0; i < Things.length; i++) {
		NewFEEDLIST+="&feed"+i+"="+encodeURIComponent(Things[i]);
	};
	FEEDLIST = NewFEEDLIST;
}
//////////////////////    NOTIFICATION      //////////////////////////////////
// Create the notification with the given parameters as they are set in the UI
function doNotify(item) {
	if(item == null)
		return;
	postObject = item;
	chrome.notifications.create("id"+notID++, makeOption(item), creationCallback);
}

function creationCallback(notID) {
	notificationList.push(notID);
	chrome.browserAction.setBadgeText({text:(notificationList.length).toString()});
	console.log("Succesfully created " + notID + " notification");
	//localStorage["AllowCloseNotify"] is string
	if(localStorage["AllowCloseNotify"] == "true")
	{
		setTimeout(function(){
			CloseNotifications(notID,0);
		},4000);
	}
}

///// Add notivication listener
//chrome.notifications.onDisplayed.addListener(notificationDisplayed);
chrome.notifications.onClosed.addListener(function(notificationId, byUser){
	if(byUser)
	{
		CloseNotifications(notificationId,0);
	}
});
chrome.notifications.onClicked.addListener(function(notificationId){
	ViewPost();
	CloseNotifications(notificationId,0);
});

chrome.notifications.onButtonClicked.addListener(function(notificationId, iBtn){
	if(iBtn == 0)
	{
		ViewPost();
	}
	CloseNotifications(notificationId,0);
});

//helper
function CloseNotifications(notificationId, delaytime)
{
	setTimeout(function(){
		chrome.notifications.clear(notificationId,function(wasCleared){});
		notificationList.splice(notificationList.indexOf(notificationId), 1);
		chrome.browserAction.setBadgeText({text:(notificationList.length).toString()});
	},delaytime);
}

function ViewPost()
{
	chrome.tabs.create({'url': postObject.link}, function(tab) {});
}

function cleanText(str)
{
	return $("<div/>").html(str).text().replace(/<\/?([b-z]+)[^>]*>/gi,'');
}

function makeOption(item)
{
	var	options = 	{
		type : "image",
		//expandedMessage: $("<div/>").html(item.content.content).text(),
		//imageUrl : "/images/tahoe-320x215.png",
	};
	// priority is from -2 to 2. The API makes no guarantee about how notifications are
	// visually handled by the OS - they simply represent hints that the OS can use to 
	// order or display them however it wishes.
	//localStorage["AllowSowNotify"] is string
	options.priority = ((localStorage["AllowSowNotify"]=="true")?0:-1);

	options.buttons = [];
	options.buttons.push({ title: chrome.i18n.getMessage('view') });
	//options.buttons.push({ title: chrome.i18n.getMessage('ignore') });
	
	if(isFacebookURL(item.link))
	{
		options.title = cleanText(item.author)+" on facebook";
		options.message = cleanText(item.description);
		options.iconUrl = chrome.runtime.getURL("/images/facebook-64x64.png");
	}
	else
	{
		options.title = cleanText(item.title);
		options.message = cleanText(item.description);
		options.iconUrl = chrome.runtime.getURL("/images/white-64x64.png");
	}
	return options;
}

function isFacebookURL(url)
{
	return url.match(/:\/\/www.facebook.com(.[^/]+)/)!=null;
}

$(document).ready(function() {

	updateFeedList();

	var GetPostInterval = setInterval(function(){
		GetLatestPost(isDebug);
	},INTERVALTIME);


	chrome.runtime.onMessage.addListener(
	  function(request, sender, sendResponse) {
	    if (request.action == "IntervalTime")
	    {
			INTERVALTIME = 1000*localStorage["IntervalTime"];
			window.clearInterval(GetPostInterval);
			GetPostInterval = setInterval(function(){
				GetLatestPost(isDebug);
			},INTERVALTIME);
	  	}
	  	else if(request.action == "feedSource")
	  	{
	  		updateFeedList();
	  	}
	  	else if(request.action == "openOption")
	  	{
	  		chrome.tabs.create({'url': "options.html"}, function(tab) {});
	  	}
	  	else if(request.action == "cleanNotification")
	  	{
	  		for (var i = 0; i < notificationList.length; i++) {
	  			CloseNotifications(notificationList[i],0);
	  		};
	  	}
	  	else if(request.action == "newDefaultTab")
	  	{

	        chrome.tabs.getSelected( null, function( tab ) {
				chrome.tabs.update( tab.id, { url: "chrome-internal://newtab/" } );
			});
	  	}
	  	else if(request.action == "notification")
	  	{
	  		item = JSON.parse(request.contentObject);
	  		doNotify(item);
	  	}
	  	sendResponse({});
	  });
});