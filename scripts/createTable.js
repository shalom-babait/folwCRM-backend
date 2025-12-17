import pool from "../src/services/database.js";

async function createTable(sql) {
  try {
    await pool.query(sql);
    console.log("Table created successfully!");
  } catch (err) {
    console.error("Error creating table:", err);
  }
}

/* ============================
   טבלת משתמשים
============================ */
const usersTableSQL = `
CREATE TABLE IF NOT EXISTS Users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(15) NOT NULL,
  last_name VARCHAR(20) NOT NULL,
  teudat_zehut VARCHAR(10),
  phone VARCHAR(10) NOT NULL,
  city VARCHAR(15) NOT NULL,
  address VARCHAR(30),
  email VARCHAR(30) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  agree TINYINT(1) DEFAULT 0,
  role ENUM('secretary','manager','therapist','patient','other') NOT NULL DEFAULT 'patient',
  gender ENUM('male','female','other') NOT NULL DEFAULT 'other',
  birth_date DATE DEFAULT NULL
);
`;

/* ============================
   סוגי טיפולים
============================ */
const treatmentTypesTableSQL = `
CREATE TABLE IF NOT EXISTS TreatmentTypes (
  type_id INT AUTO_INCREMENT PRIMARY KEY,
  type_name VARCHAR(50) NOT NULL
);
`;

/* ============================
   חדרים
============================ */
const roomsTableSQL = `
CREATE TABLE IF NOT EXISTS Rooms (
  room_id INT AUTO_INCREMENT PRIMARY KEY,
  room_name VARCHAR(50) NOT NULL
);
`;

/* ============================
   מטפלים
============================ */
const therapistsTableSQL = `
CREATE TABLE IF NOT EXISTS Therapists (
  therapist_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE,
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);
`;

/* ============================
   מטופלים
============================ */
const patientsTableSQL = `
CREATE TABLE IF NOT EXISTS Patients (
  patient_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  therapist_id INT,
  birth_date DATE,
  gender ENUM('male','female','other') NOT NULL DEFAULT 'female',
  status ENUM('פעיל', 'לא פעיל', 'בהמתנה') NOT NULL DEFAULT 'פעיל',
  history_notes VARCHAR(500),
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (therapist_id) REFERENCES Therapists(therapist_id)
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
  type_id INT,
  room_id INT NOT NULL,
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  total_minutes INT AS (TIMESTAMPDIFF(MINUTE, start_time, end_time)) STORED,
  status ENUM('מתוזמנת', 'הושלמה', 'בוטלה', 'נדחתה') NOT NULL DEFAULT 'מתוזמנת',
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
  amount DECIMAL(10, 2) NOT NULL,
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  method ENUM('כרטיס אשראי', 'העברה בנקאית', 'מזומן') NOT NULL,
  status ENUM('pending','paid','failed','refunded') DEFAULT 'pending',
  FOREIGN KEY (appointment_id) REFERENCES Appointments(appointment_id)
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
  FOREIGN KEY (changed_by) REFERENCES Users(user_id)
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
  FOREIGN KEY (therapist_id) REFERENCES Therapists(therapist_id)
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
  user_id INT NOT NULL,
  department_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES Departments(department_id),
  UNIQUE (user_id, department_id)
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
  user_id INT NOT NULL,
  group_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (group_id) REFERENCES group_list(group_id),
  UNIQUE (user_id, group_id)
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
  FOREIGN KEY (converted_to_patient_id) REFERENCES Patients(patient_id)
);
`;

/* ============================
   קטגוריות
============================ */
const categoriesTableSQL = `
CREATE TABLE IF NOT EXISTS Categories (
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
  FOREIGN KEY (assigned_by) REFERENCES Users(user_id),
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
  FOREIGN KEY (patient_id) REFERENCES Patients(patient_id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES Categories(category_id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES Users(user_id),
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
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES Categories(category_id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_category (user_id, category_id)
);
`;

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
//שיניתי
// ALTER TABLE Users
//   DROP COLUMN first_name,
//   DROP COLUMN last_name,
//   DROP COLUMN teudat_zehut,
//   DROP COLUMN phone,
//   DROP COLUMN city,
//   DROP COLUMN address,
//   DROP COLUMN birth_date,
//   DROP COLUMN gender;

// SET SQL_SAFE_UPDATES = 1;

// UPDATE Users u
// JOIN Person p
//   ON u.first_name = p.first_name
//  AND u.last_name  = p.last_name
//  AND u.email      = u.email
// SET u.person_id = p.person_id;

