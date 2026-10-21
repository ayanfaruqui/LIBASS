/* ================================================================
   LIBASS — Booking Calendar & Form Module
   Interactive calendar, date selection, time slots, form submission
   ================================================================ */

(function () {
    'use strict';

    // ── State ──
    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();
    let selectedDate = null;
    let selectedTimeSlot = null;

    // Simulated booked dates (random dates in the current/next months)
    const bookedDates = generateBookedDates();

    // ── DOM Elements ──
    const calDays = document.getElementById('cal-days');
    const calMonth = document.getElementById('cal-month');
    const calPrev = document.getElementById('cal-prev');
    const calNext = document.getElementById('cal-next');
    const dateText = document.getElementById('date-text');
    const timeSlots = document.querySelectorAll('.time-slot');
    const bookingForm = document.getElementById('booking-form');
    const bookingModal = document.getElementById('booking-modal');
    const modalMessage = document.getElementById('modal-message');

    // ── Month Names ──
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
    ];

    // ── Generate Booked Dates ──
    function generateBookedDates() {
        const dates = new Set();
        const now = new Date();

        for (let i = 0; i < 8; i++) {
            const randomDay = Math.floor(Math.random() * 28) + 1;
            const randomMonth = now.getMonth() + Math.floor(Math.random() * 2);
            dates.add(`${now.getFullYear()}-${randomMonth}-${randomDay}`);
        }

        return dates;
    }

    function isBooked(year, month, day) {
        return bookedDates.has(`${year}-${month}-${day}`);
    }

    // ── Render Calendar ──
    function renderCalendar() {
        calDays.innerHTML = '';
        calMonth.textContent = `${monthNames[currentMonth]} ${currentYear}`;

        const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const today = new Date();

        // Previous month filler
        const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
        for (let i = firstDayOfMonth - 1; i >= 0; i--) {
            const dayBtn = document.createElement('button');
            dayBtn.type = 'button';
            dayBtn.className = 'cal-day disabled';
            dayBtn.textContent = prevMonthDays - i;
            calDays.appendChild(dayBtn);
        }

        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            const dayBtn = document.createElement('button');
            dayBtn.type = 'button';
            dayBtn.className = 'cal-day';
            dayBtn.textContent = day;

            const dateObj = new Date(currentYear, currentMonth, day);
            const isPast = dateObj < new Date(today.getFullYear(), today.getMonth(), today.getDate());

            if (isPast) {
                dayBtn.classList.add('disabled');
            } else if (isBooked(currentYear, currentMonth, day)) {
                dayBtn.classList.add('booked');
            } else {
                dayBtn.classList.add('available');

                // Check if this is today
                if (day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
                    dayBtn.classList.add('today');
                }

                // Check if selected
                if (selectedDate &&
                    day === selectedDate.getDate() &&
                    currentMonth === selectedDate.getMonth() &&
                    currentYear === selectedDate.getFullYear()) {
                    dayBtn.classList.add('selected');
                }

                dayBtn.addEventListener('click', () => selectDate(day));
            }

            calDays.appendChild(dayBtn);
        }

        // Next month filler
        const totalCells = firstDayOfMonth + daysInMonth;
        const remainingCells = 7 - (totalCells % 7);
        if (remainingCells < 7) {
            for (let i = 1; i <= remainingCells; i++) {
                const dayBtn = document.createElement('button');
                dayBtn.type = 'button';
                dayBtn.className = 'cal-day disabled';
                dayBtn.textContent = i;
                calDays.appendChild(dayBtn);
            }
        }
    }

    // ── Select Date ──
    function selectDate(day) {
        selectedDate = new Date(currentYear, currentMonth, day);

        const formattedDate = selectedDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

        dateText.textContent = formattedDate;
        dateText.style.color = '#b87333';

        // Reset time slots with some random unavailability
        timeSlots.forEach((slot) => {
            slot.classList.remove('selected', 'unavailable');
            if (Math.random() < 0.2) {
                slot.classList.add('unavailable');
            }
        });

        selectedTimeSlot = null;
        renderCalendar();
    }

    // ── Navigation ──
    calPrev.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });

    calNext.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });

    // ── Time Slot Selection ──
    timeSlots.forEach((slot) => {
        slot.addEventListener('click', () => {
            if (slot.classList.contains('unavailable')) return;

            timeSlots.forEach((s) => s.classList.remove('selected'));
            slot.classList.add('selected');
            selectedTimeSlot = slot.getAttribute('data-time');
        });
    });

    // ── Form Submission ──
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('client-name').value.trim();
        const email = document.getElementById('client-email').value.trim();
        const phone = document.getElementById('client-phone').value.trim();
        const serviceType = document.getElementById('service-type').value;

        // Validation
        if (!name || !email || !phone || !serviceType) {
            shakeElement(bookingForm);
            return;
        }

        if (!selectedDate) {
            shakeElement(document.querySelector('.calendar-card'));
            dateText.textContent = '⚠ Please select a date';
            dateText.style.color = '#c0392b';
            return;
        }

        if (!selectedTimeSlot) {
            shakeElement(document.getElementById('time-slots'));
            return;
        }

        // Format service name
        const serviceNames = {
            bridal: 'Bridal Fitting',
            custom: 'Custom Stitching',
            alteration: 'Alterations',
            casual: 'Casual Stitching',
            consultation: 'Design Consultation',
        };

        const formattedDate = selectedDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

        // Show success modal
        modalMessage.innerHTML = `
            Dear <strong>${name}</strong>, your <strong>${serviceNames[serviceType]}</strong> 
            appointment has been booked for <strong>${formattedDate}</strong> at 
            <strong>${selectedTimeSlot}</strong>. A confirmation has been sent to 
            <strong>${email}</strong>.
        `;

        bookingModal.hidden = false;

        // Mark date as booked
        bookedDates.add(`${currentYear}-${currentMonth}-${selectedDate.getDate()}`);

        // Reset form
        bookingForm.reset();
        selectedDate = null;
        selectedTimeSlot = null;
        dateText.textContent = 'Click a date on the calendar';
        dateText.style.color = '';
        timeSlots.forEach((s) => s.classList.remove('selected'));
        renderCalendar();
    });

    // ── Shake Animation ──
    function shakeElement(el) {
        el.style.animation = 'none';
        el.offsetHeight; // Force reflow
        el.style.animation = 'shake 0.5s ease';
        setTimeout(() => { el.style.animation = ''; }, 500);
    }

    // Add shake keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-8px); }
            40% { transform: translateX(8px); }
            60% { transform: translateX(-4px); }
            80% { transform: translateX(4px); }
        }
    `;
    document.head.appendChild(style);

    // ── Initialize ──
    renderCalendar();

})();
