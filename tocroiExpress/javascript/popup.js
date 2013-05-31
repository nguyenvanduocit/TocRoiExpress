$(document).ready(function(){
	$.getJSON("http://pipes.yahoo.com/pipes/pipe.run?_id=3bc83ae3387d5c8e2812dce57ea6693d&_render=json&count=10&feed0=http%3A%2F%2Fgoiyeu.net%2Ffeed&feed1=http%3A%2F%2Fmuatocroi.com%2Ffeed&feed2=http%3A%2F%2Ffacebook.com%2Ffeeds%2Fpage.php%3Fformat%3Drss20%26id%3D137877582890027&feed3=http%3A%2F%2Ffacebook.com%2Ffeeds%2Fpage.php%3Fformat%3Drss20%26id%3D141920402552158",function(msg){
		// msg.query.results.item is an array:
		var items = msg.value.items;
		var htmlString = "";
	
		for(var i=0;i<items.length;i++)
		{
			var news = items[i];
			// Looping and generating the markup of the newsorials:
			htmlString += '<div class="news"><h2><a href="'+news.link+'" target="_blank">'+news.title+'</a></h2><p>'+news.description+'</p></div>';
		}
		$('.complex-wrap').html(htmlString);
		chrome.runtime.sendMessage({action: "cleanNotification"}, function(response) {});
	},'json');

	$('.settings-button').click(function(){
		chrome.runtime.sendMessage({action: "openOption"}, function(response) {});
	});
	$('.history-button').click(function(){
		chrome.runtime.sendMessage({action: "openHistory"}, function(response) {});
	});
});