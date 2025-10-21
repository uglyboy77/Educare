function filterCourses() {
    const filterButtons = document.querySelectorAll('.filterbutton, .filterbutton1');
    const allCourses = document.querySelectorAll('.coursebox');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filterType = button.textContent.trim();

            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));

            // Add active class to the clicked button
            button.classList.add('active');

            // Hide all courses
            allCourses.forEach(course => {
                course.style.display = 'none';
            });

            // Show courses based on filter type
            if (filterType === 'All') {
                allCourses.forEach(course => {
                    course.style.display = 'inline-block';
                    document.querySelector('.registration-suggestion').style.display = 'block';
                });
            } else if (filterType === 'Online') {
                document.querySelectorAll('.online .coursebox').forEach(course => {
                    course.style.display = 'inline-block';
                    document.querySelector('.registration-suggestion').style.display = 'none';
                });
            } else if (filterType === 'None') {
                document.querySelectorAll('.none .coursebox').forEach(course => {
                    course.style.display = 'inline-block';
                    document.querySelector('.registration-suggestion').style.display = 'none';
                });
            } else if (filterType === 'Quiz/Assessment') {
                document.querySelectorAll('.Quiz .coursebox').forEach(course => {
                    course.style.display = 'inline-block';
                    document.querySelector('.registration-suggestion').style.display = 'none';
                });
            }
        });
    });
}
document.addEventListener('DOMContentLoaded', filterCourses);

function setupCourseRegistration() {
    const registerAllRadio = document.getElementById('register-all');
    const registerSomeRadio = document.getElementById('register-some');
    const registerButton = document.getElementById('register-button');
    const registrationCircles = document.querySelectorAll('.registration-circle');
    const registrationText = document.querySelector('.registration p');
    const registrationBackground = document.querySelector('.registration-background');
    const registrationPopup = document.querySelector('.registration-popup');
    const popupMessage = registrationPopup.querySelector('p');
    const popupButton = registrationPopup.querySelector('button');
    const questionPopup = document.querySelector('.registration-question');
    const confirmBtn = document.querySelector('.yes-button');
    const closeBtn = document.querySelector('.no-button');

    let hasRegisteredAll = false;
    let hasRegisteredSome = false;
    let selectedCourses = new Set();

    function resetUI() {
        registrationCircles.forEach(circle => {
            circle.style.display = 'none';
            circle.style.backgroundColor = 'transparent';
        });
        selectedCourses.clear();
        registrationText.style.display = 'none';
        registrationBackground.style.display = 'none';
        registerButton.style.display = 'none';
        questionPopup.style.display = 'none';
        confirmBtn.style.display = 'none';
        closeBtn.style.display = 'none';
        registrationPopup.style.display = 'none';
        popupButton.style.display = 'none';
    }

    function disableAllLinks() {
        document.querySelectorAll('a').forEach(link => {
            link.style.pointerEvents = 'none';
            link.style.opacity = '0.5';
            link.setAttribute('aria-disabled', 'true');
        });
    }

    function enableAllLinks() {
        document.querySelectorAll('a').forEach(link => {
            link.style.pointerEvents = 'auto';
            link.style.opacity = '1';
            link.removeAttribute('aria-disabled');
        });
    }

    registerAllRadio.addEventListener('click', () => {
        resetUI();
        registrationText.style.display = 'none';
        registrationBackground.style.display = 'none';

        questionPopup.style.display = 'block';
        confirmBtn.style.display = 'inline-block';
        closeBtn.style.display = 'inline-block';

        confirmBtn.onclick = () => {
            disableAllLinks();

            localStorage.setItem('courseRegistered', 'true');

            if (!hasRegisteredAll) {
                popupMessage.textContent = 'Courses registered successfully! 🎉';
                hasRegisteredAll = true;
                const courseIcon = document.querySelector('#course-result i');
                if (courseIcon) {
                    courseIcon.classList.remove('fa-times');
                    courseIcon.classList.add('fa-check');
                }

            } else {
                popupMessage.textContent = '⚠️ You’ve already registered!';
            }
            popupMessage.style.display = 'block';
            registrationPopup.style.display = 'inline-block';
            popupButton.style.display = 'inline-block';
            questionPopup.style.display = 'none';
            confirmBtn.style.display = 'none';
            closeBtn.style.display = 'none';
        };
    });

    registerSomeRadio.addEventListener('click', () => {
        resetUI();
        registrationCircles.forEach(circle => {
            circle.style.display = 'inline-block';

            circle.onclick = (event) => {
                event.preventDefault();
                event.stopPropagation();

                if (circle.style.backgroundColor === 'transparent') {
                    circle.style.backgroundColor = '#d9d9d9';
                    selectedCourses.add(circle);
                } else {
                    circle.style.backgroundColor = 'transparent';
                    selectedCourses.delete(circle);
                }

                registerButton.style.display = selectedCourses.size > 0 ? 'inline-block' : 'none';
            };
        });

        registrationText.style.display = 'block';
        registrationBackground.style.display = 'block';
    });

    registerButton.addEventListener('click', () => {
        if (registerSomeRadio.checked && selectedCourses.size > 0) {
            questionPopup.style.display = 'block';
            confirmBtn.style.display = 'inline-block';
            closeBtn.style.display = 'inline-block';

            confirmBtn.onclick = () => {
                disableAllLinks();
                localStorage.setItem('courseRegistered', 'true');
                if (!hasRegisteredSome) {
                    popupMessage.textContent = 'Selected courses registered successfully! 🎉';
                    hasRegisteredSome = true;
                    const courseIcon = document.querySelector('#course-result i');
                    if (courseIcon) {
                        courseIcon.classList.remove('fa-times');
                        courseIcon.classList.add('fa-check');
                    }
                } else {
                    popupMessage.textContent = '⚠️ You’ve already registered selected courses!';
                }
                popupMessage.style.display = 'block';
                registrationPopup.style.display = 'inline-block';
                popupButton.style.display = 'inline-block';
                questionPopup.style.display = 'none';
                confirmBtn.style.display = 'none';
                closeBtn.style.display = 'none';
            };
        }
    });

    closeBtn.addEventListener('click', () => {
        questionPopup.style.display = 'none';
        confirmBtn.style.display = 'none';
        closeBtn.style.display = 'none';
    });

    popupButton.addEventListener('click', () => {
        registrationPopup.style.display = 'none';
        popupButton.style.display = 'none';
        enableAllLinks();
        resetUI();
        registerAllRadio.checked = false;
        registerSomeRadio.checked = false;
    });
}

document.addEventListener('DOMContentLoaded', setupCourseRegistration);

