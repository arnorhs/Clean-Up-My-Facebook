window.myFacebook = (function(window,undefined) {


  var loadJQuery = (function(){
    var jQueryLoaded = false;

    var load = function () {
      var script = document.createElement('script');
      script.src = 'http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js';
      script.type = 'text/javascript';
      document.getElementsByTagName('head')[0].appendChild(script);
      jQueryLoaded = true;
    }

    return function () {
      if (!jQueryLoaded) {
        load();
      }
    };
  })();


  function MyFriend (fbid) {
    this.fbid = fbid;
    this.json = {};
    this.isAPerson = null;
  }
  MyFriend.prototype.fetch = function (friendDataComplete) {
    // close over so we don't have race conditions
    (function(fbFriend){
      $.ajax({
        url: 'http://graph.facebook.com/'+fbFriend.fbid,
        dataType: 'json',
        success: function(data){
          fbFriend.isAPerson = !!data['last_name'];
          fbFriend.json = data;
          if ($.isFunction(friendDataComplete)) {
            friendDataComplete.call(window,fbFriend);
          }
        }
      });
    })(this);
  };

  parseFacebookURL = function (url) {
    var profile;
    if (!url || url.length < 1) return '';
    // match whatever is behind the last trailing slash
    url = url.match(/^.*\/(.*)$/)[1];
    // it may be a url of the format profile.php?id=<fbid>
    if (profile = url.match(/profile\.php\?id\=(\d*)/)) { 
      url = profile[1];
    }
    return url;
  };



  // Actual code:

  var myFriends = {},
      cachedStories = [],
      timer;

  function storyRun () {
    $('li.uiStreamStory').each(function(){
      var $story = $(this);
      if (!!$story.data('fbStoryParsed')) return;
      $story.data('fbStoryParsed',true);
      var fbid = parseFacebookURL($story.find('a.actorPhoto').attr('href'));
      if (!fbid) return;
      if (myFriends[fbid] === undefined) {
        myFriends[fbid] = new MyFriend(fbid);
        // callback is triggered when friend data is complete
        myFriends[fbid].fetch(function(thisFriend){
          if (!thisFriend.isAPerson) {
            $story.fadeOut();
          }
        });
      } else if (!myFriends[fbid].isAPerson) {
        $story.fadeOut();
      }
    });
  }

  function startTimer(seconds) {
    loadJQuery();
    timer = setInterval(function () {
      if (window.jQuery !== undefined) {
        storyRun();
      }
    }, seconds*1000);
  }

  function stopTimer() {
    clearInterval(timer);
  }

  return {
    startTimer: startTimer,
    stopTimer: stopTimer
  }

})(window);

window.myFacebook.startTimer(5);

