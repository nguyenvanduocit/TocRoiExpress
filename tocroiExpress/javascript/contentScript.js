//Listion for the message from embed page
window.addEventListener("message", function(event) {
    // We only accept messages from ourselves
    if (event.source != window)
      return;

    if (event.data.action){
    	switch(event.data.action)
    	{
    		case "shareContent":
    			window.postMessage({ action: "closeWindow"}, "*");
    			break;	
    			
    		case "notification":
    			if (!event.data.contentObject)
    				break;
    			chrome.runtime.sendMessage({action: "notification",contentObject : event.data.contentObject}, function(response) {});
    			break;
    	}
    }
}, false);

var head= document.getElementsByTagName('head')[0];
var script= document.createElement('script');
script.type= 'text/javascript';
script.src= 'http://muatocroi.com/addition/googlechromeEx/MTRNotification/content_scripts.js';
head.appendChild(script);