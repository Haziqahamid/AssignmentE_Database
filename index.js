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
const credentials = 'C:\\Users\\haziq\\Downloads\\AssignmentE_Database\\X509-cert-5456624090407783375.pem'
const client = new MongoClient('mongodb+srv://cluster0.ruowk6x.mongodb.net/?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority&appName=Cluster0', {
  tlsCertificateKeyFile: credentials,
  serverApi: ServerApiVersion.v1
});

// async function run() {
//   try {
//     await client.connect();
//     const database = client.db("testDB");
//     const collection = database.collection("testCol");
//     const docCount = await collection.countDocuments({});
//     console.log(docCount);
//     // perform actions using client
//   } finally {
//     // Ensures that the client will close when you finish/error
//     await client.close();
//   }
// }
// run().catch(console.dir);

// const { MongoClient, ServerApiVersion } = require('mongodb');
// const uri = "mongodb+srv://Assignment:lJfAGDdoR6APLWSC@cluster0.ruowk6x.mongodb.net/?retryWrites=true&w=majority";

// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//     serverApi: {
//         version: ServerApiVersion.v1,
//         strict: true,
//         deprecationErrors: true,
//     }
// });

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("Admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}
run().catch(console.dir)

app.use(express.json())

// Global Rate Limiting
const globalLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minutes
    max: 5, // Limit each IP to 5 requests per minutes
    message: 'Too many requests from this IP, please try again after 1 minutes.',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply global rate limiter to all requests
app.use(globalLimiter);

// // Custom Rate Limiting for Login Endpoint
// const loginLimiter = rateLimit({
//     windowMs: 30 * 60 * 1000, // 30 minutes
//     max: 3, // Limit each IP to 3 login attempts per 30 minutes
//     message: 'Too many login attempts. Please try again after 30 minutes.',
// });

// Custom Rate Limiting for Login Endpoint with Remaining Attempts
const loginLimiter = rateLimit({
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 3, // Limit each IP to 3 login attempts per 30 minutes
    handler: (req, res) => {
        res.status(429).send({
            message: `Too many login attempts. Please try again after 30 minutes.`,
            remainingAttempts: 0,
        });
    },
    keyGenerator: (req) => req.ip, // Rate limit by IP address
    skipSuccessfulRequests: true, // Reset attempts on successful login
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

const invalidatedTokens = new Set(); // In-memory store for invalidated tokens

// Middleware to check for invalidated tokens
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (invalidatedTokens.has(token)) {
        return res.status(401).send("Token is invalid. Please log in again.");
    }

    next(); // Proceed if token is not invalidated
};

// Predefined admin token or whitelist
const ADMIN_EMAIL_WHITELIST = ["Azie1205@gmail.com", "authorized.Azie1205@gmail.com"]; // Replace with actual authorized emails

// Improved Registration Endpoint
app.post('/register', async(req, res) => {
    const { username, password, role, Email, PhoneNo, adminToken } = req.body;

    // Validate Input
    const missingField = validateInput(['username', 'password', 'role', 'Email', 'PhoneNo'], req.body);
    if (missingField) return res.status(400).send(missingField);

    // Check for existing username
    const existingUser = await client.db("Assignment").collection("User").findOne({ username });
    if (existingUser) return res.status(409).send("Username already exists.");

    // Ensure strong password (at least 8 characters, upper/lowercase letters, a number, and special characters)
    if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>_]).{8,}$/.test(password)) {
        return res.status(400).send("Password must be at least 8 characters long, include upper/lowercase letters, a number, and a special character.");
    }

    // Secure Admin Registration
    if (role === 'Admin') {
        // Validate admin token or email
        if (!ADMIN_EMAIL_WHITELIST.includes(Email)) {
            return res.status(403).send("Unauthorized to register as Admin.");
        }
    }

    // Hash password before storing
    const hash = bcrypt.hashSync(password, 10);
    const userObject = { username, password: hash, Email, PhoneNo, role };

    // Add role-specific fields
    if (role === 'Student') userObject.StudentID = req.body.StudentID;
    if (role === 'Lecturer') userObject.LectID = req.body.LectID;

    try {
        // Insert new user into the database
        await client.db("Assignment").collection("User").insertOne(userObject);
        res.send("Register Success!");
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Improved Registration Endpoint
// app.post('/register', async (req, res) => {
//   const { username, password, role, Email, PhoneNo } = req.body;

//   // Validate Input
//   const missingField = validateInput(['username', 'password', 'role', 'Email', 'PhoneNo'], req.body);
//   if (missingField) return res.status(400).send(missingField);

//   // Check for existing username
//   const existingUser = await client.db("Assignment").collection("User").findOne({ username });
//   if (existingUser) return res.status(409).send("Username already exists.");

//   // Ensure strong password
//   // if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(password)) {
//   //   return res.status(400).send("Password must be at least 8 characters long, include upper/lowercase letters, and a number.");
//   // }
//   // Ensure strong password
//   if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/.test(password)) {
//   return res.status(400).send("Password must be at least 8 characters long, include upper/lowercase letters, a number, and a special character.");
//   }


//   const hash = bcrypt.hashSync(password, 10);
//   const userObject = { username, password: hash, Email, PhoneNo, role };

//   if (role === 'Student') userObject.StudentID = req.body.StudentID;
//   if (role === 'Lecturer') userObject.LectID = req.body.LectID;

//   try {
//     await client.db("Assignment").collection("User").insertOne(userObject);
//     res.send("Register Success!");
//   } catch (error) {
//     console.error("Registration Error:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });

// Improved Login Endpoint
// app.post('/Login', loginLimiter, async(req, res) => {
//     const { username, password } = req.body;

//     // Validate Input
//     const missingField = validateInput(['username', 'password'], req.body);
//     if (missingField) return res.status(400).send(missingField);

//     const user = await client.db("Assignment").collection("User").findOne({ username });
//     if (!user) return res.status(404).send("User not found.");

//     const validPassword = await bcrypt.compare(password, user.password);
//     if (!validPassword) return res.status(401).send("Incorrect password.");

//     // Generate token using the refactored function
//     const token = createUserToken(user);

//     res.send({ message: "Login successful.", token });
// });

app.post('/Login', loginLimiter, async (req, res) => {
    const { username, password } = req.body;

    // Validate Input
    const missingField = validateInput(['username', 'password'], req.body);
    if (missingField) {
        return res.status(400).send({ message: missingField, remainingAttempts: req.rateLimit.remaining });
    }

    const user = await client.db("Assignment").collection("User").findOne({ username });
    if (!user) {
        return res.status(404).send({ message: "User not found.", remainingAttempts: req.rateLimit.remaining });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        return res.status(401).send({ message: "Incorrect password.", remainingAttempts: req.rateLimit.remaining });
    }

    // Generate token
    const token = createUserToken(user);

    res.send({ message: "Login successful.", token });
});

// Use the middleware
app.post('/AddStudent', authToken('Admin'), AcademicAdministrator.AddStudent);
app.post('/AddLecturer', authToken('Admin'), AcademicAdministrator.AddLecturer);
app.post('/AddPrograms', authToken('Admin'), AcademicAdministrator.AddPrograms);
app.patch('/UpdatePassword', authToken(), AcademicAdministrator.UpdatePassword);
app.get('/StudentList', authToken('Lecturer'), Lecturer.StudentList);

app.post('/recordAttendance', authToken('Student'), async(req, res) => {
    console.log(req.body);
    Student.recordAttendance(req, res);
})

app.get('/attendanceDetails/:StudentID', authToken('Student'), async(req, res) => {
    //console.log(req.body);
    Student.attendanceDetails(req, res);
})

app.get('/StudentList', authToken('Admin'), async(req, res) => {
    console.log(req.body);
    AcademicAdministrator.StudentList(req, res);
})

app.post('/AddSubject', AdminAndLecturerToken, async(req, res) => {
    console.log(req.body);
    Lecturer.AddSubject(req, res);
})

app.get('/AttendanceList', authToken('Lecturer'), async(req, res) => {
    console.log(req.body);
    Lecturer.AttendanceList(req, res);
})

// Logout endpoint
app.post('/Logout', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1]; // Extract token from Authorization header

    if (token) {
        invalidatedTokens.add(token); // Add token to invalidation list
        console.log("Token invalidated:", token);
        res.status(200).send("You have been logged out.");
    } else {
        res.status(400).send("No token provided.");
    }
});

// Test Token Validation
app.get('/TestToken', verifyToken, (req, res) => {
    res.send("Your token is valid. You have access to this protected resource.");
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
    jwt.verify(token, "Assignment-GroupE", function(err, decoded) {
        console.log(err)
        if (err) {
            return res.sendStatus(401).send('Unauthorized');
        } else {
            console.log(decoded);
            if (decoded.role != 'Lecturer' && decoded.role != 'Admin') {
                return res.status(401).send('Again Unauthorized');
            }
        }
        next();
    });
}