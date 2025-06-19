document.addEventListener('DOMContentLoaded', () => {
    // --- AOS Initialization ---
    AOS.init({
        duration: 1000, // animation will take 1000ms
        once: true, // animation will happen only once on scroll down
        offset: 120, // trigger animation when 120px from top of element
        delay: 0, // values from 0 to 3000, with step 50ms (data-aos-delay will override)
        easing: 'ease-out-quad', // smoother animation curve
    });

    // --- EmailJS Initialization ---
    if (typeof emailjs !== 'undefined') {
        emailjs.init("crTJ1n1m38zYWkoNb"); // IMPORTANT: Double-check this is your correct EmailJS Public Key/User ID
    } else {
        console.warn('EmailJS SDK not loaded. Contact form functionality may be affected.');
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

        let resizeTimeout;
        let lastIsMobile = isMobile();
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
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

    // --- Smooth Scrolling for Navbar Links ---
    document.querySelectorAll('.navbar a[href^="#"], .navbar a[href*="index.html#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            const [path, hash] = href.split('#');
            const targetElement = hash ? document.querySelector(`#${hash}`) : null;

            if (hash && window.location.pathname.endsWith(path || 'index.html')) {
                if (targetElement) {
                    e.preventDefault();
                    const currentNavbar = document.querySelector('.navbar'); 
                    const navbarHeight = currentNavbar ? (parseFloat(window.getComputedStyle(currentNavbar).getPropertyValue('--navbar-height')) || currentNavbar.offsetHeight || 80) : 80;

                    window.scrollTo({
                        top: targetElement.offsetTop - navbarHeight - 20, 
                        behavior: 'smooth'
                    });
                }
            } else if (hash && path === 'index.html') {
                // Allow default navigation to the home page with the hash
            }
        });
    });

    // --- SCHEDULE & CONTACT PAGE LOGIC ---
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault(); 

            formStatus.textContent = 'Sending...';
            formStatus.className = 'form-status'; 

            const userName = document.getElementById('user_name');
            const userEmail = document.getElementById('user_email');
            const message = document.getElementById('message');

            if (!userName || !userName.value.trim() ||
                !userEmail || !userEmail.value.trim() ||
                !message || !message.value.trim())
            {
                formStatus.textContent = 'Please fill in all required fields (Name, Email, Message).';
                formStatus.classList.add('error');
                return; 
            }

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
        });
    }
});