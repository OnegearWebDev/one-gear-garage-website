document.addEventListener('DOMContentLoaded', () => {
    // --- AOS Initialization ---
    AOS.init({
        duration: 1000,
        once: true,
        offset: 120,
        delay: 0,
        easing: 'ease-out-quad',
    });

    // --- Mobile Navigation Functionality (Logo as Toggle) ---
    const navbar = document.querySelector('.navbar');
    const logoToggle = document.getElementById('logo-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (navbar && logoToggle && navMenu) {
        logoToggle.addEventListener('click', (event) => {
            if (window.innerWidth <= 768) {
                event.preventDefault();
                const isOpen = !navMenu.classList.contains('active');
                navMenu.classList.toggle('active', isOpen);
                navbar.classList.toggle('expanded', isOpen);
                logoToggle.setAttribute('aria-expanded', isOpen);
                const navLinks = navMenu.querySelectorAll('a');
                navLinks.forEach((link, index) => {
                    if (isOpen) {
                        link.style.setProperty('--delay-index', index * 0.1 + 's');
                        link.style.animation = `fadeSlideIn 0.5s forwards ${index * 0.1}s`;
                    } else {
                        link.style.animation = '';
                        link.style.opacity = '';
                        link.style.transform = '';
                    }
                });
            }
        });

        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    navMenu.classList.remove('active');
                    navbar.classList.remove('expanded');
                    logoToggle.setAttribute('aria-expanded', 'false');
                    navMenu.querySelectorAll('a').forEach(l => {
                        l.style.animation = '';
                        l.style.opacity = '';
                        l.style.transform = '';
                    });
                }
            });
        });

        window.addEventListener('resize', () => {
            clearTimeout(window.resizeTimeout);
            window.resizeTimeout = setTimeout(() => {
                if (window.innerWidth > 768) {
                    navMenu.classList.remove('active');
                    navbar.classList.remove('expanded');
                    logoToggle.setAttribute('aria-expanded', 'false');
                    navMenu.querySelectorAll('a').forEach(link => {
                        link.style.animation = '';
                        link.style.opacity = '';
                        link.style.transform = '';
                    });
                }
            }, 200);
        });
    } else {
        console.warn('One or more navigation elements not found. Check IDs and classes:', { navbar, logoToggle, navMenu });
    }

    // --- ABOUT US SECTION: Collapsible on Mobile, Link to Full Page on Desktop ---
    const aboutExtendedContent = document.getElementById('about-extended-content');
    const readMoreAboutBtn = document.getElementById('read-more-about-btn');

    if (aboutExtendedContent && readMoreAboutBtn) {
        const isMobile = () => window.innerWidth <= 768;
        const handleMobileToggle = (event) => {
            if (isMobile()) {
                event.preventDefault();
                aboutExtendedContent.classList.toggle('expanded');
                if (aboutExtendedContent.classList.contains('expanded')) {
                    readMoreAboutBtn.textContent = 'Read Less';
                    aboutExtendedContent.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                } else {
                    readMoreAboutBtn.textContent = 'Read More';
                }
            } else {
                window.location.href = 'about-full.html';
            }
        };

        const handleDesktopLink = () => {
            window.location.href = 'about-full.html';
        };

        const setupAboutSectionBehavior = () => {
            readMoreAboutBtn.removeEventListener('click', handleDesktopLink);
            readMoreAboutBtn.removeEventListener('click', handleMobileToggle);

            if (isMobile()) {
                readMoreAboutBtn.textContent = 'Read More';
                readMoreAboutBtn.addEventListener('click', handleMobileToggle);
            } else {
                readMoreAboutBtn.textContent = 'Read Full Story';
                readMoreAboutBtn.addEventListener('click', handleDesktopLink);
            }
        };

        setupAboutSectionBehavior();
        let resizeTimeoutAbout;
        let lastIsMobile = isMobile();
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeoutAbout);
            resizeTimeoutAbout = setTimeout(() => {
                const currentIsMobile = isMobile();
                if (currentIsMobile !== lastIsMobile) {
                    if (currentIsMobile) {
                        aboutExtendedContent.classList.remove('expanded');
                    }
                    setupAboutSectionBehavior();
                    lastIsMobile = currentIsMobile;
                }
            }, 200);
        });
    }

    // --- Smooth Scrolling for Navbar Links (Adjusted for schedule.html) ---
    document.querySelectorAll('.navbar a[href^="index.html#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            const hash = href.split('#')[1];
            if (hash) {
                // Allows default browser navigation to the home page with the hash
            }
        });
    });

    // --- SCHEDULING INTERACTION: Flatpickr and Time Slot Logic ---
    const datePicker = document.getElementById('date-picker');
    const timeSlotSelect = document.getElementById('time-slot-select');
    const serviceSelect = document.getElementById('service-select');
    const bookingDetailsInput = document.getElementById('booking_details'); // From the general inquiry section

    // Initialize Flatpickr for date selection
    if (datePicker) {
        flatpickr(datePicker, {
            dateFormat: "Y-m-d", // Format matching SQL DATE type
            minDate: "today",    // Can't pick past dates
            onChange: function(selectedDates, dateStr, instance) {
                updateTimeSlots(dateStr);
                updateBookingDetails();
            }
        });
    }

    // Function to populate time slots (basic example, not checking availability yet)
    function updateTimeSlots(selectedDate) {
        timeSlotSelect.innerHTML = '<option value="">-- Select a Time --</option>';

        const availableTimes = [
            "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"
        ]; // Example times

        availableTimes.forEach(time => {
            const option = document.createElement('option');
            option.value = time;
            option.textContent = time;
            timeSlotSelect.appendChild(option);
        });
    }

    // Update booking details input whenever relevant fields change
    function updateBookingDetails() {
        const service = serviceSelect ? serviceSelect.value : '';
        const date = datePicker ? datePicker.value : '';
        const time = timeSlotSelect ? timeSlotSelect.value : '';

        let details = [];
        if (service) details.push(`Service: ${service}`);
        if (date) details.push(`Date: ${date}`);
        if (time) details.push(`Time: ${time}`);

        bookingDetailsInput.value = details.join(', ');
    }

    // Add event listeners to update booking details on service/time change
    if (serviceSelect) {
        serviceSelect.addEventListener('change', updateBookingDetails);
    }
    if (timeSlotSelect) {
        timeSlotSelect.addEventListener('change', updateBookingDetails);
    }


    // --- SCHEDULING APPOINTMENT SUBMISSION (TO NETLIFY FUNCTION -> NEON DB) ---
    const scheduleAppointmentButton = document.getElementById('scheduleAppointmentButton');
    const responseMessageDiv = document.getElementById('responseMessage');

    // Get references to input fields for data collection (from the general inquiry form)
    const userNameInput = document.getElementById('user_name');
    const userEmailInput = document.getElementById('user_email');
    const userMessageInput = document.getElementById('message');

    if (scheduleAppointmentButton) {
        scheduleAppointmentButton.addEventListener('click', async (event) => {
            event.preventDefault(); // Prevent default button behavior

            responseMessageDiv.textContent = 'Scheduling your appointment...';
            responseMessageDiv.style.color = 'blue';

            // Collect data from various parts of the page
            const formData = {
                customer_name: userNameInput ? userNameInput.value : '',
                customer_email: userEmailInput ? userEmailInput.value : '',
                service_type: serviceSelect ? serviceSelect.value : '',
                appointment_date: datePicker ? datePicker.value : '',
                appointment_time: timeSlotSelect ? timeSlotSelect.value : '',
                // Combine booking details and general message into 'notes' for the database
                notes: `Booking Details: ${bookingDetailsInput ? bookingDetailsInput.value : 'N/A'}\nMessage: ${userMessageInput ? userMessageInput.value : 'N/A'}`
            };

            // Basic client-side validation for required fields
            if (!formData.customer_name || !formData.customer_email || !formData.service_type ||
                !formData.appointment_date || !formData.appointment_time || !userMessageInput.value.trim()) {
                responseMessageDiv.textContent = 'Please fill in all required fields (Name, Email, Service, Date, Time, Your Message).';
                responseMessageDiv.style.color = 'red';
                return;
            }

            // Send data to your Netlify Function
            try {
                const response = await fetch('/.netlify/functions/create-appointment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });

                const result = await response.json();

                if (response.ok) {
                    responseMessageDiv.textContent = 'Appointment scheduled successfully! ' + (result.appointmentId ? `ID: ${result.appointmentId}` : '');
                    responseMessageDiv.style.color = 'green';
                    
                    // Reset fields after successful submission
                    if (serviceSelect) serviceSelect.value = '';
                    if (datePicker) datePicker.value = '';
                    if (timeSlotSelect) timeSlotSelect.innerHTML = '<option value="">-- Select a Time --</option>';
                    if (bookingDetailsInput) bookingDetailsInput.value = '';
                    if (userNameInput) userNameInput.value = '';
                    if (userEmailInput) userEmailInput.value = '';
                    if (userMessageInput) userMessageInput.value = '';

                } else {
                    responseMessageDiv.textContent = 'Error scheduling appointment: ' + (result.details || result.error || 'Unknown error');
                    responseMessageDiv.style.color = 'red';
                    console.error('Function error response:', result);
                }
            } catch (error) {
                responseMessageDiv.textContent = 'An unexpected error occurred. Please try again.';
                responseMessageDiv.style.color = 'red';
                console.error('Fetch error:', error);
            }
        });
    } else {
        console.error('Schedule Appointment Button not found with ID "scheduleAppointmentButton".');
    }
    // Particles.js Initialization block removed
});