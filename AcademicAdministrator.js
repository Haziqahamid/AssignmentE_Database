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

const bcrypt = require('bcrypt');

exports.AddStudent = function (req, res) {
  const { username, password, StudentID, Email, PhoneNo } = req.body;

  // Check if the student already exists
  client.db("Assignment").collection("User").findOne({ "StudentID": StudentID, "role": "Student" }).then((user) => {
    if (user) {
      console.log("Student already exists.");
      res.status(409).send('Student already exists.');
    }
    else {
      // If student doesn't exist, insert the new student
      const hash = bcrypt.hashSync(password, 10);
      client.db("Assignment").collection("User").insertOne({
        "username": username,
        "password": hash,
        "StudentID": StudentID,
        "Email": Email,
        "PhoneNo": PhoneNo,
        "role": "Student"
      }).then((result) => {
        console.log('Student added');
        res.send('Student added');
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

exports.AddLecturer = function (req, res) {
  const { username, password, LectID, Email, PhoneNo } = req.body;

  // Check if the lecturer already exists
  client.db("Assignment").collection("User").findOne({ "LectID": LectID, "role": "Lecturer" }).then((user) => {
    if (user) {
      console.log("Lecturer already exists.");
      res.status(409).send('Lecturer already exists.');
    }
    else {
      // If lecturer doesn't exist, insert the new lecturer
      const hash = bcrypt.hashSync(password, 10);
      client.db("Assignment").collection("User").insertOne({
        "username": username,
        "password": hash,
        "LectID": LectID,
        "Email": Email,
        "PhoneNo": PhoneNo,
        "role": "Lecturer"
      }).then((result) => {
        console.log('Lecturer added');
        res.send('Lecturer added');
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

// exports.UpdatePassword = async function (req, res) {
//   const { username, password } = req.body;

//   if (!username || !password) return res.status(400).send('Username and Password are required.');

//   const user = await client.db("Assignment").collection("User").findOne({ username });
//   if (!user) return res.status(404).send('User not found.');

//   const hashedPassword = bcrypt.hashSync(password, 10);

//   try {
//     await client.db("Assignment").collection("User").updateOne(
//       { username },
//       { $set: { password: hashedPassword } }
//     );
//     res.send('Password updated successfully. Please use the new password to log in.');
//   } catch (error) {
//     console.error('Error updating password:', error);
//     res.status(500).send('Failed to update password.');
//   }
// };

exports.UpdatePassword = async function (req, res) {
  const { username, password } = req.body;

  if (!username || !password) return res.status(400).send('Username and Password are required.');

  // Ensure strong password (at least 8 characters, upper/lowercase letters, a number, and special characters)
  if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/.test(password)) {
    return res.status(400).send("Password must be at least 8 characters long, include upper/lowercase letters, a number, and a special character.");
  }

  const user = await client.db("Assignment").collection("User").findOne({ username });
  if (!user) return res.status(404).send('User not found.');

  const hashedPassword = bcrypt.hashSync(password, 10);

  try {
    await client.db("Assignment").collection("User").updateOne(
      { username },
      { $set: { password: hashedPassword } }
    );
    res.send('Password updated successfully. Please use the new password to log in.');
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).send('Failed to update password.');
  }
};


exports.AddPrograms = function (req, res) {
  const { Code } = req.body;

  // Check if the programs already exists
  client.db("Assignment").collection("Programs").findOne({ "Code": Code }).then((user) => {
    if (user) {
      console.log("Programs already exists.");
      res.status(409).send('Programs already exists.');
    }
    else {
      // If program doesn't exist, insert the new program
      const { Code, Name } = req.body;
      client.db("Assignment").collection("Programs").insertOne({
        "Code": Code,
        "Name": Name
      }).then((result) => {
        console.log('Program added');
        res.send('Program added');
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