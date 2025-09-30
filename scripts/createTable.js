import pool from "../src/services/database.js";

async function createTable(sql) {
  try {
    await pool.query(sql);
    console.log("Table created successfully!");
  } catch (err) {
    console.error("Error creating table:", err);
  }
}

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
    password VARCHAR(15) NOT NULL,
    role ENUM('מזכיר','מנהל','מטפל','מטופל') NOT NULL DEFAULT 'מטופל',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    agree TINYINT(1) DEFAULT 0
  );
`;

const treatmentTypesTableSQL = `
  CREATE TABLE IF NOT EXISTS TreatmentTypes (
    type_id INT AUTO_INCREMENT PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL
  );
`;

const roomsTableSQL = `
  CREATE TABLE IF NOT EXISTS Rooms (
    room_id INT AUTO_INCREMENT PRIMARY KEY,
    room_name VARCHAR(50) NOT NULL
  );
`;

const therapistsTableSQL = `
  CREATE TABLE IF NOT EXISTS Therapists (
    therapist_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
  );
`;

const patientsTableSQL = `
  CREATE TABLE IF NOT EXISTS Patients (
    patient_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    therapist_id INT,
    birth_date DATE,
    gender ENUM('זכר', 'נקבה', 'אחר'),
    status ENUM('פעיל', 'לא פעיל', 'בהמתנה') NOT NULL DEFAULT 'פעיל',
    history_notes varchar(500),
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (therapist_id) REFERENCES therapists(therapist_id)
  );
`;

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
    status ENUM('מתוזמנת', 'הושלמה', 'בוטלה') NOT NULL DEFAULT 'מתוזמנת',
    FOREIGN KEY (therapist_id) REFERENCES therapists(therapist_id),
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (type_id) REFERENCES TreatmentTypes(type_id),
    FOREIGN KEY (room_id) REFERENCES Rooms(room_id)
  );
`;

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


const therapistToVideoTableSQL = `
  CREATE TABLE IF NOT EXISTS TherapistToVideo (
    therapistToVideo_id INT AUTO_INCREMENT PRIMARY KEY,
    therapist_id INT,
    video_url VARCHAR(255) NOT NULL,
    yera INT,
    FOREIGN KEY (therapist_id) REFERENCES Therapists(therapist_id)
  );
`;

// ליצירת הטבלאות בSQL יש להסיר את ההערות מהשורות אחת אחרי השניה לפי הסדר ולהריץ כל פעם עם שורה אחת!
// createTable(usersTableSQL);
// createTable(treatmentTypesTableSQL);
// createTable(roomsTableSQL);
// createTable(therapistsTableSQL);
// createTable(patientsTableSQL);
// createTable(appointmentsTableSQL);
// createTable(paymentsTableSQL);
createTable(therapistToVideoTableSQL);