document.addEventListener('DOMContentLoaded', function () {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const dropdownBtns = document.querySelectorAll('.dropdown-btn');

    // Toggle mobile menu
    navToggle.addEventListener('click', function () {
        this.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Handle dropdown buttons in mobile view
    dropdownBtns.forEach(btn => {
        btn.addEventListener('click', function (e) {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                const dropdown = this.parentElement;
                const wasActive = dropdown.classList.contains('active');

                // Close all dropdowns
                dropdownBtns.forEach(otherBtn => {
                    otherBtn.parentElement.classList.remove('active');
                });

                // Toggle clicked dropdown
                if (!wasActive) {
                    dropdown.classList.add('active');
                }
            }
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function (e) {
        if (window.innerWidth <= 768) {
            const isClickInsideNav = e.target.closest('.nav-menu') || e.target.closest('.nav-toggle');
            if (!isClickInsideNav && navMenu.classList.contains('active')) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                dropdownBtns.forEach(btn => {
                    btn.parentElement.classList.remove('active');
                });
            }
        }
    });

    // Close mobile menu when window is resized above mobile breakpoint
    window.addEventListener('resize', function () {
        if (window.innerWidth > 768) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            dropdownBtns.forEach(btn => {
                btn.parentElement.classList.remove('active');
            });
        }
    });
});
