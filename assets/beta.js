// Beta sign-up forms on the landing page, plus the one scroll-triggered
// animation. No dependencies; the page works without this file except that
// the form cannot be sent.
(function () {
  'use strict';

  var TEXT = {
    en: {
      hint: {
        android: 'Use the email of your Google account. Google Play lets testers in by that address.',
        ios: 'The iPhone beta opens on TestFlight after the Android one. We will email you when it does.'
      },
      sending: 'Joining…',
      invalid: 'That email address does not look right. Check it and try again.',
      throttled: 'Too many sign-ups from this network. Try again in an hour.',
      failed: 'The sign-up did not go through. Try again in a moment, or write to wordker@szymion.dev.',
      offline: 'Could not reach the server. Check your connection and try again.',
      done: {
        android: 'We sent a confirmation to {email}. Your Google Play invite will arrive at the same address.',
        ios: 'We sent a confirmation to {email}. Your TestFlight invite will arrive at the same address once the iPhone beta opens.'
      }
    },
    pl: {
      hint: {
        android: 'Podaj adres swojego konta Google. Google Play wpuszcza testerów właśnie po tym adresie.',
        ios: 'Beta na iPhone’a ruszy w TestFlight po wersji na Androida. Damy znać mailem.'
      },
      sending: 'Zapisuję…',
      invalid: 'Ten adres e-mail wygląda na błędny. Sprawdź go i spróbuj ponownie.',
      throttled: 'Za dużo zapisów z tej sieci. Spróbuj ponownie za godzinę.',
      failed: 'Zapis się nie udał. Spróbuj za chwilę albo napisz na wordker@szymion.dev.',
      offline: 'Nie udało się połączyć z serwerem. Sprawdź połączenie i spróbuj ponownie.',
      done: {
        android: 'Wysłaliśmy potwierdzenie na {email}. Zaproszenie z Google Play przyjdzie na ten sam adres.',
        ios: 'Wysłaliśmy potwierdzenie na {email}. Zaproszenie do TestFlight przyjdzie na ten sam adres, gdy ruszy beta na iPhone’a.'
      }
    }
  };

  var lang = document.documentElement.lang === 'pl' ? 'pl' : 'en';
  var t = TEXT[lang];
  var forms = Array.prototype.slice.call(document.querySelectorAll('form.beta-form'));
  var onIos = /iPhone|iPad|iPod/.test(navigator.userAgent);

  // Local previews may point the form at another backend with ?api=<origin>.
  function endpoint(form) {
    var local = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
    var override = local && new URLSearchParams(location.search).get('api');
    return override ? override.replace(/\/$/, '') + '/api/beta/signup/' : form.action;
  }

  function showDone(email, platform) {
    forms.forEach(function (form) {
      form.querySelector('.beta-done p').textContent = t.done[platform].replace('{email}', email);
      form.classList.add('is-done');
    });
  }

  forms.forEach(function (form) {
    var email = form.elements.email;
    var button = form.querySelector('button[type="submit"]');
    var hint = form.querySelector('.beta-hint');
    var status = form.querySelector('.beta-status');
    var label = button.textContent;

    function syncHint() { hint.textContent = t.hint[form.elements.platform.value]; }

    function fail(message) {
      status.textContent = message;
      button.disabled = false;
      button.textContent = label;
    }

    if (onIos) form.elements.platform.value = 'ios';
    syncHint();
    form.addEventListener('change', syncHint);
    email.addEventListener('input', function () {
      email.removeAttribute('aria-invalid');
      status.textContent = '';
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var address = email.value.trim();
      var platform = form.elements.platform.value;

      if (!address || !email.checkValidity()) {
        email.setAttribute('aria-invalid', 'true');
        fail(t.invalid);
        email.focus();
        return;
      }

      status.textContent = '';
      button.disabled = true;
      button.textContent = t.sending;

      // A form-encoded POST is a "simple" cross-origin request: the browser
      // sends it without a preflight, which the API does not answer.
      fetch(endpoint(form), {
        method: 'POST',
        body: new URLSearchParams({
          email: address,
          platform: platform,
          language: lang,
          website: form.elements.website.value
        })
      }).then(function (response) {
        if (response.ok) {
          showDone(address, platform);
          form.querySelector('.beta-done').focus();
        } else if (response.status === 400) {
          email.setAttribute('aria-invalid', 'true');
          fail(t.invalid);
        } else if (response.status === 429) {
          fail(t.throttled);
        } else {
          fail(t.failed);
        }
      }).catch(function () {
        fail(t.offline);
      });
    });
  });

  // Draw the swipe path once the steps are a quarter of the way up the screen.
  // The wrapper is observed rather than the path, whose own clip-path would
  // keep it from ever counting as visible.
  var path = document.querySelector('.steps-path');
  if (path && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        path.classList.add('is-drawn');
        observer.disconnect();
      }
    }, { rootMargin: '0px 0px -25% 0px' });
    observer.observe(path.parentNode);
  } else if (path) {
    path.classList.add('is-drawn');
  }
})();
