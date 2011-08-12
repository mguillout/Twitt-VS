Donnees = (function(){

  var rechercheGI = function(texte, callback) {
		var url = 'https://ajax.googleapis.com/ajax/services/search/images?v=1.0&rsz=8&q=%texte%&callback=?';
    url = url.replace('%texte%', escape(texte));
    $.getJSON(url, function(data) {
      callback(data);
    });
  };

  var rechercheTW = function(texte, callback) {
    var url = "http://search.twitter.com/search.json?callback=?&q=" + encodeURI(texte);
    $.getJSON(url, function(data) {
      callback(data);
    });
  };

  var toCancel = [];
  var oldRecherche = "";
  var recherche = function(texte, callbackI, callbackT){
    if (texte !== oldRecherche) {
      oldRecherche = texte;
      rechercheGI(texte, callbackI);
      rechercheTW(texte, callbackT);
      toCancel.forEach(function(e) { clearTimeout(e); });
      toCancel.push(setTimeout(function(){ rechercheTW(texte, callbackT); }, 30000));
    }
  };

  return {
    Recherche : recherche
  };
}());




UI = (function(){

  var ts = function(){
    return new Date().getTime();
  };

  var getUrlVars = function() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
      vars[key] = unescape(value);
    });
    return vars;
  }
    
  var keyupP = function(){
    var delta = 200,
        timeG = ts(), 
        toCancelG = [];

    var keyupPlus = function(elt, callback) {
      var time = ts();
      if (elt.val().length <= 1)
        timeG = ts();

      if (time - timeG > delta) {
        toCancelG.forEach(function(e){ clearTimeout(e);});
        timeG = time;
        if (elt.val().length >= 3) 
          callback();
      } else {
        timeG = time;
        toCancelG.forEach(function(e){ clearTimeout(e);});
        toCancelG.push(setTimeout(function(){ elt.trigger('keyup'); }, delta + 10));
      }
    };
    
    return keyupPlus;
  };

  var afficherImages = function(selecteur, data) {
    $(selecteur).html('');
    for(var i = 0; i <= 2; i++) {
      data.responseData.results.forEach(function(e){
        $('<img/>').attr('src', e.url)
                   .bind('load', function(e) {
                      $(this).css({width:$(selecteur).width() * 0.9 / 3, height:$(selecteur).width() * 0.9 /3});
                      if (Math.random() > 0.5) {
                        $(this).appendTo(selecteur);
                      } else {
                        $(this).prependTo(selecteur);
                      }
                   });
      });
    }
  };

  var ajouterTweet = function(selecteur, e) {
      var infos = "Tweeted by <b><a href='http://www.twitter.com/" + e.from_user + "'>" +  e.from_user + '</a></b> at ' + e.created_at.replace('+0000', '');
      var texte = e.text.replace(/(http[^\s]*)/, '<a href="$1">$1</a>'); 
      $('<div id="' + e.id_str + '"><div class="texte">' + texte + '</div><div class="infos">' + infos +  '</div></div>').addClass('message')
        .prependTo(selecteur).slideDown();
  };

  var toCancel = {};

  var afficherTweets = function(selecteur, data) {

    $(selecteur).html('');
    i = 0;
    if(!toCancel[selecteur]) {
      toCancel[selecteur] = [];
    }

    toCancel[selecteur].forEach(function(e){ clearTimeout(e); });

    data.results.reverse().forEach(function(e){
      if ($(selecteur).find('#' + e.id_str).length == 0) {
        toCancel[selecteur].push(setTimeout(function(){ajouterTweet(selecteur, e);}, i * 500));
        i++;
      }
    });
  }

  var actuG = function() {
       Donnees.Recherche($('.inputG input').val(), function(d){ afficherImages('.gauche', d);}, function(d) { afficherTweets('.contenuTG', d); } ); 
  };

  var actuD = function() {
       Donnees.Recherche($('.inputD input').val(), function(d){ afficherImages('.droite', d);}, function(d) { afficherTweets('.contenuTD', d); } ); 
  };
  var init = function(){

  var w = $('div.VS').width();
  var h = $('div.VS').height();
  $('div.VS').css({top: (document.height - 100 - h)/2, left: (document.width - w)/2});
   var keyupPlusG = keyupP();
   var keyupPlusD = keyupP();

   if (getUrlVars()["inputG"]) {
      $('.inputG input').val(getUrlVars()["inputG"]);
   }
   if (getUrlVars()["inputD"]) {
      $('.inputD input').val(getUrlVars()["inputD"]);
   }


   if ($('.inputG input').val().length > 3) {
     actuG();
   }
   
   if ($('.inputD input').val().length > 3) {
     actuD();
   }

   $('.inputG input').bind('keyup', function(e){
     var elt = $(this);
/*     keyupPlusG(elt, function(){ 
       actuG();
     });
*/
   });

   $('.inputD input').bind('keyup', function(e){
     var elt = $(this);
/*     keyupPlusG(elt, function(){ 
       actuD();
     });
*/
   });

   $('.run').bind('click', function(){
       document.location.href = "/index.html?" + "inputG=" + escape($('.inputG input').val()) + "&inputD=" + escape($('.inputD input').val());
    });
  };

  return {
    Init : init
  }
}());
