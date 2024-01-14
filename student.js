const express = require('express');
const Student = require('./Student'); // Update the path accordingly
const app = express();
const port = 3000; // Update the port as needed

app.use(express.json());

app.post('/studentlogin', async (req, res) => {
    const { matric_no, password } = req.body;
    const result = await AttendanceManagementSystem.studentLogin(matric_no, password);
    res.json(result);
});