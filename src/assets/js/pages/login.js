// assets/js/pages/login.js
document.addEventListener('DOMContentLoaded', () => {
  const signInTab  = document.getElementById('signInTab');
  const signUpTab  = document.getElementById('signUpTab');
  const signInForm = document.getElementById('signInForm');
  const signUpForm = document.getElementById('signUpForm');

  // bail if the page does not have these
  if (!signInForm || !signUpForm || !signInTab || !signUpTab) return;

  // ---------- helpers ----------
  const fieldEls = (form) => Array.from(form.querySelectorAll('.field'));
  const firstInvalidInput = (form) =>
    form.querySelector('.field .input-control:invalid') ||
    form.querySelector('.field.incorrect .input-control');

  const clearErrors = (form) => {
    delete form.dataset.submitted;
    fieldEls(form).forEach(f => f.classList.remove('incorrect'));
    // clear any customValidity we set, for example confirm password
    form.querySelectorAll('input,textarea,select').forEach(i => i.setCustomValidity(''));
  };

  const markErrorsAfterSubmit = (form) => {
    // confirm password rule, if those fields exist
    const pw  = form.querySelector('input[name="password"]');
    const cpw = form.querySelector('input[name="confirmPassword"]');
    if (pw && cpw) {
      cpw.setCustomValidity(cpw.value && pw.value !== cpw.value ? 'Passwords do not match' : '');
    }

    fieldEls(form).forEach((field) => {
      const input = field.querySelector('input, textarea, select');
      if (!input) return;
      const invalid = !input.checkValidity();
      field.classList.toggle('incorrect', invalid);
    });
  };

  const liveRefreshIfSubmitted = (form) => {
    if (form.dataset.submitted === 'true') markErrorsAfterSubmit(form);
  };

  // ---------- tab switching ----------
  const setTabActive = (tabBtn, active) => {
    tabBtn.classList.toggle('text-indigo-600', active);
    tabBtn.classList.toggle('border-indigo-500', active);
  };

  const showSignIn = () => {
    signInForm.classList.remove('hidden');
    signUpForm.classList.add('hidden');
    setTabActive(signInTab, true);
    setTabActive(signUpTab, false);
    clearErrors(signUpForm);   // reset hidden form
  };

  const showSignUp = () => {
    signUpForm.classList.remove('hidden');
    signInForm.classList.add('hidden');
    setTabActive(signUpTab, true);
    setTabActive(signInTab, false);
    clearErrors(signInForm);   // reset hidden form
  };

  signInTab.addEventListener('click', (e) => { e.preventDefault(); showSignIn(); });
  signUpTab.addEventListener('click', (e) => { e.preventDefault(); showSignUp(); });
  showSignIn(); // default

  // ---------- validation wiring, neutral until submit ----------
  const wireValidation = (form) => {
    // inputs clear red as user fixes them, but only after submit happened
    form.addEventListener('input', () => liveRefreshIfSubmitted(form));

    // keep Enter key submissions consistent
    form.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') liveRefreshIfSubmitted(form);
    });

    // handle Submit, show red only now
    form.addEventListener('submit', (e) => {
      form.dataset.submitted = 'true';
      markErrorsAfterSubmit(form);
      if (!form.checkValidity()) {
        e.preventDefault();
        e.stopPropagation();
        const first = firstInvalidInput(form);
        if (first) first.focus();
        return;
      }
      // success, clear any error styling so the next visit is neutral again
      clearErrors(form);
      // your real submit goes here, remove e.preventDefault if you post to server
      e.preventDefault();
      // demo only
      // console.log('OK submit', Object.fromEntries(new FormData(form).entries()));
    });

    // optional, handle form reset
    form.addEventListener('reset', () => clearErrors(form));
  };

  wireValidation(signInForm);
  wireValidation(signUpForm);

  // ---------- optional: message banner support like your tutorial ----------
  // If you keep a single #error-message element, this will show combined errors after submit.
  const errorBanner = document.getElementById('error-message');
  const collectErrors = (form) => {
    const msgs = [];
    const add = (el, msg) => { if (el && !el.checkValidity()) msgs.push(msg); };

    const get = (sel) => form.querySelector(sel);

    // sign in fields
    if (form === signInForm) {
      add(get('input[name="email"]'), 'Email is required or invalid');
      add(get('input[name="password"]'), 'Password is required');
    }

    // sign up fields
    if (form === signUpForm) {
      add(get('input[name="fullName"]'), 'Full name is required');
      const emailEl = get('input[name="email"]');
      add(emailEl, 'Email is required or invalid');
      const pw = get('input[name="password"]');
      const cp = get('input[name="confirmPassword"]');
      add(pw, 'Password is required and must be at least 8 characters');
      if (cp) {
        if (cp.value === '') msgs.push('Please confirm your password');
        else if (pw && pw.value !== cp.value) msgs.push('Passwords do not match');
      }
    }

    return msgs;
  };

  // hook banners to submit events
  [signInForm, signUpForm].forEach((form) => {
    form.addEventListener('submit', () => {
      if (!errorBanner) return;
      if (!form.checkValidity()) {
        const msgs = collectErrors(form);
        errorBanner.textContent = msgs.join('. ');
      } else {
        errorBanner.textContent = '';
      }
    });

    form.addEventListener('input', () => {
      if (!errorBanner) return;
      if (form.dataset.submitted === 'true') {
        const msgs = collectErrors(form);
        errorBanner.textContent = msgs.join('. ');
      }
    });
  });
});
