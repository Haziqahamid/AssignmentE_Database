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

function generateAccessToken(payload) {
  return jwt.sign(payload, "Assignment-GroupE", { expiresIn: '1h' });
}

function verifyToken(req, res, next) {
  let header = req.headers.authorization;

  if (!header) {
    return res.sendStatus(401).send('Unauthorized');
  }

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

function VerifyTokens(req, res, next) {
  let header = req.headers.authorization;

  if (!header) {
    return res.sendStatus(401).send('Unauthorized');
  }

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

app.use(express.json())

app.use(verifyToken)
app.use(VerifyTokens)

app.post('/register', async (req, res) => {
  const { username, password, role } = req.body;
  console.log(username, password, role);

  client.db("Assignment").collection("User").findOne({ "username": username }).then((user) => {
    if (user) {
      console.log("Username already exists.");
      res.status(409).send('Username already exists.');
    }
    else {
      const hash = bcrypt.hashSync(password, 10);
      client.db("Assignment").collection("User").insertOne({ "username": username, "password": hash, "role": role });
      console.log(hash)
      console.log(req.headers.authorization)
      const token = req.headers.authorization.split('')[1];
      console.log(token)

      res.send("Register Success! You go girl!");
    }
  })
})

app.post('/login', async (req, res) => {
  console.log('login', req.body);
  const { username, password, role } = req.body;

  client.db("Assignment").collection("User").find({ "username": username }).toArray().then((result) => {
    const user = result[0]

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
      })
    } else {
      res.send('user not found')
    }
  })
})

app.post('/recordAttendance', async (req, res) => {
  console.log(req.body);

  const { matrix_no, subject, date, time } = req.body;

  client.db("Assignment").collection('Attendance').insertOne({
    matrix_no: matrix_no,
    subject: subject,
    date: date,
    time: time,
    status: 'Present'
  }, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error recording attendance');
    } else {
      res.status(200).send('Attendance recorded successfully');
    }
  })
})

app.post('/AddStudent', verifyToken, async (req, res) => {
  console.log(req.body);
  AcademicAdministrator.AddStudent(req, res);
})

app.post('/AddLecturer', verifyToken, async (req, res) => {
  console.log(req.body);
  AcademicAdministrator.AddStudent(req, res);
})

app.post('/StudentList', async (req, res) => {
  console.log(req.body);
  AcademicAdministrator.StudentList(req, res);
})

app.post('/recordAttendance', async (req, res) => {
  console.log(req.body);
  Student.recordAttendance(req, res);
})
app.get('/attendanceDetails/:matrix_no', async (req, res) => {
  const matrix_no = req.params.matrix_no;
  Student.attendanceDetails(req, res);
})

app.post('/StudentList', async (req, res) => {
  console.log(req.body);
  Lecturer.StudentList(req, res);
})

app.post('/AddSubject', VerifyTokens, async (req, res) => {
  console.log(req.body);
  Lecturer.AddSubject(req, res);
})

app.post('/AttendanceList', async (req, res) => {
  console.log(req.body);
  Lecturer.AttendanceList(req, res);
})

app.post('/Logout', async (req, res) => {
  console.log("See you next time love.");
  res.send('See you next time love.');
})

/*app.post('/studentlogin', async (req, res) => {
  console.log(req.body);
  Student.studentlogin(req, res);
})*/

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});