document.addEventListener('DOMContentLoaded', () => {
    // Initialize AOS library for animations
    AOS.init({
        duration: 800, // Animation duration
        once: true,    // Whether animation should happen only once - off the screen
        mirror: false, // Whether elements should animate out while scrolling past them
    });

    // --- Navbar Toggle Logic (for mobile responsiveness) ---
    const navbar = document.querySelector('.navbar');
const navMenu = document.getElementById('nav-menu');
const hamburger = document.getElementById('hamburger');
const logoToggle = document.getElementById('logo-toggle');

function toggleNav() {
    navbar.classList.toggle('expanded');
    const isExpanded = navbar.classList.contains('expanded');
    logoToggle.setAttribute('aria-expanded', isExpanded);
}

if (hamburger) {
    hamburger.addEventListener('click', (event) => {
        event.stopPropagation();
        toggleNav();
    });
}

if (logoToggle) {
    logoToggle.addEventListener('click', (event) => {
        if (window.innerWidth <= 768) {
            event.preventDefault();
            event.stopPropagation();
            toggleNav();
        }
    });
}

if (navMenu) {
    navMenu.addEventListener('click', (event) => {
        if (event.target.tagName === 'A' && navbar.classList.contains('expanded')) {
            toggleNav();
        }
    });
}

// 🧠 NEW: Close the navbar if user clicks outside it
document.addEventListener('click', (event) => {
    if (!navbar.contains(event.target) && navbar.classList.contains('expanded')) {
        toggleNav();
    }
});


    // --- About Section "Read More" Button Logic ---
    const readMoreBtn = document.getElementById('read-more-about-btn');
    const aboutExtendedContent = document.getElementById('about-extended-content');

    if (readMoreBtn && aboutExtendedContent) {
        // Initially hide the extended content (CSS handles this with max-height: 0)
        aboutExtendedContent.classList.remove('expanded');
        readMoreBtn.textContent = 'Read More';

        readMoreBtn.addEventListener('click', (event) => {
            // Define the mobile breakpoint (should match your CSS @media query)
            const mobileBreakpoint = 768; // px

            if (window.innerWidth <= mobileBreakpoint) {
                // On mobile, prevent default link behavior and toggle content
                event.preventDefault(); 
                aboutExtendedContent.classList.toggle('expanded');

                // Change button text based on content state
                if (aboutExtendedContent.classList.contains('expanded')) {
                    readMoreBtn.textContent = 'Read Less';
                } else {
                    readMoreBtn.textContent = 'Read More';
                }
                AOS.refresh(); // Refresh AOS to ensure new content animates correctly
            } 
            // On desktop, the default link behavior (navigating to about-full.html) will occur
        });
    }

    // --- Hero Section Button Debugging (for your reference) ---
    const heroCtaButton = document.querySelector('#hero .cta');
    if (heroCtaButton) {
        console.log('Hero CTA button found:', heroCtaButton);
    } else {
        console.warn('Hero CTA button NOT found on this page.');
    }


    // --- Contentful Services Fetch (only runs on services.html) ---
    // This function will only be called if the 'service-cards-container' element exists,
    // ensuring it doesn't cause errors on other pages.
    async function fetchServices() {
        const serviceCardsContainer = document.getElementById('service-cards-container');
        if (!serviceCardsContainer) {
            // This means we are not on the services page, so exit.
            return;
        }

        // IMPORTANT: For Netlify deployment, you'll typically use Netlify Build Plugins
        // or a build script to inject these environment variables into your client-side JS.
        // For local testing, you might temporarily hardcode them or use a .env file with a build tool.
        // For this demonstration, we'll assume they are somehow available or you'll replace.
        // Replace 'YOUR_CONTENTFUL_SPACE_ID' and 'YOUR_CONTENTFUL_ACCESS_TOKEN' with your actual keys
        // once you've created them in Contentful and set them in Netlify environment variables.
        const CONTENTFUL_SPACE_ID = 'YOUR_CONTENTFUL_SPACE_ID'; // Placeholder
        const CONTENTFUL_ACCESS_TOKEN = 'YOUR_CONTENTFUL_ACCESS_TOKEN'; // Placeholder

        // If running directly in Canvas without a build process, these will remain placeholders.
        // For production on Netlify, ensure environment variables are correctly injected.
        // A common way is to use a Netlify build plugin like 'netlify-plugin-inline-env'
        // or to have a build step that replaces these strings with actual env vars.

        // Display a loading message
        serviceCardsContainer.innerHTML = '<div class="loading-message">Loading services...</div>';

        try {
            const contentfulUrl = `https://cdn.contentful.com/spaces/${CONTENTFUL_SPACE_ID}/environments/master/entries?access_token=${CONTENTFUL_ACCESS_TOKEN}&content_type=service&order=fields.order`; // 'service' is the content model ID

            const response = await fetch(contentfulUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            // Clear loading message
            serviceCardsContainer.innerHTML = '';

            if (data.items && data.items.length > 0) {
                data.items.forEach((item, index) => {
                    const service = item.fields;
                    const card = document.createElement('div');
                    card.className = 'card';
                    // Add AOS animation with staggered delay
                    card.setAttribute('data-aos', 'fade-up');
                    card.setAttribute('data-aos-delay', (index * 100 + 300).toString()); // Start delay from 300ms, add 100ms per card

                    card.innerHTML = `
                        <h3>${service.serviceTitle || 'Untitled Service'}</h3>
                        <p>${service.serviceDescription || 'No description provided.'}</p>
                        <p><strong>${service.servicePrice || 'Price varies'}</strong></p>
                    `;
                    serviceCardsContainer.appendChild(card);
                });
                AOS.refresh(); // Refresh AOS to detect newly added elements
            } else {
                serviceCardsContainer.innerHTML = '<div class="no-services-message">No services found. Please add content in Contentful.</div>';
            }

        } catch (error) {
            console.error('Error fetching services from Contentful:', error);
            serviceCardsContainer.innerHTML = '<div class="error-message">Failed to load services. Please try again later.</div>';
        }
    }

    // Call fetchServices only if the service cards container exists on the page
    if (document.getElementById('service-cards-container')) {
        fetchServices();
    }


    // --- EmailJS Initialization (only if needed for forms) ---
    // Make sure to replace 'YOUR_EMAILJS_PUBLIC_KEY' with your actual EmailJS Public Key.
    // This should ideally be loaded from an environment variable for production.
    if (typeof emailjs !== 'undefined') {
        emailjs.init("YOUR_EMAILJS_PUBLIC_KEY");
    } else {
        console.warn("EmailJS SDK not loaded. Form submission may not work.");
    }


    // --- Booking Contact Form Submission Logic (only runs on schedule.html) ---
    const bookingContactForm = document.getElementById('bookingContactForm');

    // Only proceed if the form element exists on the current page
    if (bookingContactForm) {
        const formStatus = document.getElementById('formStatus'); // Ensure you have this element in schedule.html

        bookingContactForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent default form submission

            // Clear previous status messages
            if (formStatus) {
                formStatus.textContent = 'Sending...';
                formStatus.className = 'form-status'; // Reset class
            }

            try {
                // Collect form data
                const formData = new FormData(bookingContactForm);
                const templateParams = {
                    from_name: formData.get('name'),
                    from_email: formData.get('email'),
                    from_phone: formData.get('phone'),
                    service_type: formData.get('serviceType'),
                    preferred_date: formData.get('preferredDate'),
                    preferred_time: formData.get('preferredTime'),
                    message: formData.get('message')
                };

                // Send email using EmailJS
                // Replace 'YOUR_SERVICE_ID' and 'YOUR_TEMPLATE_ID' with your actual EmailJS IDs
                const response = await emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams);

                if (response.status === 200) {
                    if (formStatus) {
                        formStatus.textContent = 'Message sent successfully!';
                        formStatus.classList.add('success');
                    }
                    bookingContactForm.reset(); // Clear the form
                } else {
                    throw new Error(`EmailJS failed with status: ${response.status}`);
                }
            } catch (error) {
                console.error('Failed to send message:', error);
                if (formStatus) {
                    formStatus.textContent = 'Failed to send message. Please try again.';
                    formStatus.classList.add('error');
                }
            }
        });
    } else {
        // This console.log will now only appear if the form element is genuinely not found,
        // which is expected on index.html, gallery.html, etc.
        console.log('Booking Contact Form not found on this page. Skipping form submission setup.');
    }
});
