const express = require('express')
const app = express()
//const port = process.env.PORT || 3000;
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const port = 3000; // Update the port as needed

app.use(express.json());

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

app.post('/LecturerRegister', async (req, res) => {

  client.db("Assignment").collection("Lecturer").find({
    "Lect_ID": {$eq: req.body.Lect_ID}
  }).toArray().then((result) => {
    if (result.length > 0) {
      res.status(400).send('Lecturer already exists')
    } else {
      client.db("Assignment").collection("Lecturer").insertOne(
        {
            "Lect_ID": req.body.username,
            "Password": req.body.password
        }) 
        res.send('Register Succesfully')
    }
  })
})


app.post('/LecturerLogin', async (req, res) => {
	console.log(req.body);
  
  client.db("Assignment").collection("Lecturer").find({
    "Lect_ID": {$eq: req.body.Lect_ID}
  }).toArray().then((result) => {
    if (result.length > 0) {
      res.status(400).send('Login Successful!')
		}
    else {
      console.log("Login failed")
      res.status(401).send("Invalid Lect_ID or password");
      return
    }
  })
})

exports.StudentList = function (req,res) {
    client.db("Assignment").collection("Student").find({
    "role": {$eq: req.body.Student}
    }).toArray().then((result) => {
    if (result.length > 0) {
      res.status(400).send('View Successful')
    } else {
        res.send('No record')
    }
  })
  }


  exports.AttendanceList = function (req,res) {
    client.db("Assignment").collection("Attendance").find({
    "subject": {$eq: req.body.Subject}
    }).toArray().then((result) => {
    if (result.length > 0) {
      res.status(200).json(result);
      res.status(400).send('View Successful')
    } else {
        res.send('No record')
    }
  })
  }