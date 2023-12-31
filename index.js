const express = require('express')
const app = express()
const port = process.env.PORT || 3000;
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const util = require('./util.js');

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://b022210033:NIZdxSrysZZaLbe4@cluster0.dcvg4k7.mongodb.net/?retryWrites=true&w=majority";

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
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

app.use(express.json())

app.post('/register', (req, res) => {
  const { username, password } = req.body;
    console.log(username, password);

    const hash = bcrypt.hashSync(password, 10);
    client.db("HelloAzie").collection("User")
    .insertOne({"username": username, "password": hash});
    
    res.send("register success");
})

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  console.log(username, password);
  const hash = bcrypt.hashSync(password, 10);

  client.db("HelloAzie").collection("User").findOne({"username": username, "password": hash}).then((User) => {
    console.log(User) 

    if(bcrypt.compareSync(password, User.password) == true){
      res.send("login success");
    } else {
      res.send("login failed");
    }
  })

})

app.post('/login', async (req, res) => {
  console.log('login', req.body)

  const {username, password} = req.body

  client.db("HelloAzie").collection("User").find({"username": username, "password": hash}).then((result) => {
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

app.listen(port, () => {
console.log(`Example app listening on port ${port}`)
})