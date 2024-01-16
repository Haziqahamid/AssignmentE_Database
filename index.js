const express = require('express')
const app = express()
const port = process.env.PORT || 3000;
const AcademicAdministrator = require("./AcademicAdministrator.js");
const Lecturer = require("./Lecturer.js");
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

  if (!header){
    return res.sendStatus(401).send('Unauthorized');
  }

  jwt.verify(token, "Assignment-GroupE", function (err, decoded) {
    console.log(err)
    if (err){
      return res.sendStatus(401).send('Unauthorized');
    } 
    else {
      console.log(decoded);
      if (decoded.role != 'Admin') {
        return res.status(401).send('Again Unauthorized');
      }
    }
    next();
  })
}

app.use(express.json())

app.use(verifyToken)

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
      });
    } else {
      res.send('user not found')
    }
  });
});

/*app.post('/student', async (req, res) => {
  console.log(req.headers.authorization)
  const tokens = req.headers.authorization.split('')
  console.log(tokens)
 
  jwt.verify(tokens[1], 'Assignment-GroupE', function (err,decoded){
    console.log(err)
    console.log(decoded)
 
    if (err){
      res.status(401).send('Invalid token')
    }
 
    if (decoded.role == 'student'){
      client.db('Assignment').collection("Student").insertOne({
        "StudentID": req.body.StudentID,
        "password": req.body.password,
        "role": decoded.role
      })
    }
 
    if (decoded.role == 'lecturer'){
      client.db('Assignment').collection("Lecturer").insertOne({
        "LectID": req.body.LectID,
        "password": req.body.password,
        "role": decoded.role
      })
    }
 
    if (decoded.role == 'admin'){
      client.db('Assignment').collection("Admin").insertOne({
        "AdminID": req.body.AdminID,
        "password": req.body.password,
        "role": decoded.role
      })
    }
  });
})*/

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
  });
});

/*app.post('/register', async (req, res) => {
 
  client.db("Assignment").collection("User").find({
    "username": {$eq: req.body.username}
  }).toArray().then((result) => {
    if (result.length > 0) {
      res.status(400).send('Username already exists')
    } else {
      client.db("Assignment").collection("User").insertOne(
        {
            "username": req.body.username,
            "password": req.body.password,
            "role": req.body.role
        }) 
        res.send('Register Succesfully')
    }
  })
})
 
app.post('/register', async (req, res) => {
  console.log(req.body);
  if(req.body.role == "Admin") {
    const user = client.db('Assignment').collection("Admin").insertOne(req.body.username, req.body.password, req.body.role);
    if (user != null) {
      console.log("Register successful");
      res.status(200).send("User registered");
    } else {
      console.log("Register failed")
      res.status(409).json("Username already exists");
    }
  }
  if(req.body.role == "Student") {
    const user = client.db('Assignment').collection("Student").insertOne(req.body.username, req.body.password, req.body.role);
    if (user != null) {
      console.log("Register successful");
      res.status(200).send("Student registered");
    } else {
      console.log("Register failed")
      res.status(409).json("Username already exists");
    }
  }
  if(req.body.role == "Lecturer") {
    const user = client.db('Assignment').collection("Lecturer").insertOne(req.body.username, req.body.password, req.body.role);
    if (user != null) {
      console.log("Register successful");
      res.status(200).send("Lecturer registered");
    } else {
      console.log("Register failed")
      res.status(409).json("Username already exists");
    }
  }
})*/

/*app.post('/login', (req, res) => {
  const { username, password } = req.body;
  console.log(username, password);
  const hash = bcrypt.hashSync(password, 10);
 
  client.db("Assignment").collection("User").findOne({"username": username, "password": hash}).then((User) => {
    console.log(User) 
 
    if(bcrypt.compareSync(password, User.password) == true){
      res.send("login success");
    } else {
      res.send("login failed");
    }
  })
 
});
 
app.post('/login', async (req, res) => {
  console.log('login', req.body);
  const {username, password} = req.body;
  const hash = bcrypt.hashSync(password, 10);
 
  client.db("Assignment").collection("User").find({"username": username, "password": hash}).toArray().then((result) => {
    const user = result[0]
 
    if (user) {
      bcrypt.compare(password, user.password, function(err, result) {
        if (result) {
        
          const token = jwt.sign({
            user: username,
            role: 'admin'
          }, 'very-strong-password', {expiresIn: '1h'});
        
          res.send(token)
 
        } else {
          res.send('wrong password')
        }
      });
    } else{
      res.send('user not found')
    }
  });
 
});
 
app.post('/login', async (req, res) => {
  console.log(req.body);
 
  const user = await User.login(req.body.username, req.body.password);
  if (user != null) {
    console.log("Login Successful!");
    res.status(200).json({
      _id: user[0]._id,
      username: user[0].username,
      token: generateAccessToken({
        _id: user[0]._id,
        username: user[0].username,
        role: user[0].role
      }),
      role: user[0].role
    })
  } else {
    console.log("Login failed")
    res.status(401).send("Invalid username or password");
    return
  }
})*/

