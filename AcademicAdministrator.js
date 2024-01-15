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

/*exports.AddStudent = function (req,res) {
  const { MatrixNo } = req.body;
  client.db("Assignment").collection("Student").find({ "MatrixNo": MatrixNo }).toArray().then((result) => {
    const user = result[0]
    if (user) {
      user.compare(MatrixNo, user.MatrixNo, function(err, result) {
        if (err) {
          console.error(err);
          console.log("Student already exist.");
          res.status(500).send('Student already exist.');
          return false;
        } 
        else {
          client.db("Assignment").collection("Student").insertOne();
          console.log ('Student added');
          res.status(200).json(result);
          return result;
        }
      });
    } else{
      res.send('Forbidden')
    }
  })
}*/

exports.AddStudent = function (req,res) {
  const { MatrixNo } = req.body;
  client.db("Assignment").collection("Student").find({ "MatrixNo": MatrixNo }).toArray().then((result) => {
    const user = result[0]
    if (user) {
      console.log("Student already exist.");
      res.status(500).send('Student already exist.');
      return false;
    } 
    else {
      client.db("Assignment").collection("Student").insertOne();
      console.log ('Student added');
      res.status(200).json(result);
      return result;
    }
  })
}

exports.AddLecturer = function (req,res) {
  const { LecturerID } = req.body;
  client.db("Assignment").collection("Lecturer").find({ "LecturerID": LecturerID }).toArray((err, result) => {
  
  if (err) {
    console.error(err);
    console.log("Lecturer already exist.");
    res.status(500).send('Lecturer already exist.');
    return false;
  } 
  else {
    client.db("Assignment").collection("Lecturer").insertOne();
    console.log ('Lecturer added');
    res.status(200).json(result);
    return result;
  }
  })
}

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