
    const courseInfo = [
  {
    id: 1,
    title: "Introduction to Programming",
    lecturer: "Dr. Smith",
    location: "Room 101",
    time: ["Monday 10:00 - 12:00", "Friday 11:30am - 1:30am"],
    status: "online class available",
    note: "Online Class available",
    image: "images.jpg"
  },
  {
    id: 2,
    title: "Introduction to Programming",
    lecturer: "Mr. Kwame Osei",
    location: "Room 101",
    time: ["Monday 15:00 - 17:00", "Friday 11:30am - 1:30am"],
   
  },
  {
    id: 3,
    title: "Introduction to Programming",
    lecturer: "Dr. Smith",
    location: "Room 101",
    time: ["Monday 10:00 - 12:00", "Friday 11:30am - 1:30am"],
    status: "online class available",
    note: "Online Class available"
  },
  {
    id: 4,
    title: "Introduction to Programming",
    lecturer: "Dr. Smith",
    location: "Room 101",
    time: ["Monday 10:00 - 12:00", "Friday 11:30am - 1:30am"],
    status: "quiz available",
    note: "Quiz in progress"
  },
  {
    id: 5,
    title: "Introduction to Programming",
    lecturer: "Dr. Smith",
    location: "Room 101",
    time: ["Monday 10:00 - 12:00", "Friday 11:30am - 1:30am"],
   
  },
  {
    id: 6,
    title: "Introduction to Programming",
    lecturer: "Dr. Smith",
    location: "Room 101",
    time: ["Monday 10:00 - 12:00", "Friday 11:30am - 1:30am"],
    status: "quiz available",
    note: "Quiz in progress"
  },
  {
    id: 7,
    title: "Introduction to Programming",
    lecturer: "Dr. Smith",
    location: "Room 101",
    time: ["Monday 10:00 - 12:00", "Friday 11:30am - 1:30am"],
   
  },
  {
    id: 8,
    title: "Introduction to Programming",
    lecturer: "Dr. Smith",
    location: "Room 101",
    time: ["Monday 10:00 - 12:00", "Friday 11:30am - 1:30am"],
   
  },
  {
    id: 9,
    title: "Introduction to Programming",
    lecturer: "Dr. Smith",
    location: "Room 101",
    time: ["Monday 10:00 - 12:00", "Friday 11:30am - 1:30am"],
   
  },
  {
    id: 10,
    title: "Introduction to Programming",
    lecturer: "Dr. Smith",
    location: "Room 101",
    time: ["Monday 10:00 - 12:00", "Friday 11:30am - 1:30am"],
    status: "quiz available",
    note: "Quiz in progress"
  }
];
  
const params = new URLSearchParams(window.location.search);
const courseId = parseInt(params.get("id"));
const course = courseInfo.find(c => c.id === courseId);

if (course) {
  // Populate course details
  document.getElementById("lecturer-image").src = course.image || "default.jpg";
  document.getElementById("lecturer-image").alt = course.lecturer;
  document.getElementById("course-title").textContent = course.title;
  document.getElementById("lecturer-name").textContent = course.lecturer;
  document.getElementById("course-location").textContent = course.location;
  document.getElementById("course-time").innerHTML = course.time.join("<br>");
  document.getElementById("course-status").textContent = course.status || "N/A";
  document.getElementById("course-note").textContent = course.note || "";

  const activityArea = document.getElementById("activity-area");

  // Example activities (can be empty)
  const activities = [
     //{ type: "Online Class", location: "Zoom", time: "Now" },
     //{ type: "Online Quiz", location: "Google Classroom", time: "14:30 - 16:30" }
  ];

  const validActivities = activities.filter(a => a.type && a.type.trim() !== "");

  if (validActivities.length === 0) {
    // Update course status and note when no activities
    document.getElementById("course-status").textContent = "No activity available";
    document.getElementById("course-note").textContent = "No scheduled activity";

    activityArea.innerHTML = `<p class="no-activity-message">You have no activities.</p>`;
  } else {
    // Optional: update course status based on first activity type
    document.getElementById("course-status").textContent = validActivities[0].type;
    document.getElementById("course-note").textContent = "Activity scheduled";

    validActivities.forEach(activity => {
      const box = document.createElement("div");
      box.className = "Activity-box";
      box.innerHTML = `
        <h2>${course.title}</h2>
        <p><strong>Activity:</strong> ${activity.type}</p>
        <p><strong>Location:</strong> ${activity.location}</p>
        <p><strong>Time:</strong> ${activity.time}</p>
      `;
      activityArea.appendChild(box);
    });
  }
} else {
  document.querySelector(".course-details").innerHTML = "<p>Course not found.</p>";
}

// Calendar logic
const calendarDates = document.getElementById("calendar-dates");
const monthYear = document.getElementById("month-year");
const prevMonthBtn = document.getElementById("prev-month");
const nextMonthBtn = document.getElementById("next-month");

let currentDate = new Date();

const schoolEvents = {
  "2025-10-15": "Midterm Exams",
  "2025-10-20": "Parent-Teacher Meeting",
  "2025-10-25": "Sports Day"
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