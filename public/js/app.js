(function($){
  $(document).ready(function(){

    if ($('#map').length) {
      // WIMR is simply an application namespace,
      // defined in /views/index.ejs
      WIMR.map = WIMR.createMap('map');
  
      WIMR.dialog.showTemplate('search_form');
      
      $('body').on('click', '.start-over', function(e){
        e.preventDefault();
        WIMR.map.wimrReset();
        WIMR.dialog.showTemplate('search_form');
        window.location.hash = "";
      });
      
      WIMR.reflow();
      $(window).on('resize', function(){
        clearTimeout(WIMR.resizeTimer);
        WIMR.resizeTimer = setTimeout(function(){
          WIMR.reflow();
        }, 250);
      });
    }
    
    $('form#email_form').submit(WIMR.emailFormHandler);

    $('form#contact-form').submit(WIMR.contactFormHandler);
    
    WIMR.reflow();
    $(window).on('resize', function(){
      clearTimeout(WIMR.resizeTimer);
      WIMR.resizeTimer = setTimeout(function(){
        WIMR.reflow();
      }, 250);
    })
    
    $(window).on('hashchange', WIMR.dialog.hashChange);
  })
})(jQuery);


/*******************
 * generic helpers
 * *****************/

/**
 * formats a short address from the
 * full address returned by the google
 * maps api
 */
WIMR.shortAddress = function(gAddr) {
  var addr = gAddr.address_components[0].short_name;
  addr += " ";
  addr += gAddr.address_components[1].short_name;
  return addr;
}

WIMR.reflow = function() {
  if (!WIMR.map) return;
  
  var contentWidth = $("#viewContent").outerWidth();
  var windowWidth  = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  if (contentWidth < (windowWidth * .75)) {
    var winH = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
    var navH = $("#main_nav").outerHeight(true);
    var contentHeight = winH - navH;
    $('#map').height(contentHeight);
    $('#viewWrapper').height(contentHeight).css('overflowX','auto');
  } else {
    $("#map").height(200);
    $("#viewWrapper").height('auto');
  }
  
  setTimeout(function(){
    WIMR.map.invalidateSize();
  });
}

WIMR.emailFormHandler = function(e){
  
  e.preventDefault();
  
  var $form = $(this);
  var action = $(this).attr('action');
  var email = $(this).find('#email_address').val();
  var $respText = $(this).find('.response');

  
  if (!email) {
    $respText.html("Please provide your email address");
    return;
  }
  
  $form.wimrLoading();
  $.post(action, {email: email}, function(resp){
    $form.wimrLoading('clear');
    var clearForm = false;
    switch (resp.status) {
      case 'success':
        var response = "<strong>Thanks!</strong> " ;
        response += "We've added " + resp.contact.email + " to our mailing list.";
        clearForm = true;
        break;
      
      case 'duplicate':
        var response = "<strong>Thanks!</strong> " ;
        response += "We already have " + email + " on our mailing list.";
        clearForm = true;
        break;
      
      default:
        var response = "<strong>Oh no! An error occurred!</strong> ";
        response += "<br>" + resp.message;
        break;
    }

    $respText.html(response);
    if (clearForm) {
      $('#email_address').val('');
    }
  });
}

WIMR.formatDate = function(date) {
  date = new Date(date);
  var months = ["January", "Feburary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var d = date.getDate();
  var m = months[ date.getMonth() ];
  var y = date.getFullYear();
  return m + " " + d + ", " + y;
}

WIMR.contactFormHandler = function (e) {

  e.preventDefault();

  var $form = $(this)
    , action = $(this).attr('action')
    , $resMsg = $(document).find('#response')
    , data = {
        name: $form.find('#name').val(),
        email: $form.find('#email').val(),
        subject: $form.find('#subject').val(),
        message: $form.find('#message').val() 
    }
    ;
  
  $form.wimrLoading();
  
  $.post(action, data, function (res) {
    $form.wimrLoading('clear');
    var clearForm = false;
    if (res.status == "200") {
      var response = "<strong>Thanks!</strong> Your message has been sent!";
      $resMsg.html(response);
      $resMsg.addClass('bg-success');
      clearForm = true;      
    } else {
      var response = "<strong>Oh no! An error occurred!</strong> ";
      response += "<br>" + res.message;
      $resMsg.html(response);
      $resMsg.addClass('bg-danger');
    }
    if (clearForm) {
      $('#name').val('');
      $('#email').val('');
      $('#message').val('');
    }
  });

};
