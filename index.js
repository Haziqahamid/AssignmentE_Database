const express = require('express')
const app = express()
const port = process.env.PORT || 3000;
const AcademicAdministrator = require("./Academic Administrator");
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
run().catch(console.dir);


app.use(express.json())

app.post('/register', async (req, res) => {

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
});

/*app.post('/register', (req, res) => {
  const { username, password, role } = req.body;
    console.log(username, password, role);

    const hash = bcrypt.hashSync(password, 10);
    client.db("Assignment").collection("User").insertOne({"username": username, "password": hash, "role": role});
    
    res.send("register success");
});*/

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

});*/

//app.get('/student', async (req, res) => {
  //console.log(req.headers.authorization)
  //const tokens = req.headers.authorization.split('')
  //console.log(tokens)

  //jwt.verify(tokens[1], 'very-strong-password', function (err,decoded){
    //console.log(err)
    //console.log(decoded)

    //if (err){
      //res.status(401).send('Invalid token')
    //}

    //if (decoded.role == 'student'){
      //client.db('Assignment').collection("Student").findOne({username: decoded.user})
    //}

    //if (decoded.role == 'lecturer'){
      //client.db('Assignment').collection("Student").find({})
    //}
  //});
//});

/*app.post('/login', async (req, res) => {
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

});*/

/*app.post('/login', async (req, res) => {
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
});

app.post('/createFaculty', async (req, res) => {
	console.log(req.body);
	if(req.user.role == "admin") {
		const facility = await Facility.createFacility(req.body);
		if (facility != null) {
			console.log("Facility created");
			res.status(200).json(facility);
		} else {
			console.log("Facility creation failed")
			res.status(404).send("Facility already exists");
		}
	} else {
		res.status(403).send('Forbidden')
	}
})*/

app.listen(port, () => {
console.log(`Example app listening on port ${port}`)
})