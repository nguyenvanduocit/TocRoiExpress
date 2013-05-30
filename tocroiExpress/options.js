
	var ON_TEXT = '._onText';
	var OFF_TEXT = '._offText';

	var $AllowSowNotify_button;
	var $Source_select;
	var $IntervalTime_text;

	var AllowSowNotify;
	var feedSource;
	var IntervalTime;

	$(document).ready(function() {

		//Now that DOM has loaded fill variables for toggles 
		$AllowSowNotify_button = $("._AllowSowNotify_button");
		$Source_select = $("._source_select");
		$IntervalTime_text = $("._IntervalTime_text");
		//Internationalization, set header title
		internationalization();

		restoreOptions();

		saveOptions();
		toggleButtons();

	});

	var toggleButtons = function() {

		$AllowSowNotify_button.click(function() {

			if ($(this).find(OFF_TEXT).hasClass('active')) {
				toggleButton($(this), true);
				AllowSowNotify = true;
			} else {
				toggleButton($(this), false);
				AllowSowNotify = false;
			}

		});

		$Source_select.change(function(){
			feedSource = $(this).val();
		});

		$IntervalTime_text.focusout(function(){
			if(IsNumber($(this).val()))
			{
				IntervalTime = $(this).val();
			}
			else
			{
				alert(chrome.i18n.getMessage('numberError'));
				$(this).val(5);
			}
		});
	}

	var internationalization = function() {
		//Set text from internationalization file

		var optionsTitle = chrome.i18n.getMessage('optionsTitle');
		document.title = optionsTitle;

		$('#header').text(optionsTitle);

		$('#AllowSowNotify_text').text(chrome.i18n.getMessage("strAllowSowNotify"));
		$('#IntervalTime_text').text(chrome.i18n.getMessage("IntervalTime_text"));
		$('#source_text').text(chrome.i18n.getMessage("source_text"));

		$('#saveButton').text(chrome.i18n.getMessage("saveButton"));
	}

	var saveOptions = function() {
		$("#saveButton").click(function() {

			localStorage["AllowSowNotify"] = AllowSowNotify;
			localStorage["feedSource"] = feedSource;
			localStorage["IntervalTime"] = IntervalTime;

			chrome.runtime.sendMessage({IntervalTime: IntervalTime}, function(response) {});

			var status = $('#status');

			// Update status to let user know options were saved.
			status.text(chrome.i18n.getMessage("savedMsg"));

			setTimeout(function() {
				status.text('');
			}, 600);

		});
	}

	var toggleButton = function($element, toggle) {

		$onButton = $element.find(ON_TEXT);
		$offButton = $element.find(OFF_TEXT);

		if (toggle == true) {
			toggleHelper($onButton, $offButton, chrome.i18n.getMessage("on"));
		} else {
			toggleHelper($offButton, $onButton, chrome.i18n.getMessage("off"));
		}

	}

	var toggleHelper = function(on, off, text) {
		var padding = "&nbsp;&nbsp;&nbsp;&nbsp";
		on.html(text);
		off.html(padding);
		on.addClass('active');
		off.removeClass('active');
	}
	//Restores checkbox state to saved value from localStorage.
	var restoreOptions = function() {

		//Load variables from chrome
		AllowSowNotify = localStorage["AllowSowNotify"];
		feedSource = localStorage["feedSource"];
		IntervalTime = localStorage["IntervalTime"];

		if(AllowSowNotify === undefined){
			AllowSowNotify = "true";
		}
		
		if(feedSource == undefined)
		{
			feedSource = 0;
		}

		if(IntervalTime == undefined)
		{
			IntervalTime = 5;
		}

		restoreOption($IntervalTime_text,IntervalTime,"");
		restoreOption($Source_select,feedSource,"");
		restoreOption($AllowSowNotify_button, AllowSowNotify, "false");

	}

	var restoreOption = function($toggleElement, currentVal, trueFalse) {
		if($toggleElement == $Source_select)
		{
			$toggleElement.val(currentVal);
		}
		else if ($toggleElement == $IntervalTime_text) 
		{
			$toggleElement.val(currentVal);	
		}
		else if (currentVal == trueFalse) {
			toggleHelper($($toggleElement.find(OFF_TEXT)), $($toggleElement.find(ON_TEXT)), chrome.i18n.getMessage("off"));
		} else {
			toggleHelper($($toggleElement.find(ON_TEXT)), $($toggleElement.find(OFF_TEXT)), chrome.i18n.getMessage("on"));
		}
	}
	var IsNumber = function(fData)
	{
	    var reg = new RegExp("^[0-9]*$");
	    return reg.test(fData)
	}