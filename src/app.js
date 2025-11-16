import express from 'express';
import cors from 'cors';
// import usersRouter from './modules/users/user.routes.js';
import emailRoutes from './modules/email/email.routes.js';
import therapistRoutes from './modules/therapists/therapists.routes.js';
import patientRoutes from './modules/patients/patients.routes.js';
import appointmentRoutes from './modules/appointments/appointments.routes.js';
import roomsRoutes from './modules/rooms/rooms.routes.js';
import typesRoutes from './modules/types/types.routes.js';
import loginRoutes from './modules/login/login.routes.js';
import departmentsRoutes from './modules/departments/departments.routes.js';
import groupsRoutes from './modules/groups/groups.routes.js';
import prospectsRoutes from './modules/prospects/prospects.routes.js';
import categoriesRoutes from './modules/categories/categories.routes.js';
const app = express();

// הגדרת CORS - מאפשר גישה מהאתר בפרודקשן ומסביבת הפיתוח
const allowedOrigins = [
  'https://shalombabait-production.up.railway.app', // 👈 בלי /
  'http://localhost:4200'
];

const corsOptions = {
  origin: function(origin, callback) {
    // אפשר בקשות ללא origin (כמו Postman או mobile apps)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// app.use('/api/users', usersRouter);
app.use('/api/email', emailRoutes);
app.use('/api/therapists', therapistRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/types', typesRoutes);
app.use('/api/departments', departmentsRoutes);
app.use('/api/login', loginRoutes);
app.use('/api/groups', groupsRoutes);
app.use('/api/prospects', prospectsRoutes);
app.use('/api/categories', categoriesRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});