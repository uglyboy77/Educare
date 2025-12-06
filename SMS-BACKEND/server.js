const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const multer = require('multer');


const storage = multer.diskStorage({
  destination: path.join(__dirname, "uploads"),
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

console.log("🚀 EDUCARE backend starting...");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '../EDUCARE')));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(cors({
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500']
}));
app.use(express.json());

let db;
try {
  db = new Database('./SMS-BACKEND/educare.db');
} catch (err) {
  console.error("❌ Failed to connect to database:", err);
  process.exit(1);
}
db.pragma("journal_mode = WAL");
db.pragma("busy_timeout = 5000");

db.prepare(`CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  studentId TEXT,
  firstName TEXT,
  middleName TEXT,
  lastName TEXT,
  email TEXT,
  phoneNumber TEXT,
  password TEXT
)`).run();

const hasStudentRegisteredColumn = db.prepare(`PRAGMA table_info(students)`).all().some(col => col.name === 'registered');
if (!hasStudentRegisteredColumn) {
  db.prepare(`ALTER TABLE students ADD COLUMN registered TEXT DEFAULT ''`).run();
}

const hasIdColumn = db.prepare(`PRAGMA table_info(courses)`).all().some(col => col.name === 'id');
if (!hasIdColumn) {
  db.prepare(`ALTER TABLE courses RENAME TO courses_old`).run();
  db.prepare(`CREATE TABLE courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    studentId TEXT,
    courseCode TEXT,
    courseName TEXT,
    lecturer TEXT,
    location TEXT,
    time TEXT,
    status TEXT,
    note TEXT
  )`).run();
}

db.prepare(`
  CREATE TABLE IF NOT EXISTS courses  (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    studentId TEXT,
    courseCode TEXT,
    courseName TEXT,
    lecturer TEXT,
    location TEXT,
    time TEXT,
    status TEXT,
    note TEXT,
    UNIQUE(studentId, courseCode)
  )
`).run();

const csY1Courses = [
  { code: "CSC100", name: "Introduction to Programming", lecturer: "Mr. Smith", room: "Room 101", time: "Monday 10:00 - 12:00", status: "None", note: "" },
  { code: "CSC101", name: "Data Structures I", lecturer: "Dr. Smith", room: "Room 202", time: "Tuesday 2:00pm - 4:00pm", status: "Online Class available", note: "Online Class available" },
  { code: "CSC103", name: "Computer Architecture", lecturer: "Dr. Smith", room: "Lab A", time: "Wednesday 8:30am - 10:30am", status: "Online Class available", note: "Online Class available" },
  { code: "CSC104", name: "Discrete Mathematics", lecturer: "Dr. Smith", room: "Lecture Hall 3", time: "Friday 11:30am - 1:30pm", status: "Quiz available", note: "Quiz in progress" }
];

const ecoY2Courses = [
  { code: "ECO200", name: "Microeconomics II", lecturer: "Prof. Johnson", room: "Room 305", time: "Monday 10:00 - 12:00", status: "None", note: "" },
  { code: "ECO201", name: "Macroeconomics II", lecturer: "Dr. Brown", room: "Room 202", time: "Tuesday 2:00pm - 4:00pm", status: "Online Class available", note: "Online Class available" },
  { code: "ECO203", name: "Econometrics I", lecturer: "Dr. Brown", room: "Lab A", time: "Wednesday 8:30am - 10:30am", status: "Online Class available", note: "Online Class available" },
  { code: "ECO204", name: "Development Economics", lecturer: "Dr. Brown", room: "Lecture Hall 3", time: "Friday 11:30am - 1:30pm", status: "Quiz available", note: "Quiz in progress" }
];

