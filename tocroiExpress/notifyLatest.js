//New install
if(localStorage["AllowSowNotify"] === undefined)
{
	localStorage["AllowSowNotify"] = "true";
	localStorage["feedSource"] = 0;
	localStorage["IntervalTime"] = 3;
	
}
/////////////////////////////////////////////////////////////////////////////
const feedListID = [
					"3bc83ae3387d5c8e2812dce57ea6693d", //Blog only
					"310f115844772df5df16fe4e287bde1c", //facebook wall only
					"87a2d9e8de526db6918be94bc91bc0af",	//Mix
				];

const isDebug = false;
var INTERVALTIME = 1000*localStorage["IntervalTime"];
var unreadCount = 0;

//New install
if(localStorage["AllowSowNotify"] === undefined)
{
	localStorage["AllowSowNotify"] = "true";
	localStorage["feedSource"] = 0;
	localStorage["IntervalTime"] = 3;
	
}

//////////////////////    Get content      //////////////////////////////////

var GetLatestPost = function(isDebug)
{	
        $.getJSON("http://pipes.yahoo.com/pipes/pipe.run?_id="+feedListID[localStorage["feedSource"]]+"&_render=json",function(result){
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
	
//////////////////////    NOTIFICATION      //////////////////////////////////
// Declare a variable to generate unique notification IDs
var notID = 0;
var postObject = null;
// Create the notification with the given parameters as they are set in the UI
function doNotify(item) {
	if(item == null)
		return;
	postObject = item;
	chrome.notifications.create("id"+notID++, makeOption(item), creationCallback);

	chrome.browserAction.setBadgeText({text:(++unreadCount).toString()});
}

function creationCallback(notID) {
	console.log("Succesfully created " + notID + " notification");
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
		chrome.browserAction.setBadgeText({text:(--unreadCount).toString()});
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

chrome.browserAction.onClicked.addListener(function(){GetLatestPost(true)});

var GetPostInterval = setInterval(function(){
	GetLatestPost(isDebug);
},INTERVALTIME);


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.IntervalTime)
    {
		INTERVALTIME = 1000*localStorage["IntervalTime"];
		window.clearInterval(GetPostInterval);
		GetPostInterval = setInterval(function(){
			GetLatestPost(isDebug);
		},INTERVALTIME);
  	}
  	sendResponse({});
  });