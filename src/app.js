import express from 'express';
import cors from 'cors';
import usersRouter from './modules/users/user.routes.js';
import emailRoutes from './modules/email/email.routes.js';
import therapistRoutes from './modules/therapists/therapists.routes.js';
import patientRoutes from './modules/patients/patients.routes.js';
import appointmentRoutes from './modules/appointments/appointments.routes.js';
import roomsRoutes from './modules/rooms/rooms.routes.js';
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/users', usersRouter);
app.use('/api/email', emailRoutes);
app.use('/api/therapists', therapistRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/rooms', roomsRoutes);

app.listen(3000, () => console.log('Server running on port 3000'));

// const express = require('express');
// const app = express();
// const cors = require('cors')
// //טוען את הראוטרים מהתקיה
// const routers = require('./routers/routers');

// app.use(cors());
// app.use(express.json());

// //כל הראוטרים ירוכזו כאן
// app.use('/', routers);

// //מה זה?
// app.get('/', (req, res) => {
//   res.send('Welcome to server routers');
// });

// module.exports = app;