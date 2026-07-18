// Nightlist Event Ticket Booking System

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

    // Temporary base price until event data is connected
    const basePrice = 500;

    function getTierMultiplier() {
        if (tierSelect.value === "premium") {
            return 1.5;
        }

        if (tierSelect.value === "vip") {
            return 2.2;
        }

        return 1;
    }

    function updatePrice() {
        const ticketCount = Number(ticketsInput.value) || 1;
        const pricePerTicket = Math.round(basePrice * getTierMultiplier());
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
        }

        return isValid;
    }

    function saveBooking() {
        const ticketCount = Number(ticketsInput.value);
        const pricePerTicket = Math.round(basePrice * getTierMultiplier());

        const booking = {
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            phone: phoneInput.value.trim(),
            tickets: ticketCount,
            tier: tierSelect.value,
            pricePerTicket: pricePerTicket,
            totalPrice: pricePerTicket * ticketCount,
            bookedAt: new Date().toISOString()
        };

        localStorage.setItem("nightlistBooking", JSON.stringify(booking));
    }

    ticketsInput.addEventListener("input", updatePrice);
    tierSelect.addEventListener("change", updatePrice);

    bookingForm.addEventListener("submit", function (event) {
        event.preventDefault();

        if (!validateForm()) {
            formStatus.textContent = "Please correct the errors above.";
            return;
        }

        saveBooking();

        formStatus.textContent = "Booking saved successfully.";
        bookingForm.reset();
        ticketsInput.value = 1;
        updatePrice();
    });

    updatePrice();
}






