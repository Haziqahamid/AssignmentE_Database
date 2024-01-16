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

/*exports.AddStudent = function (req, res) {
  const { username } = req.body;

  // Check if the username already exists
  client.db("Assignment").collection("User").findOne({ "username": username, "role": "Student" }).then((user) => {
    if (user) {
      console.log("Student already exists.");
      res.status(409).send('Student already exists.');
    }
    else {
      // If user doesn't exist, insert the new student
      client.db("Assignment").collection("Student").insertOne({ "username": username, "role": "Student" }).then((result) => {
        console.log('Student added');
        res.status(200).json(result);
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
};*/

exports.AddLecturer = function (req, res) {
  const { username } = req.body;

  // Check if the username already exists
  client.db("Assignment").collection("User").findOne({ "username": username, "role": "Lecturer" }).then((user) => {
    if (user) {
      console.log("Lecturer already exists.");
      res.status(409).send('Lecturer already exists.');
    }
    else {
      // If user doesn't exist, insert the new student
      client.db("Assignment").collection("Lecturer").insertOne({ /* your document data */ }).then((result) => {
        console.log('Lecturer added');
        res.status(200).json(result);
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

const bcrypt = require('bcrypt');

exports.AddStudent = function (req, res) {
  const { username,password } = req.body;

  // Check if the username already exists
  client.db("Assignment").collection("User").findOne({ "username": username, "role": "Student" }).then((user) => {
    if (user) {
      console.log("Student already exists.");
      res.status(409).send('Student already exists.');
    } else {
      // If user doesn't exist, insert the new student in both collections
      const hash = bcrypt.hashSync(password, 10);
      const userData = {
        "username": username,
        "password": password,
        "role": "Student"
      };

      // Insert into the "User" collection
      client.db("Assignment").collection("User").insertOne(userData).then(() => {
        // Insert into the "Student" collection
        client.db("Assignment").collection("Student").insertOne(userData).then((result) => {
          console.log('Student added');
          res.status(200).json(result);
        })
          .catch((err) => {
            console.error(err);
            res.status(500).send('Internal Server Error.');
          });
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

exports.StudentList = function (req, res) {
  client.db("Assignment").collection("Student").find({
    "role": { $eq: req.body.Student }
  }).toArray().then((result) => {
    if (result.length > 0) {
      res.status(400).send('View Successful')
    } else {
      res.send('No record')
    }
  })
}