/**
 * עדכון פגישה בטבלת appointments לפי מזהה
 * @param {number} appointmentId - מזהה הפגישה
 * @param {object} updateData - אובייקט עם השדות לעדכון
 * @returns {Promise<object>} תוצאת העדכון
 */
export async function updateAppointmentTable(appointmentId, updateData) {
  if (!appointmentId || typeof appointmentId !== 'number') {
    throw new Error('Invalid appointmentId');
  }
  if (!updateData || typeof updateData !== 'object' || Object.keys(updateData).length === 0) {
    throw new Error('No update data provided');
  }

  // בניית חלק ה-SET הדינמי
  const fields = Object.keys(updateData);
  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const values = fields.map(field => updateData[field]);
  values.push(appointmentId);

  const sql = `UPDATE appointments SET ${setClause} WHERE appointment_id = ?`;
  try {
    const [result] = await pool.query(sql, values);
    return result;
  } catch (err) {
    console.error('Error updating appointment:', err);
    throw err;
  }
}
import pool from "../src/services/database.js";

async function createTable(sql) {
  try {
    await pool.query(sql);
    console.log("Table created successfully!");
  } catch (err) {
    console.error("Error creating table:", err);
  }
}
const companiesTableSQL = `
 CREATE TABLE companies (
    company_id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(150) NOT NULL,
    contact_name VARCHAR(100) NULL,      -- איש קשר
    contact_phone VARCHAR(20) NULL,
    contact_email VARCHAR(100) NULL,
    status ENUM('active','inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
); ';
`;
/* ============================
   טבלת משתמשים
============================ */
const usersTableSQL = `
CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  user_name VARCHAR(30) NOT NULL UNIQUE,
  password VARCHAR(512) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  agree TINYINT(1) DEFAULT 0,
  role ENUM('company_manager','admin','therapist','patient','secretary') NOT NULL DEFAULT 'patient',
  person_id INT,
  FOREIGN KEY (person_id) REFERENCES person(person_id)
);
`;
const personTableSQL = `CREATE TABLE IF NOT EXISTS Person (
   person_id INT AUTO_INCREMENT PRIMARY KEY,
   first_name VARCHAR(15) NOT NULL,
   last_name VARCHAR(20) NOT NULL,
   teudat_zehut VARCHAR(10),
   phone VARCHAR(10),
   email VARCHAR(100),
   city VARCHAR(15),
   address VARCHAR(30),
   birth_date DATE,
   gender ENUM('male','female','other') DEFAULT 'other'
   ,mother_name VARCHAR(30) NULL
 ); `;
/* ============================
   סוגי טיפולים
============================ */
const treatmentTypesTableSQL = `
CREATE TABLE IF NOT EXISTS treatment_types (
  treatment_type_id INT AUTO_INCREMENT PRIMARY KEY,
  type_name VARCHAR(50) NOT NULL
);
`;

/* ============================
   חדרים
============================ */
const roomsTableSQL = `
CREATE TABLE IF NOT EXISTS rooms (
  room_id INT AUTO_INCREMENT PRIMARY KEY,
  room_name VARCHAR(50) NOT NULL
  ,description TEXT NULL
);
`;

/* ============================
   מטפלים
============================ */
const therapistsTableSQL = `
CREATE TABLE IF NOT EXISTS therapists (
  therapist_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE,
  person_id INT,
  status ENUM('פעיל', 'לא פעיל', 'בהמתנה') NOT NULL DEFAULT 'פעיל',
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (person_id) REFERENCES person(person_id)
);
`;

/* ============================
   מטופלים
============================ */
const patientsTableSQL = `
CREATE TABLE IF NOT EXISTS patients (
  patient_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  therapist_id INT,
  person_id INT,
  birth_date DATE,
  gender ENUM('male','female','other') NOT NULL DEFAULT 'female',
  status ENUM('פעיל', 'לא פעיל', 'בהמתנה') NOT NULL DEFAULT 'פעיל',
  history_notes VARCHAR(500),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (therapist_id) REFERENCES therapists(therapist_id),
  FOREIGN KEY (person_id) REFERENCES person(person_id)
);
`;

