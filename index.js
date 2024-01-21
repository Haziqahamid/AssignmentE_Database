const express = require('express')
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

app.post('/register', async (req, res) => {
  const { username, password, role } = req.body;
  console.log(username, password, role);

  client.db("Assignment").collection("User").findOne({ "username": username }).then((user) => {
    if (user) {
      console.log("Username already exists.");
      res.status(409).send('Username already exists.');
    }
    const { Email, PhoneNo } = req.body;
    const hash = bcrypt.hashSync(password, 10);
    let userObject = {
      "username": username,
      "password": hash,
      "Email": Email,
      "PhoneNo": PhoneNo,
      "role": role
    };

    if (role === 'Student') {
      const { StudentID } = req.body;
      userObject.StudentID = StudentID
    }

    if (role === 'Lecturer') {
      const { LectID } = req.body;
      userObject.LectID = LectID
    }

    client.db("Assignment").collection("User").insertOne(userObject).then(() => {
      console.log(hash)
      console.log(req.headers.authorization)
      const token = req.headers.authorization.split('')[1];
      console.log(token)
      res.send("Register Success!");
    })

    .catch(error => {
      console.error("Internal Server Error", error);
      res.status(500).send("Internal Server Error");
    });
  })
})

app.post('/login', async (req, res) => {
  console.log('login', req.body);
  const { username, password, role } = req.body;

  client.db("Assignment").collection("User").findOne({ "username": username }).then((user) => {
    const hash = bcrypt.hashSync(password, 10);
    console.log(user);

    if (user) {
      bcrypt.compare(password, user.password, function (err, result) {
        if (result) {

          const token = jwt.sign({
            user: user.username,
            role: user.role
          }, 'Assignment-GroupE', { expiresIn: '20h' });
          console.log('Login Successfully');

          res.send(token)

        } else {
          res.send('wrong password')
        }
      });
    } else {
      res.send('user not found')
    }
  })
})

app.post('/AddStudent', AdminToken, async (req, res) => {
  console.log(req.body);
  AcademicAdministrator.AddStudent(req, res);
})

app.post('/AddLecturer', AdminToken, async (req, res) => {
  console.log(req.body);
  AcademicAdministrator.AddLecturer(req, res);
})

app.post('/AddPrograms', AdminToken, async (req, res) => {
  console.log(req.body);
  AcademicAdministrator.AddPrograms(req, res);
})

app.patch('/UpdatePassword', async (req, res) => {
  console.log(req.body);
  AcademicAdministrator.UpdatePassword(req, res);
})

app.post('/recordAttendance', StudentToken, async (req, res) => {
  console.log(req.body);
  Student.recordAttendance(req, res);
})

app.get('/attendanceDetails/:StudentID', async (req, res) => {
  const StudentID = req.params;
  Student.attendanceDetails(req, res);
})

app.get('/fullAttendanceReport', async (req, res) => {
  Student.fullAttendanceReport(req, res);
})

app.post('/StudentList', AdminAndLecturerToken, async (req, res) => {
  console.log(req.body);
  Lecturer.StudentList(req, res);
})

app.post('/AddSubject', AdminAndLecturerToken, async (req, res) => {
  console.log(req.body);
  Lecturer.AddSubject(req, res);
})

app.post('/AttendanceList', async (req, res) => {
  console.log(req.body);
  Lecturer.AttendanceList(req, res);
})

app.post('/Logout', async (req, res) => {
  console.log("See you next time.");
  res.send('See you next time.');
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
})

function generateAccessToken(payload) {
  return jwt.sign(payload, "Assignment-GroupE", { expiresIn: '1h' });
}

function AdminToken(req, res, next) {
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
      if (decoded.role != 'Admin') {
        return res.status(401).send('Again Unauthorized');
      }
    }
    next();
  });
}

function LecturerToken(req, res, next) {
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
      if (decoded.role != 'Lecturer') {
        return res.status(401).send('Again Unauthorized');
      }
    }
    next();
  });
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

function StudentToken(req, res, next) {
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
      if (decoded.role != 'Student') {
        return res.status(401).send('Again Unauthorized');
      }
    }
    next();
  });
}