// ---------- Event data ----------
const EVENTS = [
  { id: 'ev1', name: 'Midnight Frequencies', date: 'Fri, 18 Jul · 8:00 PM', venue: 'Rooftop Arena, Bengaluru', basePrice: 899, seatsLeft: 42, tag: 'Live Music' },
  { id: 'ev2', name: 'Startup Sprint: Demo Night', date: 'Sat, 19 Jul · 6:30 PM', venue: 'Innovation Hub, Whitefield', basePrice: 349, seatsLeft: 18, tag: 'Tech' },
  { id: 'ev3', name: 'Stand-Up Circuit Vol. 4', date: 'Sun, 20 Jul · 7:00 PM', venue: 'The Attic Club', basePrice: 599, seatsLeft: 6, tag: 'Comedy' },
];

const TIER_MULTIPLIER = { general: 1, premium: 1.5, vip: 2.2 };

// ---------- Home page: render event grid ----------
function renderEventGrid(container) {
  container.innerHTML = EVENTS.map(ev => `
    <div class="event-card">
      <span class="eyebrow">${ev.tag}</span>
      <h3 class="font-display text-3xl leading-none">${ev.name}</h3>
      <p class="text-paper/60 text-sm">${ev.date}</p>
      <p class="text-paper/60 text-sm">${ev.venue}</p>
      <div class="flex items-center justify-between pt-3 mt-auto border-t border-white/10">
        <div>
          <p class="text-xs text-paper/40">from</p>
          <p class="text-gold font-semibold">₹${ev.basePrice}</p>
        </div>
        <button class="btn-primary text-sm" onclick="selectEvent('${ev.id}')">Book now</button>
      </div>
      <p class="text-xs text-paper/40">${ev.seatsLeft} seats left</p>
    </div>
  `).join('');
}

function selectEvent(id) {
  const ev = EVENTS.find(e => e.id === id);
  localStorage.setItem('nightlist_selected_event', JSON.stringify(ev));
  window.location.href = 'booking.html';
}

// ---------- Booking page ----------
function initBookingPage() {
  const raw = localStorage.getItem('nightlist_selected_event');
  const event = raw ? JSON.parse(raw) : EVENTS[0];

  document.getElementById('sel-name').textContent = event.name;
  document.getElementById('sel-meta').textContent = `${event.date} · ${event.venue}`;

  const form = document.getElementById('booking-form');
  const ticketsInput = document.getElementById('tickets');
  const tierSelect = document.getElementById('tier');

  function updatePrice() {
    const tickets = Math.max(1, parseInt(ticketsInput.value) || 1);
    const multiplier = TIER_MULTIPLIER[tierSelect.value];
    const each = Math.round(event.basePrice * multiplier);
    const total = each * tickets;
    document.getElementById('price-each').textContent = `₹${each}`;
    document.getElementById('price-count').textContent = `×${tickets}`;
    document.getElementById('price-total').textContent = `₹${total}`;
  }
  ticketsInput.addEventListener('input', updatePrice);
  tierSelect.addEventListener('change', updatePrice);
  updatePrice();

  function showError(field, message) {
    const input = document.getElementById(field);
    const msg = document.querySelector(`.error-msg[data-for="${field}"]`);
    input.classList.add('field-invalid');
    msg.textContent = message;
  }
  function clearError(field) {
    const input = document.getElementById(field);
    const msg = document.querySelector(`.error-msg[data-for="${field}"]`);
    input.classList.remove('field-invalid');
    msg.textContent = '';
  }

  function validate() {
    let valid = true;
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const tickets = parseInt(ticketsInput.value);

    ['name', 'email', 'phone', 'tickets'].forEach(clearError);

    if (name.length < 2) { showError('name', 'Enter your full name (min 2 characters).'); valid = false; }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) { showError('email', 'Enter a valid email address.'); valid = false; }

    const phoneRe = /^\d{10}$/;
    if (!phoneRe.test(phone)) { showError('phone', 'Enter a 10-digit phone number.'); valid = false; }

    if (!tickets || tickets < 1 || tickets > 8) {
      showError('tickets', 'Choose between 1 and 8 tickets.'); valid = false;
    } else if (tickets > event.seatsLeft) {
      showError('tickets', `Only ${event.seatsLeft} seats left.`); valid = false;
    }

    return valid;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const status = document.getElementById('form-status');
    if (!validate()) {
      status.textContent = 'Please fix the errors above.';
      status.className = 'text-sm text-center min-h-[1.25rem] text-red-400';
      return;
    }

    const tickets = parseInt(ticketsInput.value);
    const multiplier = TIER_MULTIPLIER[tierSelect.value];
    const each = Math.round(event.basePrice * multiplier);

    const booking = {
      id: 'TKT-' + Date.now().toString(36).toUpperCase(),
      eventName: event.name,
      date: event.date,
      venue: event.venue,
      name: document.getElementById('name').value.trim(),
      tickets,
      tier: tierSelect.value,
      total: each * tickets,
      bookedAt: new Date().toLocaleString(),
    };

    const history = JSON.parse(localStorage.getItem('nightlist_bookings') || '[]');
    history.unshift(booking);
    localStorage.setItem('nightlist_bookings', JSON.stringify(history));

    status.textContent = 'Booking confirmed! Redirecting to your ticket…';
    status.className = 'text-sm text-center min-h-[1.25rem] text-gold';
    setTimeout(() => { window.location.href = 'summary.html'; }, 900);
  });
}

// ---------- Summary page ----------
function renderTicketHistory() {
  const history = JSON.parse(localStorage.getItem('nightlist_bookings') || '[]');
  const list = document.getElementById('ticket-list');
  const empty = document.getElementById('empty-state');

  if (history.length === 0) {
    empty.classList.remove('hidden');
    return;
  }

  list.innerHTML = history.map(b => `
    <div class="ticket">
      <div class="ticket-main">
        <p class="eyebrow">${b.id}</p>
        <h3 class="font-display text-3xl">${b.eventName}</h3>
        <p class="text-paper/60 text-sm mt-1">${b.date} · ${b.venue}</p>
        <div class="flex flex-wrap gap-x-6 gap-y-1 mt-3 text-sm text-paper/70">
          <span>Guest: ${b.name}</span>
          <span>Tier: ${b.tier}</span>
          <span>Tickets: ${b.tickets}</span>
          <span class="text-gold font-semibold">₹${b.total}</span>
        </div>
        <p class="text-paper/30 text-xs mt-2">Booked ${b.bookedAt}</p>
      </div>
      <div class="ticket-stub">
        <span class="ticket-code">ADMIT ${b.tickets}</span>
      </div>
    </div>
  `).join('');
}
