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


exports.studentlogin = function (req, res) {
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
}


exports.recordAttendance = function (req, res) {
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
}

exports.attendanceDetails = async function (req, res) {
  console.log(req.body);

  try {
    const okay = await client.db("Assignment").collection('Attendance').find({ matrix_no: { $eq: matrix_no } }).toArray();
    res.status(200).json(okay);
  }

  catch (err) {
    console.error(err);
    res.status(500).send('Error fetching attendance details');
  }
};


exports.fullAttendanceReport = async function (req, res) {
  console.log(req.body);
  try {
    const result = await client.db('Assignment').collection('Attendance').find({}).toArray();
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching attendance details');
  }
};


