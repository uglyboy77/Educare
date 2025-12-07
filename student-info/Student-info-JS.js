const API_BASE = "https://educare-students-hub-eadz.onrender.com";

let dashboardData = null;

async function loadDashboard(studentId) {
  const res = await fetch(`${API_BASE}/dashboard/${studentId}`);
  dashboardData = await res.json();

  document.getElementById("student-course").textContent = `Course: ${dashboardData.student.course}`;
  document.getElementById("student-name").textContent = `Name: ${dashboardData.student.name}`;
  document.getElementById("student-id").textContent = `ID: ${dashboardData.student.studentId}`;

  if (dashboardData.student.image) {
    document.getElementById("student-image").src = `${API_BASE}${dashboardData.student.image}`;
    document.querySelector(".student-background").style.backgroundImage = `url('${API_BASE}${dashboardData.student.image}')`;
  } else {
    document.getElementById("student-image").removeAttribute("src");
    document.getElementById("student-image").alt = "No photo uploaded";
  }

  renderResults();
  renderBills();
}

const years = ["Year 1", "Year 2", "Year 3", "Year 4"];
const semesters = ["Semester 1", "Semester 2"];
let currentYearIndex = 0;
let currentSemesterIndex = 0;

function renderResults() {
  const display = document.getElementById("results-display");
  const results = document.getElementById("results");
  const year = years[currentYearIndex];
  const semester = semesters[currentSemesterIndex];

  display.textContent = `${year} - ${semester}`;

  const filtered = dashboardData.results.filter(r => r.year === year && r.semester === semester);

  if (filtered.length > 0) {
    results.innerHTML = `
      <h3>Results for ${year} ${semester}</h3>
      <ul>
        ${filtered.map(course => `<li>${course.courseName} — <strong>${course.grade}</strong></li>`).join("")}
      </ul>
    `;
  } else {
    results.innerHTML = `
      <h3>No results available</h3>
      <p>Results for ${year} ${semester} are not yet added.</p>
    `;
  }
}

function goNext() {
  currentSemesterIndex++;
  if (currentSemesterIndex >= semesters.length) {
    currentSemesterIndex = 0;
    currentYearIndex++;
    if (currentYearIndex >= years.length) currentYearIndex = 0;
  }
  renderResults();
}

function goPrevious() {
  currentSemesterIndex--;
  if (currentSemesterIndex < 0) {
    currentSemesterIndex = semesters.length - 1;
    currentYearIndex--;
    if (currentYearIndex < 0) currentYearIndex = years.length - 1;
  }
  renderResults();
}

const Billyears = ["Year 1", "Year 2", "Year 3", "Year 4"];
const Billsemesters = ["Semester 1", "Semester 2"];
let currentBillYearIndex = 0;
let currentBillSemesterIndex = 0;

function renderBills() {
  const display = document.getElementById("billing-display");
  const billInfo = document.getElementById("bill-info");
  const year = Billyears[currentBillYearIndex];
  const semester = Billsemesters[currentBillSemesterIndex];

  display.textContent = `${year} - ${semester}`;

  const total = dashboardData.bills.reduce((sum, b) => sum + (b.amount || 0), 0);
  const filtered = dashboardData.bills.filter(b => b.year === year);

  if (filtered.length > 0) {
    const bill = filtered[0];

    billInfo.innerHTML = `
    <h3>Billing Info for ${year} ${semester}</h3>
    <div class="bill-row">
      <span><strong>Amount:</strong>${bill.year} - ${bill.label} GHS ${bill.amount.toFixed(2)}</span>
      <span class="badge ${bill.amount === 0 ? 'paid' : 'owing'}">
        ${bill.amount === 0 ? '✅ Paid' : '❌ Owing'}
      </span>
    </div>
    <hr/>
    <div class="bill-row total">
      <strong>Grand Total Owing:</strong>
      <strong>GHS ${total.toFixed(2)}</strong>
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
    if (currentBillYearIndex >= Billyears.length) currentBillYearIndex = 0;
  }
  renderBills();
}

function goPreviousBill() {
  currentBillSemesterIndex--;
  if (currentBillSemesterIndex < 0) {
    currentBillSemesterIndex = Billsemesters.length - 1;
    currentBillYearIndex--;
    if (currentBillYearIndex < 0) currentBillYearIndex = Billyears.length - 1;
  }
  renderBills();
}

// On page load
const studentId = localStorage.getItem("studentId");
window.onload = () => {
  loadDashboard(studentId);
};

// Transcript request popup
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
