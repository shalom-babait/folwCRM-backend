import organizationsRoutes from './modules/organizations/organizations.routes.js';
import expensesRoutes from './modules/expenses/expenses.routes.js';
import express from 'express';
import cors from 'cors';
import passport from 'passport';
import session from 'express-session';
import _MySQLStore from 'express-mysql-session';
const MySQLStore = _MySQLStore(session);
import { configureGoogleAuth } from './config/passport.js';
// import usersRouter from './modules/users/user.routes.js';
import emailRoutes from './modules/email/email.routes.js';
import therapistRoutes from './modules/therapists/therapists.routes.js';
import patientRoutes from './modules/patients/patients.routes.js';
import appointmentRoutes from './modules/appointments/appointments.routes.js';
import roomsRoutes from './modules/rooms/rooms.routes.js';
import typesRoutes from './modules/types/types.routes.js';
import loginRoutes from './modules/login/login.routes.js';
import authRoutes from './modules/auth/auth.routes.js';
import departmentsRoutes from './modules/departments/departments.routes.js';
import groupsRoutes from './modules/groups/groups.routes.js';
import prospectsRoutes from './modules/prospects/prospects.routes.js';
import categoriesRoutes from './modules/categories/categories.routes.js';
import paymentsRoutes from './modules/payments/payments.routes.js';
import taskRoutes from './modules/task/task.routes.js';
import followUpsRoutes from './modules/followUps/followUps.routes.js';
import pdfRoutes from './modules/reports/pdf.routes.js';
import reportsRoutes from './modules/reports/reports.routes.js';
import patientProblemsRoutes from './modules/patientProblems/patientProblems.routes.js';
import treatmentTypesRoutes from './modules/treatmentTypes/treatmentType.routes.js';
import { startReminderScheduler } from './services/scheduler.js';
import { authenticate } from './middlewares/auth.middleware.js';
import { addOrganizationId } from './middlewares/organization.middleware.js';

const app = express();


// ✅ CORS middleware - Allow production and localhost for development
const allowedOrigins = [
  'https://folwcrm.up.railway.app',
  'http://localhost:4200',
  'http://localhost:3000'
];
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

// Handle preflight requests globally (use regex, not '*')
app.options(/.*/, cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

// // ✅ טיפול בבקשות OPTIONS (preflight)
// app.options('*', cors({
//   origin: allowedOrigins,
//   credentials: true,
//   methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
//   allowedHeaders: ['Content-Type','Authorization']
// }));


// ✅ Body parser
app.use(express.json());


// ✅ MySQL session store configuration
const sessionStore = new MySQLStore({
  host: 'mysql.railway.internal',
  port: 32678,
  user: 'root', // שנה לשם המשתמש שלך
  password: 'MDyodxCezLQYabYUJIcPTLOWaKooQcfu', // שנה לסיסמה שלך
  database: 'railway' // שנה לשם הדאטהבייס שלך
});

app.use(session({
  store: sessionStore,
  secret: process.env.JWT_SECRET || 'yourSecretKey',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // במידה ויש HTTPS, להחליף ל-true
}));

// ✅ Initialize Passport
app.use(passport.initialize());
app.use(passport.session());
configureGoogleAuth();

// route בסיסי ל־`/` כדי למנוע 502
app.get('/', (req, res) => res.send('Server is running'));

// ✅ Routes שלא דורשות אימות
app.use('/api/login', loginRoutes);
// ✅ Protected Routes - נתיבים מוגנים (עם אימות וזיהוי ארגון)
app.use('/api/email', authenticate, addOrganizationId, emailRoutes);
app.use('/api/therapists', authenticate, addOrganizationId, therapistRoutes);
app.use('/api/patients', authenticate, addOrganizationId, patientRoutes);
app.use('/api/appointments', authenticate, addOrganizationId, appointmentRoutes);
app.use('/api/rooms', authenticate, addOrganizationId, roomsRoutes);
app.use('/api/types', authenticate, addOrganizationId, typesRoutes);
app.use('/api/departments', authenticate, addOrganizationId, departmentsRoutes);
app.use('/api/groups', authenticate, addOrganizationId, groupsRoutes);
app.use('/api/prospects', authenticate, addOrganizationId, prospectsRoutes);
app.use('/api/categories', authenticate, addOrganizationId, categoriesRoutes);
app.use('/api/payments', authenticate, addOrganizationId, paymentsRoutes);
app.use('/api/followups', authenticate, addOrganizationId, followUpsRoutes);
app.use('/api/reports', authenticate, addOrganizationId, reportsRoutes);
app.use('/api/patient-problems', authenticate, addOrganizationId, patientProblemsRoutes);
app.use('/api/tasks', authenticate, addOrganizationId, taskRoutes);
app.use('/api/treatmentTypes', authenticate, addOrganizationId, treatmentTypesRoutes);
app.use('/api/organizations', organizationsRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/auth', authRoutes);

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  // הפעלת תזמון שליחת תזכורות אוטומטי
  startReminderScheduler();
});

export default app;