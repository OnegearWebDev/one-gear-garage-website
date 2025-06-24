document.addEventListener('DOMContentLoaded', function() {
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
            // Only enable toggle on mobile viewports
            if (window.innerWidth <= 768) {
                event.preventDefault(); // Prevent default link behavior on mobile click
                const isOpen = !navbar.classList.contains('expanded'); // Check current state from navbar class
                navbar.classList.toggle('expanded', isOpen);
                logoToggle.setAttribute('aria-expanded', isOpen);

                // Apply staggered animation delay for menu items on expansion
                const navLinks = navMenu.querySelectorAll('a');
                navLinks.forEach((link, index) => {
                    if (isOpen) {
                        // Apply animation and delay
                        link.style.setProperty('--delay-index', `${index * 0.1}s`);
                        link.style.animation = `fadeSlideIn 0.5s forwards ${index * 0.1}s`;
                    } else {
                        // Clear animations when collapsing to ensure smooth transition back
                        link.style.animation = '';
                        link.style.opacity = '';
                        link.style.transform = '';
                    }
                });
            }
        });

        // Close menu if a nav link is clicked on mobile
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768 && navbar.classList.contains('expanded')) {
                    navbar.classList.remove('expanded');
                    logoToggle.setAttribute('aria-expanded', 'false');
                    // Clear animations when a link is clicked to collapse
                    navMenu.querySelectorAll('a').forEach(l => {
                        l.style.animation = '';
                        l.style.opacity = '';
                        l.style.transform = '';
                    });
                }
            });
        });

        // Handle resize: If resized to desktop, ensure menu is open and animations are cleared
        window.addEventListener('resize', () => {
            clearTimeout(window.resizeTimeout);
            window.resizeTimeout = setTimeout(() => {
                if (window.innerWidth > 768) {
                    navbar.classList.remove('expanded'); // Ensure not expanded on desktop
                    logoToggle.setAttribute('aria-expanded', 'false');
                    navMenu.querySelectorAll('a').forEach(link => {
                        link.style.animation = '';
                        link.style.opacity = '';
                        link.style.transform = '';
                    });
                }
            }, 200); // Debounce resize for performance
        });
    } else {
        console.warn('One or more navigation elements not found. Check IDs and classes:', { navbar, logoToggle, navMenu });
    }

    // --- ABOUT US SECTION: Collapsible on Mobile, Link to Full Page on Desktop ---
    // Note: The logic for linking to 'about-full.html' has been updated based on previous discussions.
    // If 'about-full.html' doesn't exist, this will still try to navigate.
    const aboutExtendedContent = document.getElementById('about-extended-content');
    const readMoreAboutBtn = document.getElementById('read-more-about-btn');

    if (aboutExtendedContent && readMoreAboutBtn) {
        const isMobile = () => window.innerWidth <= 768;

        const handleMobileToggle = (event) => {
            event.preventDefault(); // Prevent default link behavior
            const isExpanded = aboutExtendedContent.classList.toggle('expanded');
            readMoreAboutBtn.textContent = isExpanded ? 'Read Less' : 'Read More';
            if (isExpanded) {
                // Adjust max-height to scrollHeight to allow smooth expansion
                aboutExtendedContent.style.maxHeight = aboutExtendedContent.scrollHeight + 'px';
            } else {
                aboutExtendedContent.style.maxHeight = '0'; // Collapse
            }
            aboutExtendedContent.style.opacity = isExpanded ? '1' : '0'; // Fade in/out
        };

        const setupAboutSectionBehavior = () => {
            // Remove previous listeners to prevent duplicates
            readMoreAboutBtn.removeEventListener('click', handleMobileToggle); // Only mobile toggle for now
            // If you decide to link to a separate about-full.html on desktop, you would add an event listener here
            // readMoreAboutBtn.removeEventListener('click', () => window.location.href = 'about-full.html');

            if (isMobile()) {
                readMoreAboutBtn.textContent = 'Read More';
                aboutExtendedContent.classList.remove('expanded'); // Ensure collapsed state on mobile init
                aboutExtendedContent.style.maxHeight = '0';
                aboutExtendedContent.style.opacity = '0';
                readMoreAboutBtn.addEventListener('click', handleMobileToggle);
            } else {
                // On desktop, content is fully visible, button can be hidden or changed to "Visit About Page"
                aboutExtendedContent.style.maxHeight = 'none';
                aboutExtendedContent.style.opacity = '1';
                readMoreAboutBtn.style.display = 'none'; // Hide button on desktop
            }
        };

        setupAboutSectionBehavior(); // Initial setup on page load

        // Handle resize for about section responsiveness
        let resizeTimeoutAbout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeoutAbout);
            resizeTimeoutAbout = setTimeout(() => {
                setupAboutSectionBehavior(); // Re-evaluate and apply behavior on resize
            }, 200); // Debounce resize
        });
    }


    // --- SCHEDULE.HTML Specific Logic ---

    // Elements for the consolidated form
    const serviceSelect = document.getElementById('service-select');
    const datePicker = document.getElementById('date-picker');
    const timeSlotSelect = document.getElementById('time-slot-select');
    const bookingContactForm = document.getElementById('bookingContactForm'); // The consolidated form
    const formStatusMessage = document.getElementById('formStatusMessage');

    // Function to populate time slots based on selected date
    function populateTimeSlots(selectedDate) {
        timeSlotSelect.innerHTML = '<option value="">-- Select a Time --</option>'; // Clear existing options
        if (!selectedDate) {
            return; // No date selected, no times to show
        }

        const dayOfWeek = selectedDate.getDay(); // Sunday - 0, Monday - 1, ..., Saturday - 6
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        let availableTimes = [];

        // Define business hours
        const businessHours = {
            monday: { start: 9, end: 17 },    // 9 AM to 5 PM
            tuesday: { start: 9, end: 17 },
            wednesday: { start: 9, end: 17 },
            thursday: { start: 9, end: 17 },
            friday: { start: 9, end: 17 },
            saturday: { start: 10, end: 15 } // 10 AM to 3 PM
            // Sunday is implicitly closed as no hours are defined
        };

        // Map dayOfWeek to hour ranges
        let hoursForDay;
        switch (dayOfWeek) {
            case 1: hoursForDay = businessHours.monday; break;
            case 2: hoursForDay = businessHours.tuesday; break;
            case 3: hoursForDay = businessHours.wednesday; break;
            case 4: hoursForDay = businessHours.thursday; break;
            case 5: hoursForDay = businessHours.friday; break;
            case 6: hoursForDay = businessHours.saturday; break;
            case 0: // Sunday
            default:
                hoursForDay = null; // Closed
        }

        if (hoursForDay) {
            for (let i = hoursForDay.start; i <= hoursForDay.end; i++) {
                // Add full hour slots
                availableTimes.push(`${String(i).padStart(2, '0')}:00`);
            }
        }

        // Filter out past times for the current day only
        if (selectedDate.toDateString() === today.toDateString()) {
            availableTimes = availableTimes.filter(time => {
                const [hour, minute] = time.split(':').map(Number);
                const slotTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute);
                // Only show slots that are at least 1 hour in the future (buffer for immediate bookings)
                return slotTime.getTime() > (now.getTime() + 60 * 60 * 1000); 
            });
        }

        if (availableTimes.length > 0) {
            availableTimes.forEach(time => {
                const option = document.createElement('option');
                option.value = time;
                option.textContent = time;
                timeSlotSelect.appendChild(option);
            });
        } else {
            // Display a message if no times are available
            const option = document.createElement('option');
            option.value = '';
            option.disabled = true;
            option.textContent = (dayOfWeek === 0) ? 'No appointments available (Closed on Sundays)' : 'No available times for this date.';
            timeSlotSelect.appendChild(option);
        }
    }

    // Initialize Flatpickr for the date input
    if (datePicker) {
        flatpickr(datePicker, {
            dateFormat: "Y-m-d", // YYYY-MM-DD
            minDate: "today",    // Disallow past dates
            disable: [
                function(date) {
                    // Disable Sundays (0 = Sunday)
                    return date.getDay() === 0;
                }
            ],
            locale: {
                "firstDayOfWeek": 1 // Start week on Monday
            },
            onChange: function(selectedDates, dateStr, instance) {
                if (selectedDates.length > 0) {
                    populateTimeSlots(selectedDates[0]);
                } else {
                    // If date is cleared, clear time slots
                    timeSlotSelect.innerHTML = '<option value="">-- Select a Time --</option>';
                }
            }
        });
    }

    // --- Handle Consolidated Form Submission (to Netlify Function) ---
    // Make sure EmailJS is configured if you intend to use it from here
    // emailjs.init("YOUR_PUBLIC_KEY"); // Replace with your EmailJS Public Key if using

    if (bookingContactForm) {
        bookingContactForm.addEventListener('submit', async function(e) {
            e.preventDefault(); // Prevent default form submission

            formStatusMessage.textContent = 'Sending your request...';
            formStatusMessage.className = 'form-status'; // Reset classes for styling

            // Collect all form data directly from the form fields
            const formData = {
                name: document.getElementById('user_name').value,
                email: document.getElementById('user_email').value,
                phone: document.getElementById('user_phone').value, // Optional, can be empty
                service: serviceSelect.value,
                appointment_date: datePicker.value,
                appointment_time: timeSlotSelect.value,
                message: document.getElementById('message').value
            };

            // Basic client-side validation for required fields
            if (!formData.name || !formData.email || !formData.service ||
                !formData.appointment_date || !formData.appointment_time || !formData.message.trim()) {
                formStatusMessage.textContent = 'Please fill in all required fields (Name, Email, Service, Date, Time, Your Message).';
                formStatusMessage.classList.add('error');
                return; // Stop submission
            }
            
            // Validate email format (simple regex)
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                formStatusMessage.textContent = 'Please enter a valid email address.';
                formStatusMessage.classList.add('error');
                return;
            }

            // --- Send to Netlify Function (create-appointment.js) ---
            try {
                const response = await fetch('/.netlify/functions/create-appointment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json', // Send as JSON to your function
                    },
                    body: JSON.stringify(formData), // Convert JS object to JSON string
                });

                const result = await response.json(); // Assuming your function returns JSON

                if (response.ok) {
                    formStatusMessage.textContent = 'Thank you! Your request has been sent. We will confirm your appointment shortly.';
                    formStatusMessage.classList.add('success');
                    bookingContactForm.reset(); // Clear the form
                    // Also clear Flatpickr and time slots visually
                    if (datePicker._flatpickr) datePicker._flatpickr.clear();
                    populateTimeSlots(null); // Clear time slots after reset
                } else {
                    formStatusMessage.textContent = `Error submitting request: ${result.details || result.error || 'Unknown error'}`;
                    formStatusMessage.classList.add('error');
                    console.error('Netlify Function Error Response:', result);
                }
            } catch (error) {
                formStatusMessage.textContent = 'A network error occurred. Please check your connection and try again.';
                formStatusMessage.classList.add('error');
                console.error('Fetch API Error:', error);
            }

            // --- Optional: Send via EmailJS (if you want an email notification as well) ---
            // If you also want to send an email via EmailJS, uncomment and configure this:
            /*
            const emailjsServiceId = 'YOUR_EMAILJS_SERVICE_ID'; // Replace with your service ID
            const emailjsTemplateId = 'YOUR_EMAILJS_TEMPLATE_ID'; // Replace with your template ID
            
            try {
                const emailJSTemplateParams = {
                    from_name: formData.name,
                    from_email: formData.email,
                    from_phone: formData.phone,
                    service_type: formData.service,
                    appointment_date: formData.appointment_date,
                    appointment_time: formData.appointment_time,
                    message: formData.message,
                };
                await emailjs.send(emailjsServiceId, emailjsTemplateId, emailJSTemplateParams);
                console.log('EmailJS: Email sent successfully!');
                // You might update the formStatusMessage here to reflect email sent too,
                // or just rely on the function success message.
            } catch (emailjsError) {
                console.error('EmailJS Error:', emailjsError);
                // Add an additional message for email failure if needed, but prioritize function success
            }
            */
        });
    } else {
        console.error('Booking Contact Form not found with ID "bookingContactForm".');
    }
});
