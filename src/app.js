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
import followUpsRoutes from './modules/followUps/followUps.routes.js';

const app = express();

// ✅ רשימת דומיינים מורשים
const allowedOrigins = [
  'https://shalombabait-production.up.railway.app',
  'http://localhost:4200' // לפיתוח מקומי
];

// ✅ middleware של CORS גלובלי
// app.use(cors({
//   origin: function(origin, callback) {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true,
//   methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
//   allowedHeaders: ['Content-Type','Authorization']
// }));
app.use(cors({
  origin: function(origin, callback) {
    // אפשרי ללא origin (למשל curl, Postman)
    if (!origin) return callback(null, true);

    // אפשרי כל localhost בפיתוח
    if (origin.startsWith('http://localhost')) return callback(null, true);

    // אפשרי דומיינים מורשים
    if (allowedOrigins.includes(origin)) return callback(null, true);

    // חסום כל השאר
    return callback(new Error('Not allowed by CORS'));
  },
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

// route בסיסי ל־`/` כדי למנוע 502
app.get('/', (req, res) => res.send('Server is running'));

// ✅ Routes
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
app.use('/api/followups', followUpsRoutes);


// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
