const express = require('express')
const app = express()
//const port = process.env.PORT || 3000;
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const port = 4000; // Update the port as needed

app.use(express.json())

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
run().catch(console.dir);

app.post('/studentregister', async (req, res) => {

  client.db("Assignment").collection("Student").find({
    "matrix_no": { $eq: req.body.matrix_no }
  }).toArray().then((result) => {
    if (result.length > 0) {
      res.status(400).send('Student already exists')
    } else {
      client.db("Assignment").collection("Student").insertOne(
        {
          "matrix_no": req.body.username,
          "password": req.body.password
        })
      res.send('Register Succesfully')
    }
  })
})

/*app.post('/studentlogin', async (req, res) => {
    const { matric_no, password } = req.body;
    const result = await AttendanceManagementSystem.studentLogin(matric_no, password);
    res.json(result);
});*/

app.post('/studentlogin', async (req, res) => {
  console.log(req.body);

  client.db("Assignment").collection("Student").find({
    "matrix_no": { $eq: req.body.matrix_no }
  }).toArray().then((result) => {
    if (result.length > 0) {
      res.status(400).send('Login Successful!')
    }
    else {
      console.log("Login failed")
      res.status(401).send("Invalid matrix_no or password");
      return
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
  });
});


// Function to view details and timeline of the attendance
//app.get('/attendanceDetails', async (req, res) => {
//const matrix_no = req.params.matrix_no;

//client.db("Assignment").collection('Attendance').find({ matrix_no: matrix_no }).toArray((err, result) => {
//if (err) {
//console.error(err);
//res.status(500).send('Error fetching attendance details');
//} else {
//res.status(200).json(result);
// }
// });
//});

// Function to view details and timeline of the attendance
app.get('/attendanceDetails/:matrix_no', async (req, res) => {
  const matrix_no = req.params.matrix_no;
  try {
    const okay = await client.db("Assignment").collection('Attendance').find({ matrix_no:{$eq :matrix_no }}).toArray();
    res.status(200).json(okay);
  }
  //if (!matrix_no) {
  //return res.status(400).json({ error: 'Matrix number is required in the query parameters.' });
  //}
  catch (err) {
    console.error(err);
    res.status(500).send('Error fetching attendance details');
  }
});


// Function to view full report of the recorded attendance
app.get('/fullAttendanceReport', async (req, res) => {
  client.db('Assignment').collection('Attendance').find({}).toArray((err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error fetching full attendance report');
    } else {
      res.status(200).json(result);
    }
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
