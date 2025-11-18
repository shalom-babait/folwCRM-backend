import pool from "../src/services/database.js";

async function createTable(sql) {
  try {
    await pool.query(sql);
    console.log("Table created successfully!");
  } catch (err) {
    console.error("Error creating table:", err);
  }
}

// --- טבלת משתמשים ---
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

// --- סוגי טיפולים ---
const treatmentTypesTableSQL = `
  CREATE TABLE IF NOT EXISTS TreatmentTypes (
    type_id INT AUTO_INCREMENT PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL
  );
`;

// --- חדרים ---
const roomsTableSQL = `
  CREATE TABLE IF NOT EXISTS Rooms (
    room_id INT AUTO_INCREMENT PRIMARY KEY,
    room_name VARCHAR(50) NOT NULL
  );
`;

// --- מטפלים ---
const therapistsTableSQL = `
  CREATE TABLE IF NOT EXISTS Therapists (
    therapist_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
  );
`;

// --- מטופלים ---
const patientsTableSQL = `
  CREATE TABLE IF NOT EXISTS Patients (
    patient_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    therapist_id INT,
    birth_date DATE,
    gender ENUM('זכר', 'נקבה', 'אחר'),
    status ENUM('פעיל', 'לא פעיל', 'בהמתנה') NOT NULL DEFAULT 'פעיל',
    history_notes VARCHAR(500),
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (therapist_id) REFERENCES Therapists(therapist_id)
  );
`;

// --- פגישות ---
const appointmentsTableSQL = `
  CREATE TABLE IF NOT EXISTS Appointments (
    appointment_id INT AUTO_INCREMENT PRIMARY KEY,
    therapist_id INT NOT NULL, 
    patient_id INT NOT NULL,  
    type_id INT NOT NULL, 
    room_id INT NOT NULL, 
    appointment_date DATE NOT NULL, 
    start_time TIME NOT NULL, 
    end_time TIME NOT NULL, 
    total_minutes INT AS (TIMESTAMPDIFF(MINUTE, start_time, end_time)) STORED,
    status ENUM('מתוזמנת', 'הושלמה', 'בוטלה','נדחתה') NOT NULL DEFAULT 'מתוזמנת',
    FOREIGN KEY (therapist_id) REFERENCES Therapists(therapist_id),
    FOREIGN KEY (patient_id) REFERENCES Patients(patient_id),
    FOREIGN KEY (type_id) REFERENCES TreatmentTypes(type_id),
    FOREIGN KEY (room_id) REFERENCES Rooms(room_id)
  );
`;

// --- תשלומים ---
const paymentsTableSQL = `
  CREATE TABLE IF NOT EXISTS Payments (
    pay_id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_id INT,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    method ENUM('כרטיס אשראי', 'העברה בנקאית', 'מזומן') NOT NULL,
    FOREIGN KEY (appointment_id) REFERENCES Appointments(appointment_id)
  );
`;

// --- סרטונים למטפלים ---
const therapistToVideoTableSQL = `
  CREATE TABLE IF NOT EXISTS TherapistToVideo (
    therapistToVideo_id INT AUTO_INCREMENT PRIMARY KEY,
    therapist_id INT,
    video_url VARCHAR(255) NOT NULL,
    year INT,
    FOREIGN KEY (therapist_id) REFERENCES Therapists(therapist_id)
  );
`;

// --- מחלקות ---
const departmentsTableSQL = `
  CREATE TABLE IF NOT EXISTS Departments (
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(20) NOT NULL UNIQUE
  );
`;

// --- שיוך משתמשים למחלקות ---
const userDepartmentsTableSQL = `
  CREATE TABLE IF NOT EXISTS UserDepartments (
    user_department_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    department_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (department_id) REFERENCES Departments(department_id),
    UNIQUE (user_id, department_id)
  );
`;
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
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (group_id) REFERENCES group_list(group_id),
    UNIQUE (user_id, group_id) 
);
`;
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
// -- טבלה ראשית לקטגוריות
const categoriesTableSQL = `
CREATE TABLE IF NOT EXISTS Categories (
  category_id INT AUTO_INCREMENT PRIMARY KEY,
  category_type ENUM('prospect', 'patient', 'employee', 'treatment') NOT NULL,
  category_name VARCHAR(50) NOT NULL,
  category_label VARCHAR(50) NOT NULL,
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
// --- שיוך קטגוריות למתעניינים ---
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
// --- שיוך קטגוריות למטופלים ---
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
// --- שיוך קטגוריות לעובדים (Users עם role מסוים) ---
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
// --- הפעלה לפי הצורך ---
// createTable(usersTableSQL);
// createTable(treatmentTypesTableSQL);
// createTable(roomsTableSQL);
// createTable(therapistsTableSQL);
// createTable(patientsTableSQL);
// createTable(appointmentsTableSQL);
// createTable(paymentsTableSQL);
// createTable(therapistToVideoTableSQL);
// createTable(departmentsTableSQL);
// createTable(userDepartmentsTableSQL);
// createTable(groupListTableSQL);
//  createTable(userGroupsTableSQL);
//הוספתי
// createTable(categoriesTableSQL);
// createTable(prospectCategoriesTableSQL);
//  createTable(patientCategoriesTableSQL);
// createTable(userCategoriesTableSQL);
// createTable(userCategoriesTableSQL);
//workbench
// ALTER TABLE Categories
// DROP COLUMN category_label;