function insertCourses(studentId) {
  const student = db.prepare('SELECT course FROM students WHERE studentId = ?').get(studentId);

  if (!student || !student.course) {
    return;
  }

  const program = student.course.toLowerCase();

  let courses;
  if (program.includes("computer-science-y1")) {
    courses = csY1Courses;
  } else if (program.includes("economics-y2")) {
    courses = ecoY2Courses;
  } else {
    console.log(`❌ Unknown program: ${program}`);
    return;
  }

  courses.forEach(course => {
    db.prepare(`
      INSERT OR IGNORE INTO courses(studentId, courseCode, courseName, lecturer, location, time, status, note)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      studentId,
      course.code,
      course.name,
      course.lecturer,
      course.room,
      course.time,
      course.status,
      course.note
    );
  });
}

const students = db.prepare('SELECT studentId FROM students').all();
students.forEach(student => {
  insertCourses(student.studentId);
});

db.prepare(`CREATE TABLE IF NOT EXISTS transcripts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  studentId TEXT,
  requestedAt TEXT
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  studentId TEXT,
  email TEXT,
  recipientId TEXT,
  subject TEXT,
  body TEXT,
  sentAt TEXT,
  unread INTEGER DEFAULT 1,
  hidden INTEGER DEFAULT 0
)`).run();


db.prepare(`UPDATE students
SET accommodationAmount = 1500.00,
    accommodationStatus = 'owing',
    activitiesAmount = 400.00,
    activitiesStatus = 'owing',
    compensationAmount = 200.00,
    compensationStatus = 'owing'
WHERE course = 'Computer-Science-Y1';
`).run();

db.prepare(`UPDATE students
SET accommodationAmount = 1200.00,
    accommodationStatus = 'owing',
    activitiesAmount = 600.00,
    activitiesStatus = 'owing',
    compensationAmount = 100.00,
    compensationStatus = 'owing'
WHERE course = 'Economics-Y2';
`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  studentId TEXT NOT NULL,
  year INTEGER NOT NULL,
  semester INTEGER NOT NULL,
  courseName TEXT NOT NULL,
  grade TEXT NOT NULL,
  score TEXT NOT NULL,
  lecturer TEXT NOT NULL,
  creditHours INTEGER NOT NULL,
  link TEXT,
  trailStatus TEXT CHECK(trailStatus IN ('none','failed','incomplete','retake')) DEFAULT 'none',
  UNIQUE(studentId, year, semester, courseName)
)`).run();

/*
db.prepare(`INSERT OR IGNORE INTO results (
  studentId, year, semester, courseName, grade, score, lecturer, creditHours, link, trailStatus
) VALUES
('2168324', 1, 1, 'Introduction to Programming', 'A', '85%', 'Dr. Smith', 3, 'Coursebody.html?id=33', 'none'),
('2168324', 1, 1, 'Mathematics I', 'F', '35%', 'Mr. Kwame Osei', 3, 'Coursebody.html?id=34', 'failed'),
('2168324', 1, 1, 'Communication Skills', 'B', '70%', 'Mrs. Akua Mensah', 2, 'Coursebody.html?id=35', 'none')
`).run();

db.prepare(`INSERT OR IGNORE INTO results (
  studentId, year, semester, courseName, grade, score, lecturer, creditHours, link, trailStatus
) VALUES
('3185923', 1, 1, 'Microeconomics I', 'B', '72%', 'Prof. Johnson', 3, 'Coursebody.html?id=41', 'none'),
('3185923', 1, 1, 'Macroeconomics I', 'C', '55%', 'Dr. Brown', 3, 'Coursebody.html?id=42', 'none'),
('3185923', 1, 1, 'Statistics I', 'A', '88%', 'Dr. Mensah', 3, 'Coursebody.html?id=43', 'none'),
('3185923', 1, 1, 'Communication Skills', 'B', '70%', 'Mrs. Akua Mensah', 2, 'Coursebody.html?id=44', 'none')
`).run();

db.prepare(`DELETE FROM results WHERE semester = 1;`).run();  
*/

db.prepare(`DROP TABLE IF EXISTS lecturer_evaluations;`).run();
db.prepare(`CREATE TABLE lecturer_evaluations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  studentId TEXT NOT NULL,
  lecturerName TEXT NOT NULL,
  courseName TEXT NOT NULL,
  clarity TEXT NOT NULL,
  engagement TEXT NOT NULL,
  feedback TEXT NOT NULL,
  comments TEXT,
  submittedAt DATETIME DEFAULT CURRENT_TIMESTAMP
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  studentId TEXT NOT NULL,
  studentName TEXT NOT NULL,
  studentEmail TEXT NOT NULL,
  message TEXT NOT NULL,
  submittedAt DATETIME DEFAULT CURRENT_TIMESTAMP
)`).run();



app.get('/dashboard/:studentId', (req, res) => {
  const studentId = req.params.studentId;
  try {

    const student = db.prepare(`
      SELECT studentId, firstName, lastName,course,image
      FROM students WHERE studentId = ?
    `).get(studentId);

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    const results = db.prepare(`
  SELECT year, semester, courseName, grade
  FROM results WHERE studentId = ?
  ORDER BY year, semester
`).all(studentId).map(r => ({
      ...r,
      year: `Year ${r.year}`,
      semester: `Semester ${r.semester}`
    }));

    const studentBills = db.prepare(`
  SELECT accommodationAmount, accommodationStatus,
         activitiesAmount, activitiesStatus,
         compensationAmount, compensationStatus
  FROM students WHERE studentId = ?
`).get(studentId);

    const bills = [
      { year: "Year 1", label: "Accommodation", amount: studentBills.accommodationAmount, status: studentBills.accommodationStatus },
      { year: "Year 1", label: "Extra Activities", amount: studentBills.activitiesAmount, status: studentBills.activitiesStatus },
      { year: "Year 1", label: "Teacher's Compensation", amount: studentBills.compensationAmount, status: studentBills.compensationStatus }
    ];

    const totalBill = bills.reduce((sum, b) => sum + (b.amount || 0), 0);

    res.json({
      student: {
        studentId: student.studentId,
        name: `${student.firstName} ${student.lastName}`,
        image: student.image,
        course: student.course,
        totalBill
      },
      results,
      bills
    });


  } catch (err) {
    console.error("❌ Failed to fetch dashboard:", err);
    res.status(500).json({ error: "Database error fetching dashboard" });
  }
});

app.post('/register-courses', (req, res) => {
  const { studentId, courseIds } = req.body;
  console.log("📦 Incoming registration:", studentId, courseIds);
  try {
    const getCourse = db.prepare('SELECT id, courseName FROM courses WHERE id = ?');
    const coursePairs = courseIds
      .map(id => {
        const course = getCourse.get(id);
        return course ? `${course.id}:${course.courseName}` : null;
      })
      .filter(Boolean);

    const existing = db.prepare('SELECT registered FROM students WHERE studentId = ?').get(studentId);
    const previous = existing?.registered ? existing.registered.split(',') : [];
    const updated = [...new Set([...previous, ...coursePairs])].join(',');

    const result = db.prepare('UPDATE students SET registered = ? WHERE studentId = ?').run(updated, studentId);
    console.log("🛠️ Rows updated:", result.changes);

    res.json({ message: '✅ Courses registered successfully', registeredCourses: coursePairs });
  } catch (err) {
    console.error("❌ Registration failed:", err);
    res.status(500).json({ error: 'Database error during registration' });
  }
});

app.get('/courses/:studentId', (req, res) => {
  const studentId = req.params.studentId;
  try {
    const student = db.prepare('SELECT registered FROM students WHERE studentId = ?').get(studentId);
    const registeredPairs = student?.registered ? student.registered.split(',') : [];
    const registeredIds = registeredPairs.map(pair => pair.split(':')[0]);

    const courses = db.prepare('SELECT * FROM courses WHERE studentId = ?').all(studentId);

    const coursesWithStatus = courses.map(course => {
      return {
        ...course,
        registered: registeredIds.includes(course.id.toString()) ? 'yes' : 'no'
      };
    });

    res.json({ courses: coursesWithStatus });
  } catch (err) {
    console.error("❌ Failed to fetch courses:", err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/course/:id', (req, res) => {
  const courseId = req.params.id;
  try {
    const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json({ course });
  } catch (err) {
    console.error("❌ Failed to fetch course by ID:", err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post("/signup", upload.single("image"), (req, res) => {
  const { studentId, firstName, middleName, lastName, email, phoneNumber, password, course } = req.body;

  try {
    const existing = db.prepare("SELECT * FROM students WHERE email = ?").get(email);
    if (existing) {
      return res.status(409).json({ error: "Account already exists with this email" });
    }

    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    db.prepare(`
      INSERT INTO students (studentId, firstName, middleName, lastName, email, phoneNumber, password, course, image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(studentId, firstName, middleName, lastName, email, phoneNumber, password, course, imagePath);

    res.status(201).json({ message: "✅ Signup successful", image: imagePath });
  } catch (err) {
    console.error("❌ Signup failed:", err);
    res.status(500).json({ error: "Database error during signup" });
  }
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  try {
    const student = db.prepare('SELECT * FROM students WHERE email = ?').get(email);
    if (!student) {
      return res.status(404).json({ error: 'Account not found' });
    }
    if (student.password !== password) {
      return res.status(401).json({ error: 'Incorrect password' });
    }
    res.json({
      message: '✅ Login successful',
      studentId: student.studentId,
      name: `${student.firstName} ${student.lastName}`
    });
  } catch (err) {
    console.error("❌ Login failed:", err);
    res.status(500).json({ error: 'Database error during login' });
  }
});


app.get('/student-info/:id', (req, res) => {
  const studentId = req.params.id;
  try {
    const student = db.prepare('SELECT firstName, lastName, image FROM students WHERE studentId = ?').get(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({
      name: `${student.firstName} ${student.lastName}`, image: student.image
    });
  } catch (err) {
    console.error("❌ Failed to fetch student info:", err);
    res.status(500).json({ error: 'Database error' });
  }
});


app.post('/request-transcript', (req, res) => {
  const { studentId } = req.body;
  console.log("Incoming transcript request body:", req.body);
  try {
    const result = db.prepare(
      `INSERT INTO transcripts (studentId, requestedAt) VALUES (?, datetime('now'))`
    ).run(studentId);

    console.log(`📄 Transcript requested by student ${studentId}, rowid: ${result.lastInsertRowid}`);
    res.json({ message: `Transcript request recorded for student ${studentId}` });
  } catch (err) {
    console.error("❌ Transcript request failed:", err);
    res.status(500).json({ error: 'Database error during transcript request' });
  }
});

app.post('/send-message', (req, res) => {
  const { studentId, email, recipientId, subject, body } = req.body;
  try {
    db.prepare(`INSERT INTO messages 
      (studentId, email, recipientId, subject, body, sentAt) 
      VALUES (?, ?, ?, ?, ?, datetime('now'))`)
      .run(studentId, email, recipientId, subject, body);

    res.json({ message: "✅ Message saved to DB" });
  } catch (err) {
    console.error("❌ Failed to save message:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get('/messages/:studentId', (req, res) => {
  const studentId = req.params.studentId;
  try {
    const messages = db.prepare(`SELECT * FROM messages WHERE recipientId = ? ORDER BY sentAt DESC`).all(studentId);
    res.json({ messages });
  } catch (err) {
    console.error("❌ Failed to fetch messages:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get('/sent-messages/:studentId', (req, res) => {
  const studentId = req.params.studentId;
  try {
    const messages = db.prepare(
      `SELECT * FROM messages WHERE studentId = ? AND hidden = 0 ORDER BY sentAt DESC`
    ).all(studentId);

    res.json({ messages });
  } catch (err) {
    console.error("❌ Failed to fetch sent messages:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.post('/register-student', (req, res) => {
  const { studentId, email } = req.body;

  try {
    db.prepare(`INSERT INTO students (studentId, email) VALUES (?, ?)`)
      .run(studentId, email);

    db.prepare(`INSERT INTO messages 
      (studentId, email, recipientId, subject, body, sentAt, unread, hidden) 
      VALUES (?, ?, ?, ?, ?, datetime('now'), 1, 0)`)
      .run("Admin", "admin@educare.com", studentId, "Welcome to EDUCARE",
        "Your dashboard is now active. Explore courses, results, and more.");

    res.json({ message: "✅ Student registered and welcome message sent" });
  } catch (err) {
    console.error("❌ Failed to register student:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.put('/update-message/:id', (req, res) => {
  const { unread, hidden } = req.body;
  const id = req.params.id;
  try {
    db.prepare(`UPDATE messages SET unread = ?, hidden = ? WHERE id = ?`)
      .run(unread, hidden, id);
    res.json({ message: "✅ Message updated" });
  } catch (err) {
    console.error("❌ Failed to update message:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get('/registration-status/:studentId', (req, res) => {
  const studentId = req.params.studentId;
  try {
    const student = db.prepare(
      `SELECT registered, biometricRegistered, medicalRegistered 
       FROM students WHERE studentId = ?`
    ).get(studentId);

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    const registeredCourses = student.registered
      ? student.registered.split(',')
      : [];

    res.json({
      registeredCourses,
      biometricRegistered: student.biometricRegistered === 1,
      medicalRegistered: student.medicalRegistered === 1
    });
  } catch (err) {
    console.error("❌ Failed to fetch registration status:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get('/student-bills/:studentId', (req, res) => {
  const { studentId } = req.params;
  const stmt = db.prepare(`
    SELECT course, accommodationAmount, accommodationStatus,
           activitiesAmount, activitiesStatus,
           compensationAmount, compensationStatus
    FROM students
    WHERE studentId = ?
  `);
  const student = stmt.get(studentId);

  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  let accommodationAmount = student.accommodationAmount;
  let activitiesAmount = student.activitiesAmount;
  let compensationAmount = student.compensationAmount;

  if (student.course === "Computer-Science-Y1") {
    accommodationAmount = 1500.00;
    activitiesAmount = 400.00;
    compensationAmount = 200.00;
  } else if (student.course === "Economics-Y2") {
    accommodationAmount = 1200.00;
    activitiesAmount = 600.00;
    compensationAmount = 100.00;
  }

  const total = accommodationAmount + activitiesAmount + compensationAmount;

  res.json({
    program: student.course,
    total,
    items: [
      { label: "Accommodation", amount: accommodationAmount, status: student.accommodationStatus },
      { label: "Extra Activities", amount: activitiesAmount, status: student.activitiesStatus },
      { label: "Teacher's Compensation", amount: compensationAmount, status: student.compensationStatus }
    ]
  });
});

app.get('/results/:studentId/:year/:semester', (req, res) => {
  const { studentId, year, semester } = req.params;
  try {
    const results = db.prepare(`
      SELECT courseName, grade, score, lecturer, creditHours, link, trailStatus
      FROM results
      WHERE studentId = ? AND year = ? AND semester = ?
    `).all(studentId, year, semester);

    const trailCount = results.filter(r => r.trailStatus !== 'none').length;

    res.json({ results, trailCount });
  } catch (err) {
    console.error("❌ Failed to fetch results:", err);
    res.status(500).json({ error: 'Database error fetching results' });
  }
});

app.get('/download-results/:studentId/:year/:semester', (req, res) => {
  const { studentId, year, semester } = req.params;

  try {
    const student = db.prepare('SELECT firstName, lastName FROM students WHERE studentId = ?').get(studentId);
    const results = db.prepare(`
      SELECT courseName, grade, score, lecturer, creditHours, trailStatus
      FROM results
      WHERE studentId = ? AND year = ? AND semester = ?
    `).all(studentId, year, semester);

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=results_${studentId}_Y${year}S${semester}.pdf`);
    doc.pipe(res);

    doc.fontSize(20).text('Student Results', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Student ID: ${studentId}`);
    doc.text(`Name: ${student.firstName} ${student.lastName}`);
    doc.text(`Year: ${year}, Semester: ${semester}`);
    doc.moveDown();

    results.forEach(r => {
      if (r.trailStatus !== 'none') {
        doc.fillColor('red');
      } else {
        doc.fillColor('black');
      }

      doc.fontSize(12).text(
        `${r.courseName} | Grade: ${r.grade} | Score: ${r.score} | Lecturer: ${r.lecturer} | Credit Hours: ${r.creditHours} | Trail: ${r.trailStatus}`
      );
    });

    doc.end();
  } catch (err) {
    console.error("❌ Failed to generate PDF:", err);
    res.status(500).json({ error: 'Error generating PDF' });
  }
});

app.post('/evaluate-lecturer', (req, res) => {
  const { studentId, lecturerName, courseName, clarity, engagement, feedback, comments } = req.body;

  try {
    db.prepare(`INSERT INTO lecturer_evaluations 
      (studentId, lecturerName, courseName, clarity, engagement, feedback, comments) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`)
      .run(studentId, lecturerName, courseName, clarity, engagement, feedback, comments);

    res.json({ message: "✅ Evaluation saved" });
  } catch (err) {
    console.error("❌ Failed to save evaluation:", err);
    res.status(500).json({ error: "Database error saving evaluation" });
  }
});

app.post('/submit-feedback', (req, res) => {
  const { studentId, studentName, studentEmail, message } = req.body;

  try {
    db.prepare(`INSERT INTO feedback 
      (studentId,studentName, studentEmail, message, submittedAt) 
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`)
      .run(studentId, studentName, studentEmail, message);

    res.json({ message: "✅ Feedback submitted" });
  } catch (err) {
    console.error("❌ Failed to submit feedback:", err);
    res.status(500).json({ error: "Database error submitting feedback" });
  }
});

app.get('/', (req, res) => {
  res.send('EDUCARE backend is running ✅');
});

app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

app.use((req, res) => {
  console.log("❌ Unmatched route:", req.method, req.originalUrl);
  res.status(404).send(`Route not found: ${req.originalUrl}`);
});
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server is listening on http://0.0.0.0:${PORT}`);
});
