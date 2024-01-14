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

exports.AddStudent = function (req,res) {
  const { MatrixNo } = req.body;
	const ExistingStudent = client.db("Assignment").collection("Student").find({"MatrixNo": MatrixNo});
  
  if (ExistingStudent) {
    console.log("Student already exist.");
    return false;
  } 
  else {
    client.db("Assignment").collection("Student").insertOne();
    console.log ('Student added');
    return client.db("Assignment").collection("Student").find({"MatrixNo": MatrixNo}).toArray()
  }
}

exports.AddFaculty = function (req,res) {
	const ExistingFaculty = client.db("Assignment").collection("User").find({"FacultyID": req.body.FacultyID});
    
  if (ExistingFaculty) {
    console.log("Faculty already exist.");
    return false;
  } 
  else {
    const result = client.db("Assignment").collection("User").insertOne();
    console.log ('Faculty added:', result[0]);
    return client.db("Assignment").collection("User").find({"FacultyID": req.body.FacultyID}).toArray()
  }
}

exports.StudentList = function (req,res) {
  client.db("Assignment").collection("User").find({
  "username": {$eq: req.body.username}
  }).toArray().then((result) => {
  if (result.length > 0) {
    res.status(400).send('View Successful')
  } else {
      res.send('No record')
  }
})
}