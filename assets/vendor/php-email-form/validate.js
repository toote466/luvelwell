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
      var loadingEl = thisForm.querySelector('.loading');
      var errorEl = thisForm.querySelector('.error-message');
      var sentEl = thisForm.querySelector('.sent-message');
      if (loadingEl) loadingEl.classList.add('d-block');
      if (errorEl) errorEl.classList.remove('d-block');
      if (sentEl) sentEl.classList.remove('d-block');

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
    .then(text => {
      var loadingEl = thisForm.querySelector('.loading');
      if (loadingEl) loadingEl.classList.remove('d-block');

      // Try to parse JSON response (our PHP may return JSON), otherwise treat as plain text
      var parsed = null;
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        parsed = null;
      }

      var isSuccess = false;
      if (parsed && parsed.success) {
        isSuccess = true;
      } else if (typeof text === 'string' && text.trim() == 'OK') {
        isSuccess = true;
      }

      if (isSuccess) {
        // Prefer SweetAlert2 if available
        try {
          if (typeof Swal !== 'undefined') {
            Swal.fire({
              icon: 'success',
              title: '¡Tu mensaje ha sido enviado correctamente!',
              text: 'Pronto nos contactaremos contigo.',
              timer: 3000,
              showConfirmButton: false
            });
          } else {
            showSuccessBanner('¡Tu mensaje ha sido enviado correctamente! Pronto nos contactaremos contigo.');
          }
        } catch (e) {
          showSuccessBanner('¡Tu mensaje ha sido enviado correctamente! Pronto nos contactaremos contigo.');
        }

        thisForm.reset();
      } else {
        throw new Error(text ? text : 'Form submission failed and no error message returned from: ' + action);
      }
    })
    .catch((error) => {
      displayError(thisForm, error);
    });
  }

  function displayError(thisForm, error) {
    var loadingEl = thisForm.querySelector('.loading');
    if (loadingEl) loadingEl.classList.remove('d-block');
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
