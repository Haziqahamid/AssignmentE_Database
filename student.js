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
    await client.db("Student").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

exports.recordAttendance = function (req, res) {

  const { username, StudentID, Subject, Program, Date, Time } = req.body;
  client.db("Assignment").collection('Attendance').insertOne({
    "username": username,
    "StudentID": StudentID,
    "Subject": Subject,
    "Program": Program,
    "Date": Date,
    "Time": Time,
    "Status": 'Present'
  }).then((result) => {
    console.log(req.body);
    res.send('Attendance recorded successfully');
  })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error recording attendance');
    });
}

exports.attendanceDetails = async function (req, res) {
  console.log(req.body);
  const { StudentID } = req.params;
  
  // Get the logged-in student's StudentID from the token
  const token = req.headers.authorization.split(' ')[1];
  jwt.verify(token, "Assignment-GroupE", function (err, decoded) {
    if (err) {
      return res.status(401).send('Unauthorized');
    }

    // Ensure the StudentID in the token matches the StudentID in the route
    if (decoded.role !== 'Student' || decoded.user !== StudentID) {
      return res.status(403).send('Access denied. You can only view your own attendance.');
    }

    // If the token is valid and the StudentID matches
    client.db("Assignment").collection('Attendance').find({ "StudentID": StudentID }).toArray()
      .then((attendance) => {
        res.status(200).send(attendance);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error fetching attendance details');
      });
  });
}

/*exports.attendanceDetails = async function (req, res) {
  console.log(req.body);
  const { StudentID } = req.params;

  try {
    const okay = await client.db("Assignment").collection('Attendance').find({ "StudentID": { $eq: StudentID } }).toArray();
    res.status(200).send(okay);
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
}*/