/* ============================
   פגישות
============================ */
const appointmentsTableSQL = `
CREATE TABLE appointments (
  appointment_id INT AUTO_INCREMENT PRIMARY KEY,
  therapist_id INT NOT NULL,
  patient_id INT NOT NULL,
  treatment_type_id INT NULL,
  room_id INT NULL,
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  total_minutes INT AS (TIMESTAMPDIFF(MINUTE, start_time, end_time)) STORED,
  status ENUM('מתוזמנת', 'הושלמה', 'בוטלה', 'נדחתה') NOT NULL DEFAULT 'מתוזמנת',
    meeting_type ENUM('frontal','phone') NOT NULL,
  FOREIGN KEY (therapist_id) REFERENCES therapists(therapist_id),
  FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
  FOREIGN KEY (type_id) REFERENCES treatment_types(treatment_type_id),
  FOREIGN KEY (room_id) REFERENCES rooms(room_id)
);
`;

/* ============================
   תשלומים
============================ */
const paymentsTableSQL = `
CREATE TABLE IF NOT EXISTS Payments (
  payment_id INT AUTO_INCREMENT PRIMARY KEY,
  appointment_id INT,
  person_id INT,
  therapist_id INT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  method ENUM('כרטיס אשראי', 'העברה בנקאית', 'מזומן') NOT NULL,
  status ENUM('pending','paid','failed','refunded') DEFAULT 'pending',
  FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id),
  FOREIGN KEY (person_id) REFERENCES person(person_id)
  ,FOREIGN KEY (therapist_id) REFERENCES therapists(therapist_id)
);
`;


/* ============================
   חשבוניות
============================ */
const invoicesTableSQL = `
CREATE TABLE IF NOT EXISTS Invoices (
  invoice_id INT AUTO_INCREMENT PRIMARY KEY,
  payment_id INT NOT NULL,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (payment_id) REFERENCES Payments(payment_id)
);
`;

/* ============================
   היסטוריית סטטוס תשלומים
============================ */
const paymentStatusHistoryTableSQL = `
CREATE TABLE IF NOT EXISTS PaymentStatusHistory (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  payment_id INT NOT NULL,
  old_status VARCHAR(20),
  new_status VARCHAR(20),
  changed_by INT,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (payment_id) REFERENCES Payments(payment_id),
  FOREIGN KEY (changed_by) REFERENCES users(user_id)
);
`;

/* ============================
   סרטונים למטפלים
============================ */
const therapistToVideoTableSQL = `
CREATE TABLE IF NOT EXISTS TherapistToVideo (
  therapistToVideo_id INT AUTO_INCREMENT PRIMARY KEY,
  therapist_id INT,
  video_url VARCHAR(255) NOT NULL,
  year INT,
  FOREIGN KEY (therapist_id) REFERENCES therapists(therapist_id)
);
`;

/* ============================
   מחלקות
============================ */
const departmentsTableSQL = `
CREATE TABLE IF NOT EXISTS Departments (
  department_id INT AUTO_INCREMENT PRIMARY KEY,
  department_name VARCHAR(20) NOT NULL UNIQUE
);
`;

/* ============================
   שיוך משתמשים למחלקות
============================ */
const userDepartmentsTableSQL = `
CREATE TABLE IF NOT EXISTS UserDepartments (
  user_department_id INT AUTO_INCREMENT PRIMARY KEY,
  person_id INT NOT NULL,
  department_id INT NOT NULL,
  FOREIGN KEY (person_id) REFERENCES person(person_id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES Departments(department_id),
  UNIQUE KEY person_id_department_id (person_id, department_id)
);
`;

/* ============================
   קבוצות
============================ */
const groupListTableSQL = `
CREATE TABLE IF NOT EXISTS group_list (
  group_id INT AUTO_INCREMENT PRIMARY KEY,
  group_name VARCHAR(50) NOT NULL UNIQUE,
  department_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES Departments(department_id)
);
`;

const userGroupsTableSQL = `
CREATE TABLE IF NOT EXISTS UserGroups (
  user_group_id INT AUTO_INCREMENT PRIMARY KEY,
  person_id INT NOT NULL,
  group_id INT NOT NULL,
  FOREIGN KEY (person_id) REFERENCES person(person_id) ON DELETE CASCADE,
  FOREIGN KEY (group_id) REFERENCES group_list(group_id),
  UNIQUE KEY person_id_group_id (person_id, group_id)
);
`;

