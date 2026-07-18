// Nightlist Event Ticket Booking System

const EVENTS = [
    {
        id: 1,
        name: "Neon Nights",
        date: "20 July 2026",
        venue: "City Arena",
        basePrice: 500,
        seatsLeft: 40
    },
    {
        id: 2,
        name: "Sunset Beats",
        date: "22 July 2026",
        venue: "Beach Club",
        basePrice: 750,
        seatsLeft: 25
    },
    {
        id: 3,
        name: "Retro Rewind",
        date: "24 July 2026",
        venue: "City Hall",
        basePrice: 600,
        seatsLeft: 18
    }
];

const TIER_MULTIPLIER = {
    general: 1,
    premium: 1.5,
    vip: 2.2
};

//EVENT GRID

function renderEventGrid(container) {
    if (!container) {
        return;
    }

    container.innerHTML = EVENTS.map(function (event) {
        return `
            <div class="card p-6">
                <p class="text-paper/50 text-sm">${event.date}</p>

                <h2 class="font-display text-3xl text-gold mt-2">
                    ${event.name}
                </h2>

                <p class="text-paper/70 mt-2">
                    ${event.venue}
                </p>

                <p class="mt-4">
                    From ₹${event.basePrice}
                </p>

                <p class="text-paper/50 text-sm mt-1">
                    ${event.seatsLeft} seats left
                </p>

                <button
                    onclick="selectEvent(${event.id})"
                    class="mt-6 bg-gold text-ink font-semibold px-5 py-3 rounded"
                >
                    Book Now
                </button>
            </div>
        `;
    }).join("");
}


//SELECTION OF EVENT

function selectEvent(id) {
    const selectedEvent = EVENTS.find(function (event) {
        return event.id === id;
    });

    if (!selectedEvent) {
        return;
    }

    localStorage.setItem(
        "nightlist_selected_event",
        JSON.stringify(selectedEvent)
    );

    window.location.href = "booking.html";
}


//INITIATE BOOKING PAGE
function initBookingPage() {
    const bookingForm = document.getElementById("booking-form");

    if (!bookingForm) {
        return;
    }

    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const phoneInput = document.getElementById("phone");
    const ticketsInput = document.getElementById("tickets");
    const tierSelect = document.getElementById("tier");

    const priceEach = document.getElementById("price-each");
    const priceCount = document.getElementById("price-count");
    const priceTotal = document.getElementById("price-total");
    const formStatus = document.getElementById("form-status");

    

    // Get the selected event from localStorage
    const raw = localStorage.getItem("nightlist_selected_event");
    const event = raw ? JSON.parse(raw) : EVENTS[0];

    document.getElementById("sel-name").textContent = event.name;
    document.getElementById("sel-meta").textContent =
        `${event.date} · ${event.venue}`;

    function getTierMultiplier() {
        return TIER_MULTIPLIER[tierSelect.value];
    }

    function updatePrice() {
        const ticketCount = Number(ticketsInput.value) || 1;
        const pricePerTicket = Math.round(event.basePrice * getTierMultiplier());
        const total = pricePerTicket * ticketCount;

        priceEach.textContent = `₹${pricePerTicket}`;
        priceCount.textContent = `×${ticketCount}`;
        priceTotal.textContent = `₹${total}`;
    }

    function showError(fieldName, message) {
        const errorElement = document.querySelector(
            `.error-msg[data-for="${fieldName}"]`
        );

        if (errorElement) {
            errorElement.textContent = message;
        }
    }

    function clearErrors() {
        document.querySelectorAll(".error-msg").forEach(function (element) {
            element.textContent = "";
        });

        formStatus.textContent = "";
    }


    //GET THE SELECTED EVENT FROM LOCAL STORGE
    function validateForm() {
    clearErrors();

    let isValid = true;

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    const tickets = Number(ticketsInput.value);

    if (name.length < 3) {
        showError("name", "Please enter your full name.");
        isValid = false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        showError("email", "Please enter a valid email address.");
        isValid = false;
    }

    const phonePattern = /^\d{10}$/;

    if (!phonePattern.test(phone)) {
        showError("phone", "Please enter a valid 10-digit phone number.");
        isValid = false;
    }

    if (tickets < 1 || tickets > 8) {
        showError("tickets", "Please select between 1 and 8 tickets.");
        isValid = false;
    } else if (tickets > event.seatsLeft) {
        showError("tickets", `Only ${event.seatsLeft} seats left.`);
        isValid = false;
    }

    return isValid;
}


    //SAVE BOOKING
    function saveBooking() {
    const existingBookings =
        JSON.parse(localStorage.getItem("nightlist_bookings")) || [];

    const ticketCount = Number(ticketsInput.value);

    const pricePerTicket =
        event.basePrice * getTierMultiplier();

    const totalPrice = pricePerTicket * ticketCount;

    const booking = {
        eventName: event.name,
        eventDate: event.date,
        eventVenue: event.venue,
        customerName: nameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim(),
        ticketCount: ticketCount,
        tier: tierSelect.value,
        pricePerTicket: pricePerTicket,
        totalPrice: totalPrice
    };

    existingBookings.push(booking);

    localStorage.setItem(
        "nightlist_bookings",
        JSON.stringify(existingBookings)
    );
}

ticketsInput.addEventListener("input", updatePrice);
    tierSelect.addEventListener("change", updatePrice);

    bookingForm.addEventListener("submit", function (eventObject) {
        eventObject.preventDefault();

        if (!validateForm()) {
            formStatus.textContent =
                "Please correct the highlighted fields.";
            return;
        }

        saveBooking();

        event.seatsLeft -= Number(ticketsInput.value);

        localStorage.setItem(
            "nightlist_selected_event",
            JSON.stringify(event)
        );

        formStatus.textContent =
            "Booking completed successfully.";

        bookingForm.reset();
        updatePrice();
    });

    updatePrice();
} // End of initBookingPage()


// TICKET HISTORY

function renderTicketHistory() {
    const container = document.getElementById("ticket-list");
    const emptyState = document.getElementById("empty-state");

    if (!container) {
        return;
    }

    const history = JSON.parse(
        localStorage.getItem("nightlist_bookings") || "[]"
    );

    if (history.length === 0) {
        container.innerHTML = "";

        if (emptyState) {
            emptyState.classList.remove("hidden");
        }

        return;
    }

    if (emptyState) {
        emptyState.classList.add("hidden");
    }

    container.innerHTML = history.map(function (booking, index) {
        return `
           <div class="card p-6 max-w-lg mx-auto">
                <p class="text-paper/50 text-sm">
                    ${booking.eventDate}
                </p>

                <h2 class="font-display text-3xl text-gold mt-2">
                    ${booking.eventName}
                </h2>

                <p class="text-paper/70 mt-2">
                    ${booking.eventVenue}
                </p>

                <div class="mt-2 space-y-1">
                    <p>
                        Name: ${booking.customerName}
                    </p>

                    <p>
                        Tickets: ${booking.ticketCount}
                    </p>

                    <p>
                        Tier: ${booking.tier}
                    </p>

                    <p>
                        Price per ticket: ₹${booking.pricePerTicket}
                    </p>

                    <p class="font-semibold text-gold">
                        Total: ₹${booking.totalPrice}
                    </p>
                </div>

                <p class="text-sm text-paper/50 mt-5">
                    Booking ID: NL-${index + 1}
                </p>
            </div>
        `;
    }).join("");
}

// RUN FUNCTIONS AFTER THE PAGE LOADS

document.addEventListener("DOMContentLoaded", function () {
    initBookingPage();
    renderTicketHistory();
});




