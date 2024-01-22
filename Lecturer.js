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

exports.StudentList = function (req, res) {
  console.log(req.body);
  client.db("Assignment").collection("User").find({ 
    "role": { $eq: "Student" } 
  }).toArray().then((result) => {
      if (result.length > 0) {
        res.status(200).json(result);
        res.status(400).send('View Successful')
      }
      else {
        res.send('No record')
      }
    })
}

exports.AttendanceList = function (req, res) {
  client.db("Assignment").collection("Attendance").find({
    "Subject": { $eq: req.body.Subject }
  }).toArray().then((result) => {
    if (result.length > 0) {
      res.status(200).json(result);
      res.status(400).send('View Successful')
    } else {
      res.send('No record')
    }
  })
}

exports.AddSubject = function (req, res) {
  const { Code } = req.body;

  // Check if the subject already exists
  client.db("Assignment").collection("Subject").findOne({ "Code": Code }).then((user) => {
    if (user) {
      console.log("Subject already exists.");
      res.status(409).send('Subject already exists.');
    }
    else {
      // If subject doesn't exist, insert the new subject
      const { Code, Name, Credit } = req.body;
      client.db("Assignment").collection("Subject").insertOne({
        "Code": Code,
        "Name": Name,
        "Credit": Credit
      }).then((result) => {
        console.log('Subject added');
        res.send('Subject added');
      })
        .catch((err) => {
          console.error(err);
          res.status(500).send('Internal Server Error.');
        });
    }
  })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Internal Server Error.');
    });
};
