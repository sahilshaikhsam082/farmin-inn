/* =========================================================
   Farming Inn — site scripts
   ========================================================= */

// ---- Edit these before going live ----
const CONFIG = {
  whatsappNumber: '910000000000',          // country code + number, digits only
  phoneDisplay: '+91 00000 00000',
  email: 'hello@farming-inn.com',
  reservationsEmail: 'reservations@farming-inn.com'
};

document.addEventListener('DOMContentLoaded', () => {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  // ---------- Contact details from config ----------
  $$('.js-phone').forEach(a => { a.href = 'tel:+' + CONFIG.whatsappNumber; a.textContent = CONFIG.phoneDisplay; });
  $$('.js-email').forEach(a => { a.href = 'mailto:' + CONFIG.email; a.textContent = CONFIG.email; });
  $$('.js-wa').forEach(a => { a.href = 'https://wa.me/' + CONFIG.whatsappNumber; a.target = '_blank'; a.rel = 'noopener'; });

  // ---------- Preloader ----------
  const hidePreloader = () => $('#preloader')?.classList.add('done');
  window.addEventListener('load', hidePreloader);
  setTimeout(hidePreloader, 2500); // fallback if an image is slow

  // ---------- Year ----------
  $('#year').textContent = new Date().getFullYear();

  // ---------- Navbar on scroll + back to top ----------
  const nav = $('#mainNav');
  const toTop = $('.back-to-top');
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 60);
    toTop.classList.toggle('show', y > 600);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Collapse mobile menu after clicking a link
  const navMenu = $('#navMenu');
  $$('#navMenu a').forEach(link => link.addEventListener('click', () => {
    if (navMenu.classList.contains('show')) bootstrap.Collapse.getOrCreateInstance(navMenu).hide();
  }));

  // ---------- Reveal on scroll ----------
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  // Stagger siblings inside a row so cards cascade in
  $$('.reveal').forEach(el => {
    const siblings = el.parentElement ? $$(':scope > .reveal', el.parentElement) : [];
    const idx = siblings.indexOf(el);
    if (idx > 0) el.style.transitionDelay = `${Math.min(idx, 6) * 90}ms`;
    io.observe(el);
  });

  // ---------- Hero parallax ----------
  const heroBg = $('.hero-bg');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (heroBg && !reduceMotion) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y < window.innerHeight) heroBg.style.translate = `0 ${y * 0.3}px`;
    }, { passive: true });
  }

  // ---------- Toast helper ----------
  const toastEl = $('#siteToast');
  const toast = bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 4000 });
  const notify = msg => { $('.toast-body', toastEl).textContent = msg; toast.show(); };

  // ---------- Dates ----------
  const iso = d => d.toISOString().slice(0, 10);
  const today = new Date();
  const tomorrow = new Date(Date.now() + 864e5);
  const setupDatePair = (inEl, outEl) => {
    inEl.min = iso(today);
    outEl.min = iso(tomorrow);
    inEl.addEventListener('change', () => {
      if (!inEl.value) return;
      const next = new Date(inEl.value);
      next.setDate(next.getDate() + 1);
      outEl.min = iso(next);
      if (!outEl.value || outEl.value <= inEl.value) outEl.value = iso(next);
      outEl.dispatchEvent(new Event('change'));
    });
  };
  setupDatePair($('#qbIn'), $('#qbOut'));
  setupDatePair($('#bIn'), $('#bOut'));

  const nights = (a, b) => Math.round((new Date(b) - new Date(a)) / 864e5);

  // ---------- Quick booking bar -> full form ----------
  $('#quickBook').addEventListener('submit', e => {
    e.preventDefault();
    const qIn = $('#qbIn').value, qOut = $('#qbOut').value;
    if (!qIn || !qOut) { notify('Please choose your check-in and check-out dates.'); return; }
    $('#bIn').value = qIn;
    $('#bOut').value = qOut;
    $('#bGuests').value = $('#qbGuests').value;
    updateNights();
    $('#book').scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => $('#bName').focus({ preventScroll: true }), 700);
  });

  // "Book this room" links preselect the room type
  $$('.room-link[data-room]').forEach(link => link.addEventListener('click', () => {
    $('#bRoom').value = link.dataset.room;
  }));

  // ---------- Booking form ----------
  const form = $('#bookingForm');
  const note = $('#nightsNote');
  const updateNights = () => {
    const a = $('#bIn').value, b = $('#bOut').value;
    const n = a && b ? nights(a, b) : 0;
    note.textContent = n > 0 ? `${n} night${n > 1 ? 's' : ''} selected${n >= 2 ? ' · 15% opening offer applies' : ''}` : '';
  };
  $('#bIn').addEventListener('change', updateNights);
  $('#bOut').addEventListener('change', updateNights);

  form.addEventListener('submit', e => {
    e.preventDefault();
    const via = e.submitter?.dataset.via || 'whatsapp';
    const outEl = $('#bOut');
    outEl.setCustomValidity($('#bIn').value && outEl.value && outEl.value <= $('#bIn').value ? 'invalid' : '');

    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      form.querySelector(':invalid')?.focus();
      return;
    }

    const data = {
      Name: $('#bName').value.trim(),
      Phone: $('#bPhone').value.trim(),
      Email: $('#bEmail').value.trim(),
      'Check in': $('#bIn').value,
      'Check out': $('#bOut').value,
      Nights: nights($('#bIn').value, $('#bOut').value),
      Room: $('#bRoom').value,
      Guests: $('#bGuests').value,
      Requests: $('#bMsg').value.trim() || '-'
    };
    const body = 'Hello Farming Inn, I would like to request a booking:\n\n' +
      Object.entries(data).map(([k, v]) => `${k}: ${v}`).join('\n');

    const url = via === 'email'
      ? `mailto:${CONFIG.reservationsEmail}?subject=${encodeURIComponent('Booking request - ' + data.Name)}&body=${encodeURIComponent(body)}`
      : `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(body)}`;

    if (via === 'email') window.location.href = url;
    else window.open(url, '_blank', 'noopener');
    notify('Your request is ready to send. We will confirm within a few hours.');
    form.reset();
    form.classList.remove('was-validated');
    note.textContent = '';
  });

  // ---------- Newsletter ----------
  $('#newsletter').addEventListener('submit', e => {
    e.preventDefault();
    notify('Thank you for subscribing. Harvest news is on its way.');
    e.target.reset();
  });

  // ---------- Gallery lightbox ----------
  const items = $$('.g-item');
  const lb = $('#lightbox');
  const lbImg = $('img', lb);
  const lbCap = $('figcaption', lb);
  let current = 0;
  let lastFocus = null;

  const show = i => {
    current = (i + items.length) % items.length;
    const it = items[current];
    lbImg.src = it.href;
    lbImg.alt = it.dataset.caption || '';
    lbCap.textContent = it.dataset.caption || '';
  };
  const open = i => {
    lastFocus = document.activeElement;
    show(i);
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    $('.lb-close', lb).focus();
  };
  const close = () => {
    lb.hidden = true;
    document.body.style.overflow = '';
    lastFocus?.focus();
  };

  items.forEach((it, i) => it.addEventListener('click', e => { e.preventDefault(); open(i); }));
  $('.lb-close', lb).addEventListener('click', close);
  $('.lb-prev', lb).addEventListener('click', () => show(current - 1));
  $('.lb-next', lb).addEventListener('click', () => show(current + 1));
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  document.addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });

  // Swipe on touch devices
  let touchX = null;
  lb.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    touchX = null;
  });
});