/*app.get('/student', async (req, res) => {
  console.log(req.headers.authorization)
  const tokens = req.headers.authorization.split('')
  console.log(tokens)
 
  jwt.verify(tokens[1], 'very-strong-password', function (err,decoded){
    console.log(err)
    console.log(decoded)
 
    if (err){
      res.status(401).send('Invalid token')
    }
 
    if (decoded.role == 'student'){
      client.db('Assignment').collection("Student").findOne({username: decoded.user})
    }
 
    if (decoded.role == 'lecturer'){
      client.db('Assignment').collection("Student").find({})
    }
  });
});*/

/*
app.post('/addstudent', async (req,res) => {
  const AcademicAdmin = new AcademicAdministrator();
  
  const StudentData = req.body;
  const result = await AcademicAdmin.AddStudent(StudentData);
 
  res.json(result);
});
 
app.post('/addfaculty', async (req,res) => {
  const AcademicAdmin = new AcademicAdministrator();
  
  const FacultyData = req.body;
  const result = await AcademicAdmin.AddFaculty(FacultyData);
 
  res.json(result);
});*/

/*app.post('/AddStudent', async (req, res) => {
  console.log(req.body);
  if(req.body.role == "admin") {
    const Student = await AcademicAdmin.AddStudent(req.body);
    if (Student != null) {
      console.log("Student Added");
      res.status(200).json(faculty);
    } else {
      console.log("Student creation failed")
      res.status(404).send("Student already exists");
    }
  } else {
    res.status(403).send('Forbidden')
  }
})
 
app.post('/AddFaculty', async (req, res) => {
  console.log(req.body);
  if(req.user.role == "admin") {
    const Faculty = await AcademicAdmin.AddFaculty(req.body);
    if (Faculty != null) {
      console.log("Faculty Added");
      res.status(200).json(faculty);
    } else {
      console.log("Faculty creation failed")
      res.status(404).send("Faculty already exists");
    }
  } else {
    res.status(403).send('Forbidden')
  }
})*/

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
    AcademicAdministrator.AddStudent(req, res);
  })

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});

/*app.post('/register', async (req, res) => {
  console.log(req.body);

  try {
    const { username, password, role } = req.body;
    const hash = bcrypt.hashSync(password, 10);
    let user;

    if (req.body.role == "Admin") {
      user = await client.db('Assignment').collection("Admin").insertOne({
        username: username,
        password: hash,
        role: role
      });
    } else if (req.body.role == "Student") {
      user = await client.db('Assignment').collection("Student").insertOne({
        username: username,
        password: hash,
        role: role
      });
    } else if (req.body.role == "Lecturer") {
      user = await client.db('Assignment').collection("Lecturer").insertOne({
        username: username,
        password: hash,
        role: role
      });
    }

    if (user != null) {
      console.log("Register successful");
      res.status(200).send(`${req.body.role} registered`);
    } else {
      console.log("Register failed");
      res.status(409).json("Username already exists");
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json("Internal Server Error");
  }
  console.log(hash)
  console.log(req.headers.authorization)
  const tokens = req.headers.authorization.split(' ')[1]
  console.log(tokens)
});

app.post('/login', async (req, res) => {
  console.log('login', req.body);
  const { username, password, role } = req.body;

  try {
    let collection;

    if (role === "Admin") {
      collection = "Admin";
    } else if (role === "Student") {
      collection = "Student";
    } else if (role === "Lecturer") {
      collection = "Lecturer";
    } else {
      res.status(400).json("Invalid role");
      return;
    }

    const user = await client.db('Assignment').collection(collection).findOne({ "username": username });

    if (user) {
      bcrypt.compare(hash, user.password, function (err, result) {
        if (result) {

          const token = jwt.sign({
            user: username,
            role: role
          }, 'Assignment-GroupE', { expiresIn: '20h' });

          res.send(token)

        } else {
          res.send('wrong password')
        }
      });
    } else {
      res.send('user not found')
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json("Internal Server Error");}
});*/