/* ============================
   מתעניינים
============================ */
const prospectsTableSQL = `
CREATE TABLE IF NOT EXISTS Prospects (
  prospect_id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(15) NOT NULL,
  last_name VARCHAR(20) NOT NULL,
  phone VARCHAR(10) NOT NULL,
  phone_alt VARCHAR(10),
  email VARCHAR(30),
  city VARCHAR(15),
  referral_source VARCHAR(50),
  reason_for_visit VARCHAR(200),
  notes TEXT,
  status ENUM('new', 'contacted', 'converted', 'not_relevant') DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  converted_to_patient_id INT,
  FOREIGN KEY (converted_to_patient_id) REFERENCES patients(patient_id)
);
`;

/* ============================
   קטגוריות
============================ */
const categoriesTableSQL = `
CREATE TABLE IF NOT EXISTS categories (
  category_id INT AUTO_INCREMENT PRIMARY KEY,
  category_type ENUM('prospect', 'patient', 'employee', 'treatment') NOT NULL,
  category_name VARCHAR(50) NOT NULL,
  description TEXT,
  color VARCHAR(20) DEFAULT '#2196F3',
  icon VARCHAR(30),
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_category (category_type, category_name)
);
`;

/* ============================
   שיוך קטגוריות למתעניינים
============================ */
const prospectCategoriesTableSQL = `
CREATE TABLE IF NOT EXISTS ProspectCategories (
  prospect_category_id INT AUTO_INCREMENT PRIMARY KEY,
  prospect_id INT NOT NULL,
  category_id INT NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assigned_by INT,
  FOREIGN KEY (prospect_id) REFERENCES Prospects(prospect_id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES Categories(category_id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES users(user_id),
  UNIQUE KEY unique_prospect_category (prospect_id, category_id)
);
`;

/* ============================
   שיוך קטגוריות למטופלים
============================ */
const patientCategoriesTableSQL = `
CREATE TABLE IF NOT EXISTS PatientCategories (
  patient_category_id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  category_id INT NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assigned_by INT,
  FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES users(user_id),
  UNIQUE KEY unique_patient_category (patient_id, category_id)
);
`;

/* ============================
   שיוך קטגוריות למשתמשים
============================ */
const userCategoriesTableSQL = `
CREATE TABLE IF NOT EXISTS UserCategories (
  user_category_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  category_id INT NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES Categories(category_id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_category (user_id, category_id)
);
`;
const followupsTableSQL = `CREATE TABLE IF NOT EXISTS followups (
   followup_id INT AUTO_INCREMENT PRIMARY KEY,

   person_id INT NOT NULL,                  -- מי שהמעקב שייך לו
   created_by_person_id INT NOT NULL,       -- מי שהוסיף את המעק
   follow_date DATE NOT NULL,               -- תאריך המעקב
   follow_time TIME NULL,                   -- שעה (לא חובה)
   remind BOOLEAN DEFAULT FALSE,            -- האם לתזכר
   notes VARCHAR(500),                      -- הערו
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- תאריך יציר
   FOREIGN KEY (person_id) REFERENCES person(person_id) ON DELETE CASCADE,
   FOREIGN KEY (created_by_person_id) REFERENCES person(person_id)
 );`;
 const patient_contactsTableSQL = `
 CREATE TABLE patient_contacts (
     patient_contacts_id INT AUTO_INCREMENT PRIMARY KEY,
     patient_id INT NOT NULL,
     contact_person_id INT NOT NULL,
     relation_type ENUM(
         'mother',
         'father',
         'guardian',
         'family_member',
         'other'
     ) NOT NULL,
     is_primary BOOLEAN DEFAULT FALSE,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     CONSTRAINT fk_pc_patient
         FOREIGN KEY (patient_id)
         REFERENCES patients(patient_id)
         ON DELETE CASCADE,
   CONSTRAINT fk_pc_person
       FOREIGN KEY (contact_person_id)
       REFERENCES person(person_id)
       ON DELETE CASCADE,
   UNIQUE (patient_id, contact_person_id)
; `;


