/**
* PHP Email Form Validation - v3.11
* URL: https://bootstrapmade.com/php-email-form/
* Author: BootstrapMade.com
*/
(function () {
  "use strict";

  let forms = document.querySelectorAll('.php-email-form');

  forms.forEach( function(e) {
    e.addEventListener('submit', function(event) {
      event.preventDefault();

      let thisForm = this;

      // Ensure any previously shown toast is removed from the DOM before sending
      try {
        var existingToast = document.getElementById('php-email-toast');
        if (existingToast) {
          if (existingToast.remove) existingToast.remove();
          else if (existingToast.parentNode) existingToast.parentNode.removeChild(existingToast);
        }
      } catch (e) {}

      let action = thisForm.getAttribute('action');
      let recaptcha = thisForm.getAttribute('data-recaptcha-site-key');
      
      if( ! action ) {
        return;
      }
      thisForm.querySelector('.loading').classList.add('d-block');
      thisForm.querySelector('.error-message').classList.remove('d-block');
      thisForm.querySelector('.sent-message').classList.remove('d-block');

      let formData = new FormData( thisForm );

      if ( recaptcha ) {
        if(typeof grecaptcha !== "undefined" ) {
          grecaptcha.ready(function() {
            try {
              grecaptcha.execute(recaptcha, {action: 'php_email_form_submit'})
              .then(token => {
                formData.set('recaptcha-response', token);
                php_email_form_submit(thisForm, action, formData);
              })
            } catch(error) {
              displayError(thisForm, error);
            }
          });
        } else {
          displayError(thisForm, 'The reCaptcha javascript API url is not loaded!')
        }
      } else {
        php_email_form_submit(thisForm, action, formData);
      }
    });
  });

  function php_email_form_submit(thisForm, action, formData) {
    fetch(action, {
      method: 'POST',
      body: formData,
      headers: {'X-Requested-With': 'XMLHttpRequest'}
    })
    .then(response => {
      console.debug(response);
      if( response.ok ) {
        return response.text();
      } else {
        throw new Error(`${response.status} ${response.statusText} ${response.url}`); 
      }
    })
    .then(data => {
      thisForm.querySelector('.loading').classList.remove('d-block');
      if (data.trim() == 'OK') {
        var sent = thisForm.querySelector('.sent-message');
        if (sent) {
          sent.classList.remove('d-block');
        }
        showSuccessBanner('¡Tu mensaje ha sido enviado correctamente! Pronto nos contactaremos contigo.');
        thisForm.reset(); 
      } else {
        throw new Error(data ? data : 'Form submission failed and no error message returned from: ' + action); 
      }
    })
    .catch((error) => {
      displayError(thisForm, error);
    });
  }

  function displayError(thisForm, error) {
    thisForm.querySelector('.loading').classList.remove('d-block');
    // Hide the specific "form action" message if present, otherwise show the error
    var message = '';
    try {
      message = (typeof error === 'string') ? error : (error && error.message ? error.message : String(error));
    } catch(e) {
      message = '';
    }
    if (message.toLowerCase().indexOf('form action') !== -1) {
      // do not display the message about missing form action
      thisForm.querySelector('.error-message').innerHTML = '';
      thisForm.querySelector('.error-message').classList.remove('d-block');
      return;
    }
    thisForm.querySelector('.error-message').innerHTML = message;
    thisForm.querySelector('.error-message').classList.add('d-block');
  }

  // Show a temporary toast/banner for successful submissions
  function showSuccessBanner(message) {
    try {
      var id = 'php-email-toast';
      var el = document.getElementById(id);
      if (!el) {
        el = document.createElement('div');
        el.id = id;
        el.className = 'php-email-toast';
        document.body.appendChild(el);
      }
      el.innerText = message;
      el.classList.add('show');
      // remove after 6 seconds
      setTimeout(function() {
        el.classList.remove('show');
      }, 6000);
    } catch (e) {
      // fallback: show sent-message inline
      var formsent = document.querySelectorAll('.php-email-form .sent-message');
      if (formsent && formsent.length) {
        formsent.forEach(function(fs) {
          fs.innerHTML = message;
          fs.classList.add('d-block');
        });
      }
    }
  }

})();
