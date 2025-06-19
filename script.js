document.addEventListener('DOMContentLoaded', () => {
    // --- AOS Initialization ---
    AOS.init({
        duration: 1000,
        once: true,
        offset: 120,
        delay: 0,
        easing: 'ease-out-quad',
    });

    // --- EmailJS Initialization (Kept for now, but contact form will use Netlify Function for scheduling) ---
    // If you intend for *all* inquiries to go to the database, you can remove this block.
    if (typeof emailjs !== 'undefined') {
        emailjs.init("crTJ1n1m38zYWkoNb"); // IMPORTANT: Double-check this is your correct EmailJS Public Key/User ID
    } else {
        console.warn('EmailJS SDK not loaded. Contact form functionality may be affected for non-scheduling uses.');
    }

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
    // (This section is likely only relevant for index.html, not schedule.html. Keeping for completeness if script.js is shared)
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
        let resizeTimeoutAbout; // Renamed to avoid conflict
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
    // This part should specifically handle links on schedule.html to index.html#sections
    document.querySelectorAll('.navbar a[href^="index.html#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            const hash = href.split('#')[1];
            if (hash) {
                // For links like index.html#services, let default browser behavior handle navigation
                // If you want smooth scroll *after* navigation, that's more complex (needs JS on index.html too)
                // For now, it will just navigate to the section on index.html
                // If the link is to a section *on schedule.html*, this won't apply
            }
        });
    });

    // --- SCHEDULE PAGE: Flatpickr and Time Slot Logic ---
    const datePicker = document.getElementById('date-picker');
    const timeSlotSelect = document.getElementById('time-slot-select');
    const serviceSelect = document.getElementById('service-select');
    const bookingDetailsInput = document.getElementById('booking_details'); // The auto-filled input

    // Initialize Flatpickr for date selection
    if (datePicker) {
        flatpickr(datePicker, {
            dateFormat: "Y-m-d", // Format matching SQL DATE type
            minDate: "today",    // Can't pick past dates
            onChange: function(selectedDates, dateStr, instance) {
                // When date changes, update time slots
                updateTimeSlots(dateStr);
                updateBookingDetails(); // Update booking details whenever date changes
            }
        });
    }

    // Function to populate time slots (basic example, not checking availability yet)
    function updateTimeSlots(selectedDate) {
        // Clear existing options
        timeSlotSelect.innerHTML = '<option value="">-- Select a Time --</option>';

        // For a real system, you'd fetch available slots for `selectedDate` from your database
        // For now, let's just add some common working hours
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

    // --- MAIN FORM SUBMISSION LOGIC (USING NETLIFY FUNCTION) ---
    const contactForm = document.getElementById('contact-form'); // This is now your main form for scheduling
    const formStatus = document.getElementById('form-status'); // For EmailJS status
    const responseMessageDiv = document.getElementById('responseMessage'); // For Netlify Function status

    if (contactForm) {
        contactForm.addEventListener('submit', async function(event) {
            event.preventDefault(); // Prevent default form submission

            responseMessageDiv.textContent = 'Processing your request...';
            responseMessageDiv.style.color = 'blue';
            formStatus.textContent = ''; // Clear EmailJS status if it exists

            // Collect data from the form and the scheduling selects
            // Ensure these match the 'name' attributes in schedule.html
            // AND the expected keys in your Netlify Function (create-appointment.js)
            const formData = {
                customer_name: contactForm.elements.customer_name.value,
                customer_email: contactForm.elements.customer_email.value,
                service_type: serviceSelect.value, // Get from the scheduling select
                appointment_date: datePicker.value, // Get from the date picker
                appointment_time: timeSlotSelect.value, // Get from the time slot select
                // Combine booking_details and message into 'notes' for the database
                notes: `Booking Details: ${bookingDetailsInput.value}\nMessage: ${contactForm.elements.message_notes.value}`
            };

            // Basic client-side validation
            if (!formData.customer_name || !formData.customer_email || !formData.service_type ||
                !formData.appointment_date || !formData.appointment_time || !contactForm.elements.message_notes.value.trim()) {
                responseMessageDiv.textContent = 'Please fill in all required fields (Name, Email, Service, Date, Time, Message).';
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
                    contactForm.reset(); // Clear the form
                    // Also reset scheduling specific elements if needed
                    serviceSelect.value = '';
                    datePicker.value = '';
                    timeSlotSelect.innerHTML = '<option value="">-- Select a Time --</option>'; // Clear time slots
                    bookingDetailsInput.value = ''; // Clear auto-filled details
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

            // --- OLD EmailJS SUBMISSION (Remove if you are using Netlify Function for all submissions) ---
            // The following EmailJS code is commented out. If you only want to send data to Neon for all submissions
            // through this form, you can delete this block entirely. If you want separate logic for 'general inquiry'
            // versus 'booking', you'd need two separate forms or more complex JS logic to route.
            /*
            if (typeof emailjs === 'undefined') {
                 formStatus.textContent = 'Email service not available. Please try again later.';
                 formStatus.classList.add('error');
                 console.error('EmailJS SDK not found when trying to send form. Check network or script loading order.');
                 return;
            }

            const serviceID = 'service_xys123'; // REMINDER: Replace with your actual EmailJS Service ID!
            const templateID = 'template_abc456'; // REMINDER: Replace with your actual EmailJS Template ID!

            emailjs.sendForm(serviceID, templateID, this)
                .then(() => {
                    formStatus.textContent = 'Message sent successfully!';
                    formStatus.classList.add('success');
                    contactForm.reset();
                }, (error) => {
                    formStatus.textContent = 'Failed to send message. Please try again later.';
                    formStatus.classList.add('error');
                    console.error('EmailJS error:', error);
                });
            */
        });
    } else {
        console.error('Contact form not found with ID "contact-form".');
    }

    // --- Particles.js Initialization (if you're using it) ---
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            "particles": {
                "number": {
                    "value": 80,
                    "density": {
                        "enable": true,
                        "value_area": 800
                    }
                },
                "color": {
                    "value": "#ffffff"
                },
                "shape": {
                    "type": "circle",
                    "stroke": {
                        "width": 0,
                        "color": "#000000"
                    },
                    "polygon": {
                        "nb_sides": 5
                    }
                },
                "opacity": {
                    "value": 0.5,
                    "random": false,
                    "anim": {
                        "enable": false,
                        "speed": 1,
                        "opacity_min": 0.1,
                        "sync": false
                    }
                },
                "size": {
                    "value": 3,
                    "random": true,
                    "anim": {
                        "enable": false,
                        "speed": 40,
                        "size_min": 0.1,
                        "sync": false
                    }
                },
                "line_linked": {
                    "enable": true,
                    "distance": 150,
                    "color": "#ffffff",
                    "opacity": 0.4,
                    "width": 1
                },
                "move": {
                    "enable": true,
                    "speed": 6,
                    "direction": "none",
                    "random": false,
                    "straight": false,
                    "out_mode": "out",
                    "bounce": false,
                    "attract": {
                        "enable": false,
                        "rotateX": 600,
                        "rotateY": 1200
                    }
                }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": {
                    "onhover": {
                        "enable": true,
                        "mode": "grab"
                    },
                    "onclick": {
                        "enable": true,
                        "mode": "push"
                    },
                    "resize": true
                },
                "modes": {
                    "grab": {
                        "distance": 140,
                        "line_linked": {
                            "opacity": 1
                        }
                    },
                    "bubble": {
                        "distance": 400,
                        "size": 40,
                        "duration": 2,
                        "opacity": 8,
                        "speed": 3
                    },
                    "repulse": {
                        "distance": 200,
                        "duration": 0.4
                    },
                    "push": {
                        "particles_nb": 4
                    },
                    "remove": {
                        "particles_nb": 2
                    }
                }
            },
            "retina_detect": true
        });
    } else {
        console.warn('Particles.js library not loaded. Check script include or network.');
    }
});