/* ============================
   הרצה בפועל
============================ */
//  createTable(usersTableSQL);
//  createTable(treatmentTypesTableSQL);
//  createTable(roomsTableSQL);
//  createTable(therapistsTableSQL);
//  createTable(patientsTableSQL);
//  createTable(appointmentsTableSQL);
//  createTable(paymentsTableSQL);
//  createTable(refundsTableSQL);
//  createTable(invoicesTableSQL);
//  createTable(paymentStatusHistoryTableSQL);
//  createTable(therapistToVideoTableSQL);
//  createTable(departmentsTableSQL);
//  createTable(userDepartmentsTableSQL);
//  createTable(groupListTableSQL);
//  createTable(userGroupsTableSQL);
//  createTable(prospectsTableSQL);
//  createTable(categoriesTableSQL);
//  createTable(prospectCategoriesTableSQL);
//  createTable(patientCategoriesTableSQL);
//  createTable(userCategoriesTableSQL);
//  createTable(personTableSQL);
//  createTable(followupsTableSQL);
// createTable(companiesTableSQL);
// createTable(patient_contactsTableSQL);

//הוספתי 5
// CREATE TABLE room_availability (
//     availability_id INT AUTO_INCREMENT PRIMARY KEY,
//     company_id INT NOT NULL,
//     room_id INT NOT NULL,
//     day_of_week TINYINT NOT NULL,
//     start_time TIME NOT NULL,
//     end_time TIME NOT NULL,

//     CONSTRAINT fk_availability_room
//         FOREIGN KEY (room_id)
//         REFERENCES rooms(room_id)
//         ON DELETE CASCADE,

//     CONSTRAINT fk_availability_company
//         FOREIGN KEY (company_id)
//         REFERENCES companies(company_id)
//         ON DELETE CASCADE
// );

//הוספתי 6
// CREATE TABLE patient_problems (
//     patient_problem_id INT AUTO_INCREMENT PRIMARY KEY,
//     patient_id INT NOT NULL,
//     title VARCHAR(255) NOT NULL,
//     description TEXT,
//     status ENUM('active', 'resolved') DEFAULT 'active',
//     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
//     closed_at DATETIME NULL,

//     CONSTRAINT fk_patient_problems_patient
//         FOREIGN KEY (patient_id)
//         REFERENCES patients(patient_id)
//         ON DELETE CASCADE
// );

// CREATE TABLE patient_problem_ratings (
//     patient_problem_rating_id INT AUTO_INCREMENT PRIMARY KEY,
//     patient_problem_id INT NOT NULL,
//     rating_date DATE NOT NULL,
//     score TINYINT NOT NULL CHECK (score BETWEEN 1 AND 10),
//     notes TEXT,
//     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

//     CONSTRAINT fk_problem_ratings_problem
//         FOREIGN KEY (patient_problem_id)
//         REFERENCES patient_problems(patient_problem_id)
//         ON DELETE CASCADE,

//     CONSTRAINT uq_problem_date
//         UNIQUE (patient_problem_id, rating_date)
// );
// CREATE TABLE tasks (
//   task_id SERIAL PRIMARY KEY,

//   title VARCHAR(255) NOT NULL,
//   description TEXT NULL,

//   patient_id INTEGER NULL,

//   created_by_user_id INTEGER NOT NULL,
//   assigned_to_user_id INTEGER NULL,

//   status VARCHAR(20) NOT NULL DEFAULT 'open',
//   priority VARCHAR(20) NULL,

//   due_date DATE NULL,
//   completed_at TIMESTAMP NULL,

//   created_at TIMESTAMP NOT NULL DEFAULT NOW(),
//   updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

//   CONSTRAINT fk_tasks_patient
//     FOREIGN KEY (patient_id)
//     REFERENCES patients(patient_id),

//   CONSTRAINT fk_tasks_created_by
//     FOREIGN KEY (created_by_user_id)
//     REFERENCES users(user_id),

//   CONSTRAINT fk_tasks_assigned_to
//     FOREIGN KEY (assigned_to_user_id)
//     REFERENCES users(user_id)
// );
// ALTER TABLE tasks ADD COLUMN color VARCHAR(20) NULL;
// הוספתי 7
// ALTER TABLE followups
// ADD COLUMN status ENUM('open', 'completed', 'cancelled', 'snoozed')
// NOT NULL DEFAULT 'open';

// UPDATE followups
// SET status = 'open'
// WHERE status IS NULL;