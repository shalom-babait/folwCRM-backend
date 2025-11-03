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

const app = express();

app.use(cors());
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
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});