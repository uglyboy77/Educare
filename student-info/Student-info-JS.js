const students = [
  {
    name: "Brenya Owusu",
    course: "BSc Computer Science",
    year: "Year 3",
    id: "STU2025-001",
    accomodation: "On-Campus - Block A",
    photo: "https://i.pravatar.cc/150?img=10", // student profile photo
    totalBill: "GHS 2,450",
    academicYears: "2022, 2023, 2024"
  }
];

document.addEventListener("DOMContentLoaded", () => {
  const student = students[0];

  // Set background image for header
  document.querySelector(".student-background").style.backgroundImage = `url('${student.photo}')`;

  // Set profile image as background
  document.querySelector(".student-image").style.backgroundImage = `url('${student.photo}')`;

  // Populate student info
  document.getElementById("student-name").textContent = `Name: ${student.name}`;
  document.getElementById("student-course").textContent = `Course: ${student.course}`;
  document.getElementById("student-year").textContent = `Year: ${student.year}`;
  document.getElementById("student-id").textContent = `ID: ${student.id}`;
  document.getElementById("student-accomodation").textContent = `Accommodation: ${student.accomodation}`;
  document.querySelector(".total-amount").textContent = `Total Bill: ${student.totalBill}`;
  document.querySelector(".years").textContent = `Academic Years: ${student.academicYears}`;
});



const years = ["Year 1", "Year 2", "Year 3", "Year 4"];
const semesters = ["Semester 1", "Semester 2"];
let currentYearIndex = 0;
let currentSemesterIndex = 0;

function updateDisplay() {
  const display = document.getElementById("display");
  const results = document.getElementById("results");
  const year = years[currentYearIndex];
  const semester = semesters[currentSemesterIndex];

  display.textContent = `${year} - ${semester}`;

  const courses = courseData[year]?.[semester];

  if (courses) {
    results.innerHTML = `
      <h3>Results for ${year} ${semester}</h3>
      <ul>
        ${courses.map(course => `<li>${course.name} — <strong>${course.grade}</strong></li>`).join("")}
      </ul>
    `;
  } else {
    results.innerHTML = `
      <h3>No resources available</h3>
      <p>Results for ${year} ${semester} are not yet added.</p>
    `;
  }
}

function goNext() {
  currentSemesterIndex++;
  if (currentSemesterIndex >= semesters.length) {
    currentSemesterIndex = 0;
    currentYearIndex++;
    if (currentYearIndex >= years.length) {
      currentYearIndex = 0;
    }
  }
  updateDisplay();
}

function goPrevious() {
  currentSemesterIndex--;
  if (currentSemesterIndex < 0) {
    currentSemesterIndex = semesters.length - 1;
    currentYearIndex--;
    if (currentYearIndex < 0) {
      currentYearIndex = years.length - 1;
    }
  }
  updateDisplay();
}

const courseData = {
  "Year 1": {
    "Semester 1": [
      { name: "Introduction to Programming", grade: "A" },
      { name: "Mathematics for Computing", grade: "B+" },
      { name: "Communication Skills", grade: "A-" },
      { name: "Computer Hardware Fundamentals", grade: "B" },
      { name: "Web Design Basics", grade: "A" },
      { name: "Digital Literacy", grade: "B+" },
      { name: "Critical Thinking", grade: "A" },
      { name: "Introduction to Databases", grade: "B" }
    ],
    "Semester 2": [
      { name: "Object-Oriented Programming", grade: "A-" },
      { name: "Discrete Mathematics", grade: "B+" },
      { name: "Technical Writing", grade: "A" },
      { name: "Operating Systems", grade: "B" },
      { name: "Web Development with HTML/CSS", grade: "A" },
      { name: "Database Management Systems", grade: "B+" },
      { name: "Software Tools & IDEs", grade: "A-" },
      { name: "Ethics in Technology", grade: "A" }
    ]
  },
};

updateDisplay();

const Billyears = ["Year 1", "Year 2", "Year 3", "Year 4"];
const Billsemesters = ["Semester 1", "Semester 2"];
let currentBillYearIndex = 0;
let currentBillSemesterIndex = 0;

const billData = {
  "Year 1": { "Semester 1": 0.00, "Semester 2": 0.00 },
  "Year 2": { "Semester 1": 0.00, "Semester 2": 1200.00 }
};

function updateBill() {
  const display = document.getElementById("display");
  const billInfo = document.getElementById("bill-info");
  const year = Billyears[currentBillYearIndex];
  const semester = Billsemesters[currentBillSemesterIndex];

  display.textContent = `${year} - ${semester}`;

  const amount = billData[year]?.[semester];
  const isPaid = amount === 0;


  if (amount !== undefined) {
    billInfo.innerHTML = `
          <h3>Billing Info for ${year} ${semester}</h3>
          <div class="bill-row">
            <span><strong>Amount:</strong> GHS ${amount.toFixed(2)}</span>
            <span class="badge ${isPaid ? 'paid' : 'owing'}">
              ${isPaid ? '✅ Paid' : '❌ Owing'}
            </span>
          </div>
        `;
  } else {
    billInfo.innerHTML = `
          <h3>No billing data available</h3>
          <p class="no-data">Billing info for ${year} ${semester} is not yet added.</p>
        `;
  }
}

function goNextBill() {
  currentBillSemesterIndex++;
  if (currentBillSemesterIndex >= Billsemesters.length) {
    currentBillSemesterIndex = 0;
    currentBillYearIndex++;
    if (currentBillYearIndex >= Billyears.length) {
      currentBillYearIndex = 0;
    }
  }
  updateBill();
}

function goPreviousBill() {
  currentBillSemesterIndex--;
  if (currentBillSemesterIndex < 0) {
    currentBillSemesterIndex = Billsemesters.length - 1;
    currentBillYearIndex--;
    if (currentBillYearIndex < 0) {
      currentBillYearIndex = Billyears.length - 1;
    }
  }
  updateBill();
}

window.onload = updateBill;

function showTranscript() {
  const transcriptMsg = document.querySelector(".Transcript-request-container");
  const transcriptContainer = document.querySelector(".Transcript-container");

  transcriptContainer.addEventListener('click', function handler(e) {
    transcriptMsg.style.display = 'inline-block';
    setTimeout(function () {
      transcriptMsg.style.display = 'none';
    }, 2000);
  });
}

showTranscript();