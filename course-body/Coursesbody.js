// Computer Science Year 1
const csY1Courses = [
  { id: 1, courseCode: "CSC100", courseName: "Introduction to Programming", lecturer: "Mr. Smith", location: "Room 101", time: "Monday 10:00 - 12:00", status: "None", note: "" },
  { id: 2, courseCode: "CSC101", courseName: "Data Structures I", lecturer: "Dr. Smith", location: "Room 202", time: "Tuesday 2:00pm - 4:00pm", status: "Online Class available", note: "Online Class available" },
  { id: 3, courseCode: "CSC103", courseName: "Computer Architecture", lecturer: "Dr. Smith", location: "Lab A", time: "Wednesday 8:30am - 10:30am", status: "Online Class available", note: "Online Class available" },
  { id: 4, courseCode: "CSC104", courseName: "Discrete Mathematics", lecturer: "Dr. Smith", location: "Lecture Hall 3", time: "Friday 11:30am - 1:30pm", status: "Quiz available", note: "Quiz in progress" }
];

// Economics Year 2
const ecoY2Courses = [
  { id: 5, courseCode: "ECO200", courseName: "Microeconomics II", lecturer: "Prof. Johnson", location: "Room 305", time: "Monday 10:00 - 12:00", status: "None", note: "" },
  { id: 6, courseCode: "ECO201", courseName: "Macroeconomics II", lecturer: "Dr. Brown", location: "Room 202", time: "Tuesday 2:00pm - 4:00pm", status: "Online Class available", note: "Online Class available" },
  { id: 7, courseCode: "ECO203", courseName: "Econometrics I", lecturer: "Dr. Brown", location: "Lab A", time: "Wednesday 8:30am - 10:30am", status: "Online Class available", note: "Online Class available" },
  { id: 8, courseCode: "ECO204", courseName: "Development Economics", lecturer: "Dr. Brown", location: "Lecture Hall 3", time: "Friday 11:30am - 1:30pm", status: "Quiz available", note: "Quiz in progress" }
];


const params = new URLSearchParams(window.location.search);
const courseId = parseInt(params.get("id"));
const program = params.get("program");

let courseInfo;
if (courseId >= 1 && courseId <= 4) {
  courseInfo = csY1Courses;
} else if (courseId >= 5 && courseId <= 8) {
  courseInfo = ecoY2Courses;
} else {
  document.querySelector(".course-details").innerHTML = "<p>No program selected.</p>";
  courseInfo = [];
}

const course = courseInfo.find(c => c.id === courseId);

if (course) {
  document.getElementById("lecturer-image").src = course.image || "default.jpg";
  document.getElementById("lecturer-image").alt = course.lecturer;
  document.getElementById("course-code").textContent = course.courseCode;
  document.getElementById("course-title").textContent = course.courseName;
  document.getElementById("lecturer-name").textContent = course.lecturer;
  document.getElementById("course-location").textContent = course.location;
  document.getElementById("course-time").innerHTML = course.time;
  document.getElementById("course-status").textContent = course.status || "N/A";
  document.getElementById("course-note").textContent = course.note || "";

  const activityArea = document.getElementById("activity-area");

  const activities = [];
  if (course.status.includes("Online Class")) {
    activities.push({ type: "Online Class", location: "Zoom", time: "Now" });
  }
  if (course.status.includes("Quiz")) {
    activities.push({ type: "Online Quiz", location: "Google Classroom", time: "14:30 - 16:30" });
  }

  const validActivities = activities.filter(a => a.type && a.type.trim() !== "");

  if (validActivities.length === 0) {
    document.getElementById("course-status").textContent = "No activity available";
    document.getElementById("course-note").textContent = "No scheduled activity";

    activityArea.innerHTML = `<p class="no-activity-message">You have no activities.</p>`;
  } else {
    document.getElementById("course-status").textContent = validActivities[0].type;
    document.getElementById("course-note").textContent = "Activity scheduled";

    validActivities.forEach(activity => {
      const box = document.createElement("div");
      box.className = "Activity-box";
      box.innerHTML = `
        <h2>${course.courseName}</h2>
        <p><strong>Activity:</strong> ${activity.type}</p>
        <p><strong>Location:</strong> ${activity.location}</p>
        <p><strong>Time:</strong> ${activity.time}</p>
        <span class="activity-badge">Live</span>
      `;
      activityArea.appendChild(box);
    });
  }
} else {
  document.querySelector(".course-details").innerHTML = "<p>Course not found.</p>";
}

const input = document.getElementById("student-message");
const lecturerName = course.lecturer;
input.placeholder = `Send a message to ${lecturerName}`;

const form = document.getElementById("message-form");

const calendarDates = document.getElementById("calendar-dates");
const monthYear = document.getElementById("month-year");
const prevMonthBtn = document.getElementById("prev-month");
const nextMonthBtn = document.getElementById("next-month");

let currentDate = new Date();

const schoolEvents = {
  "2025-12-25": "Christmas Holiday",
  "2025-12-26": "Boxing Day",
  "2025-12-31": "New Year's Eve",
  "2026-01-01": "New Year's Day",
  "2026-01-10": "Semester 1 Begins",
};

function renderCalendar(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  monthYear.textContent = `${date.toLocaleString('default', { month: 'long' })} ${year}`;
  calendarDates.innerHTML = "";

  for (let i = 0; i < firstDay; i++) {
    calendarDates.innerHTML += `<div></div>`;
  }

  for (let day = 1; day <= lastDate; day++) {
    const fullDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
    const isEvent = schoolEvents[fullDate];

    calendarDates.innerHTML += `<div class="${isToday ? 'today' : ''} ${isEvent ? 'event-day' : ''}" title="${isEvent || ''}">${day}</div>`;
  }
}

prevMonthBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar(currentDate);
});

nextMonthBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar(currentDate);
});

renderCalendar(currentDate);