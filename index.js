const express = require('express')
const rateLimit = require('express-rate-limit');
const app = express()
const port = process.env.PORT || 3000;
const AcademicAdministrator = require("./AcademicAdministrator.js");
const Lecturer = require("./Lecturer.js");
const Student = require("./student.js");
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://Assignment:lJfAGDdoR6APLWSC@cluster0.ruowk6x.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Global Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per 15 minutes
  message: 'Too many requests from this IP, please try again after 15 minutes.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,  // Disable the `X-RateLimit-*` headers
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("Admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir)

app.use(express.json())

// Apply global rate limiter to all requests
app.use(globalLimiter);

// Custom Rate Limiting for Login Endpoint
const loginLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 5 minutes
  max: 3, // Limit each IP to 5 login attempts per 5 minutes
  message: 'Too many login attempts. Please try again after 5 minutes.',
});

// Helper Function: Validate Input Data
function validateInput(fields, reqBody) {
  for (let field of fields) {
    if (!reqBody[field]) {
      return `Missing field: ${field}`;
    }
  }
  return null;
}

/// Function to handle token generation
function createUserToken(user) {
  return generateAccessToken({ 
      username: user.username, 
      role: user.role, 
      StudentID: user.StudentID 
  });
}

// Improved Registration Endpoint
app.post('/register', async (req, res) => {
  const { username, password, role, Email, PhoneNo } = req.body;

  // Validate Input
  const missingField = validateInput(['username', 'password', 'role', 'Email', 'PhoneNo'], req.body);
  if (missingField) return res.status(400).send(missingField);

  // Check for existing username
  const existingUser = await client.db("Assignment").collection("User").findOne({ username });
  if (existingUser) return res.status(409).send("Username already exists.");

  // Ensure strong password
  if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(password)) {
    return res.status(400).send("Password must be at least 8 characters long, include upper/lowercase letters, and a number.");
  }

  const hash = bcrypt.hashSync(password, 10);
  const userObject = { username, password: hash, Email, PhoneNo, role };

  if (role === 'Student') userObject.StudentID = req.body.StudentID;
  if (role === 'Lecturer') userObject.LectID = req.body.LectID;

  try {
    await client.db("Assignment").collection("User").insertOne(userObject);
    res.send("Register Success!");
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Improved Login Endpoint
app.post('/Login', loginLimiter, async (req, res) => {
  const { username, password } = req.body;

  // Validate Input
  const missingField = validateInput(['username', 'password'], req.body);
  if (missingField) return res.status(400).send(missingField);

  const user = await client.db("Assignment").collection("User").findOne({ username });
  if (!user) return res.status(404).send("User not found.");

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return res.status(401).send("Incorrect password.");

  // Generate token using the refactored function
  const token = createUserToken(user);

  res.send({ message: "Login successful.", token });
});

// Use the middleware
app.post('/AddStudent', authToken('Admin'), AcademicAdministrator.AddStudent);
app.post('/AddLecturer', authToken('Admin'), AcademicAdministrator.AddLecturer);
app.post('/AddPrograms', authToken('Admin'), AcademicAdministrator.AddPrograms);
app.patch('/UpdatePassword', authToken(), AcademicAdministrator.UpdatePassword);
app.get('/StudentList', authToken('Lecturer'), Lecturer.StudentList);

app.post('/recordAttendance', authToken('Student'), async (req, res) => {
  console.log(req.body);
  Student.recordAttendance(req, res);
})

app.get('/attendanceDetails/:StudentID', authToken('Student'), async (req, res) => {
  //console.log(req.body);
  Student.attendanceDetails(req, res);
})

app.get('/StudentList', authToken('Admin'), async (req, res) => {
  console.log(req.body);
  AcademicAdministrator.StudentList(req, res);
})

app.post('/AddSubject', AdminAndLecturerToken, async (req, res) => {
  console.log(req.body);
  Lecturer.AddSubject(req, res);
})

app.get('/AttendanceList', authToken('Lecturer'), async (req, res) => {
  console.log(req.body);
  Lecturer.AttendanceList(req, res);
})

// Improved Logout Endpoint
app.post('/Logout', async (req, res) => {
  console.log("Logout request received.");
  // Token invalidation logic can be implemented if needed
  res.send("See you next time!");
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
})

function generateAccessToken(payload) {
  return jwt.sign(payload, "Assignment-GroupE", { expiresIn: '1h' });
}

function authToken(requiredRole) {
  return (req, res, next) => {
    const header = req.headers.authorization;
    if (!header) return res.status(401).send('Unauthorized: No token provided.');

    const token = header.split(' ')[1];
    jwt.verify(token, "Assignment-GroupE", (err, decoded) => {
      if (err) return res.status(403).send('Unauthorized: Invalid token.');
      if (requiredRole && decoded.role !== requiredRole) {
        return res.status(403).send('Unauthorized: Insufficient permissions.');
      }
      req.user = decoded;
      next();
    });
  };
}

function AdminAndLecturerToken(req, res, next) {
  let header = req.headers.authorization;

  if (!header) {
    return res.sendStatus(401).send('Unauthorized');
  }
  const token = req.headers.authorization.split(' ')[1];
  jwt.verify(token, "Assignment-GroupE", function (err, decoded) {
    console.log(err)
    if (err) {
      return res.sendStatus(401).send('Unauthorized');
    }
    else {
      console.log(decoded);
      if (decoded.role != 'Lecturer' && decoded.role != 'Admin') {
        return res.status(401).send('Again Unauthorized');
      }
    }
    next();
  });
}