// SET SQL_SAFE_UPDATES = 0;


// INSERT INTO Person (first_name, last_name, teudat_zehut, phone, city, address, birth_date, gender)
// SELECT first_name, last_name, teudat_zehut, phone, city, address, birth_date, gender
// FROM Users;

// ALTER TABLE Users
//   ADD COLUMN person_id INT,
//   ADD CONSTRAINT fk_user_person
//     FOREIGN KEY (person_id) REFERENCES Person(person_id);

// CREATE TABLE IF NOT EXISTS Person (
//   person_id INT AUTO_INCREMENT PRIMARY KEY,
//   first_name VARCHAR(15) NOT NULL,
//   last_name VARCHAR(20) NOT NULL,
//   teudat_zehut VARCHAR(10),
//   phone VARCHAR(10),
//   city VARCHAR(15),
//   address VARCHAR(30),
//   birth_date DATE,
//   gender ENUM('male','female','other') DEFAULT 'other'
// );

// ALTER TABLE Patients
//   ADD COLUMN person_id INT,
//   ADD CONSTRAINT fk_patient_person
//     FOREIGN KEY (person_id) REFERENCES Person(person_id);

// ALTER TABLE UserDepartments
//   ADD COLUMN person_id INT;

// ALTER TABLE UserDepartments
//   ADD CONSTRAINT fk_userdepartments_person
//     FOREIGN KEY (person_id) REFERENCES Person(person_id) ON DELETE CASCADE;

// ALTER TABLE UserDepartments
//   DROP FOREIGN KEY UserDepartments_user_fk,
//   DROP INDEX user_id,
//   DROP COLUMN user_id;

// ALTER TABLE UserDepartments
//   ADD UNIQUE KEY person_id_department_id (person_id, department_id);

// ALTER TABLE UserGroups
//   ADD COLUMN person_id INT;

// ALTER TABLE UserGroups
//   ADD CONSTRAINT fk_usergroups_person
//     FOREIGN KEY (person_id) REFERENCES Person(person_id) ON DELETE CASCADE;


// ALTER TABLE UserGroups
//   DROP FOREIGN KEY UserGroups_ibfk_1;

//   ALTER TABLE UserGroups
//   DROP INDEX user_id;

// ALTER TABLE UserGroups
//   DROP COLUMN user_id;

// ALTER TABLE UserGroups
//   ADD UNIQUE KEY person_id_group_id (person_id, group_id);

// הוספתי 2
// CREATE TABLE IF NOT EXISTS followups (
//   followup_id INT AUTO_INCREMENT PRIMARY KEY,

//   person_id INT NOT NULL,                  -- מי שהמעקב שייך לו
//   created_by_person_id INT NOT NULL,       -- מי שהוסיף את המעקב

//   follow_date DATE NOT NULL,               -- תאריך המעקב
//   follow_time TIME NULL,                   -- שעה (לא חובה)
//   remind BOOLEAN DEFAULT FALSE,            -- האם לתזכר
//   notes VARCHAR(500),                      -- הערות

//   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- תאריך יצירה

//   FOREIGN KEY (person_id) REFERENCES person(person_id) ON DELETE CASCADE,
//   FOREIGN KEY (created_by_person_id) REFERENCES person(person_id)
// );


//הוספתי ע"מ לדעת לאיזה מטופל לשייך את העיסקה
// ALTER TABLE Payments
// ADD COLUMN person_id INT NULL,
// ADD CONSTRAINT fk_payment_person
//   FOREIGN KEY (person_id) REFERENCES Person(person_id);

// הוספתי 3
//ALTER TABLE Therapists ADD COLUMN status ENUM('פעיל', 'לא פעיל', 'בהמתנה') NOT NULL DEFAULT 'פעיל';
//ALTER TABLE Therapists ADD COLUMN person_id INT, ADD CONSTRAINT fk_therapist_person FOREIGN KEY (person_id) REFERENCES Person(person_id);
// ALTER TABLE users MODIFY COLUMN password VARCHAR(512);
// ALTER TABLE appointments MODIFY COLUMN type_id INT NULL;
//ALTER TABLE users MODIFY role ENUM(
// 'company_manager',
//   'admin',
//   'therapist',
//   'patient',
//   'secretary'
// );
// ALTER TABLE person ADD COLUMN email VARCHAR(100);
// ALTER TABLE users CHANGE COLUMN email user_name VARCHAR(30);
// ALTER TABLE appointments MODIFY room_id INT NULL;
// ALTER TABLE appointments ADD COLUMN meeting_type ENUM('frontal','phone') NOT NULL;
