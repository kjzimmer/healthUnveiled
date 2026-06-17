// Client-side subscribe form handler with localStorage gate.
// Once subscribed, the form is replaced with a thank-you message on all future visits.

const STORAGE_KEY = 'hu_subscribed';

function showThankYou(form) {
  const msg = document.createElement('p');
  msg.className = 'follow-text';
  msg.style.fontStyle = 'italic';
  msg.textContent = 'Thank you — you\'ll hear from us when content launches.';
  form.replaceWith(msg);
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.email-form');
  if (!form) return;

  if (localStorage.getItem(STORAGE_KEY)) {
    showThankYou(form);
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const input = form.querySelector('input[type="email"]');
    const btn = form.querySelector('button');
    const email = input.value.trim();

    btn.disabled = true;
    btn.textContent = 'Sending…';

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem(STORAGE_KEY, '1');
        showThankYou(form);
      } else {
        btn.disabled = false;
        btn.textContent = 'Follow this project';
        input.setCustomValidity(data.error ?? 'Something went wrong');
        input.reportValidity();
      }
    } catch {
      btn.disabled = false;
      btn.textContent = 'Follow this project';
    }
  });
});
