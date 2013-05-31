(function(){
    
    function navigateTo( url ) {
        
        chrome.tabs.getSelected( null, function( tab ) {
            
            chrome.tabs.update( tab.id, { url: url } );
        } );
    };
    
    function setDefaultSuggestion( text ) {
        
        if ( text ) {
            
            chrome.omnibox.setDefaultSuggestion( { "description":"<url><match>Tìm truyện ngắn</match></url> " + text } );
        } else {
            
            chrome.omnibox.setDefaultSuggestion( { "description":"<url><match>Tìm truyện ngắn</match></url>" } );
        }
    };
    
    
    chrome.omnibox.onInputCancelled.addListener(function() {
        setDefaultSuggestion( '' );
    });
    
    setDefaultSuggestion( '' );
    chrome.omnibox.onInputChanged.addListener( function( text, suggest_callback ) {
      
        setDefaultSuggestion( text );
        if( !text ) {

            return;
        }
        
        var suggestions = [];
        suggestions.push( { "content" : "ok", 
                "description" : "ok too"
              });
        suggest_callback( suggestions );
    });
    
    chrome.omnibox.onInputEntered.addListener( function( text ) {
        navigateTo( "http://muatocroi.com/?s="+encodeURIComponent( text ) );
    });
})();