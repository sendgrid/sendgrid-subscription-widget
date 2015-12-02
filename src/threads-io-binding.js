(function() {
  var threads_ref;
  if (typeof threads != 'undefined')
    threads_ref = threads;

  if (typeof window.threads != 'undefined')
    threads_ref = window.threads;

  if (typeof threads_ref != 'undefined')
  {
    var widgets = document.getElementsByClassName("sendgrid-subscription-widget");
    for(var i = 0; i < widgets.length; i++)
    {
      (function (_widget) {
        _widget.addEventListener("success", function(e)
        {
          var fields = e.srcElement.getElementsByTagName("input");
          var email = "";

          for(var j = 0; j < fields.length; j++)
          {
            if(fields[j].name == "email")
            {
              email = fields[j].value;
              break;
            }
          }

          var eventTrack = {
            id: _widget.getAttribute("data-token"),
            email: email
          }

          if ((typeof eventTrack.id != 'undefined') || (typeof eventTrack.email != 'undefined'))
          {
            threads_ref.track('Subscribed to Newsletter', eventTrack);
          }
        });
      })(widgets[i]);
    }
  }
})();
