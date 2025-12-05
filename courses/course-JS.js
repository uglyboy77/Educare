document.addEventListener("DOMContentLoaded", () => {
  const studentId = localStorage.getItem("studentId");
  const courseContainer = document.querySelector(".coursecontainer");

  if (!studentId) {
    courseContainer.innerHTML = "<p>❌ No student ID found. Please log in again.</p>";
    return;
  }

  fetch(`http://127.0.0.1:3000/courses/${studentId}`)
    .then(res => res.json())
    .then(data => {
      courseContainer.innerHTML = "";
      if (!data.courses || data.courses.length === 0) {
        courseContainer.innerHTML = "<p>No courses found for this student.</p>";
        return;
      }

      data.courses.forEach(course => {
        let wrapperClass = "none";
        if (course.status?.toLowerCase().includes("quiz")) {
          wrapperClass = "Quiz";
        } else if (course.status?.toLowerCase().includes("online")) {
          wrapperClass = "online";
        }

        let indicatorClass = "indication3";
        let tooltip = "";
        if (wrapperClass === "Quiz") {
          indicatorClass = "indication1";
          tooltip = "Quiz in progress";
        } else if (wrapperClass === "online") {
          indicatorClass = "indication";
          tooltip = "Online class available";
        }

        const link = document.createElement("a");
        const pageName = "coursebody.html";

        link.href = `../course-body/${pageName}?id=${course.id}`;
        link.className = "course-link";

        const wrapper = document.createElement("div");
        wrapper.className = wrapperClass;

        const box = document.createElement("div");
        box.className = "coursebox";

        box.innerHTML = `
          <p>Location: ${course.location}</p>
          <span class="${indicatorClass}">
            ${tooltip ? `<span>${tooltip}</span>` : ""}
          </span>
          <h2>Course Title: ${course.courseName}</h2>
          <p>Lecturer: ${course.lecturer}</p>
          <p>Time: ${course.time.replace(/, /g, "<br>")}</p>
          <span class="registration-circle" data-id="${course.id}"></span>
        `;

        wrapper.appendChild(box);
        link.appendChild(wrapper);
        courseContainer.appendChild(link);
      });
      setupCourseRegistration(studentId);
    })
    .catch(err => {
      console.error("❌ Error loading courses:", err);
      courseContainer.innerHTML = "<p>❌ Failed to load courses. Please try again later.</p>";
    });
});

function filterCourses() {
  const filterButtons = document.querySelectorAll('.filterbutton, .filterbutton1');

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filterType = button.textContent.trim();
      const allCourses = document.querySelectorAll('.coursebox');

      filterButtons.forEach(btn => btn.classList.remove('active'));

      button.classList.add('active');
      allCourses.forEach(course => {
        course.style.display = 'none';
      });

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


function setupCourseRegistration(studentId) {
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
  const registrationSuggestion = document.querySelector('.registration-suggestion');

  let hasRegisteredAll = false;
  let hasRegisteredSome = false;
  let selectedCourses = new Set();

  function resetUI() {
    registrationCircles.forEach(circle => {
      circle.style.display = 'none';
      circle.style.backgroundColor = 'transparent';
    });
    selectedCourses.clear();
    if (registrationText) registrationText.style.display = 'none';
    if (registrationBackground) registrationBackground.style.display = 'none';
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

  function registerCourses(courseIds) {
    fetch('http://127.0.0.1:3000/register-courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, courseIds })
    })
      .then(res => res.json())
      .then(data => {
        console.log(data.message);
        if (registrationSuggestion) registrationSuggestion.style.display = 'none';

        const registeredNames = data.registeredCourses || [];
        console.log("✅ Registered courses saved to database:", registeredNames.join(", "));
        courseIds.forEach(id => {
          const circle = document.querySelector(`.registration-circle[data-id="${id}"]`);
          if (circle) {
            circle.style.backgroundColor = '#a0a0a0';
            circle.style.pointerEvents = 'none';
          }
        });
      })

      .catch(err => {
        console.error("❌ Failed to register:", err);
      });
  }

  registerAllRadio.addEventListener('click', () => {
    resetUI();
    if (registrationText) registrationText.style.display = 'none';
    if (registrationBackground) registrationBackground.style.display = 'none';

    questionPopup.style.display = 'block';
    confirmBtn.style.display = 'inline-block';
    closeBtn.style.display = 'inline-block';

    confirmBtn.onclick = () => {
      disableAllLinks();
      const courseIds = [...document.querySelectorAll('.registration-circle')].map(circle =>
        parseInt(circle.dataset.id)
      );
      registerCourses(courseIds);

      popupMessage.textContent = !hasRegisteredAll
        ? 'Courses registered successfully! 🎉'
        : '⚠️ You’ve already registered!';
      hasRegisteredAll = true;

      popupMessage.style.display = 'block';
      registrationPopup.style.display = 'inline-block';
      popupButton.style.display = 'inline-block';
      questionPopup.style.display = 'none';
      confirmBtn.style.display = 'none';
      closeBtn.style.display = 'none';
    };
  });

  // Register SOME courses
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

    if (registrationText) registrationText.style.display = 'block';
    if (registrationBackground) registrationBackground.style.display = 'block';
  });

  registerButton.addEventListener('click', () => {
    if (registerSomeRadio.checked && selectedCourses.size > 0) {
      questionPopup.style.display = 'block';
      confirmBtn.style.display = 'inline-block';
      closeBtn.style.display = 'inline-block';

      confirmBtn.onclick = () => {
        disableAllLinks();
        const courseIds = [...selectedCourses].map(circle =>
          parseInt(circle.dataset.id) // ✅ using data-id attribute
        );
        registerCourses(courseIds);

        popupMessage.textContent = !hasRegisteredSome
          ? 'Selected courses registered successfully! 🎉'
          : '⚠️ You’ve already registered selected courses!';
        hasRegisteredSome = true;

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