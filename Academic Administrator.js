module.exports = AcademicAdministrator;

class AcademicAdministrator{
  constructor(){
    this.Student = null;
    this.Faculty = null;
  }

  async AddStudent(StudentData) {
		const ExistingStudent = client.db("Assignment").collection("User").find({"StudentID": StudentData.StudentID});
    
    if (ExistingStudent) {
      console.log("Student already exist.");
      return false;
    } 
    else {
      const result = client.db("Assignment").collection("User").insertOne(StudentData);
      console.log ('Student added:', result[0]);
      return client.db("Assignment").collection("User").find({"StudentID": StudentData.StudentID}).toArray()
    }
	}

  async AddFaculty(FacultyData) {
		const ExistingFaculty = client.db("Assignment").collection("User").find({"FacultyID": FacultyData.FacultyID});
    
    if (ExistingFaculty) {
      console.log("Faculty already exist.");
      return false;
    } 
    else {
      const result = client.db("Assignment").collection("User").insertOne(FacultyData);
      console.log ('Faculty added:', result[0]);
      return client.db("Assignment").collection("User").find({"FacultyID": FacultyData.FacultyID}).toArray()
    }
	}

  async StudentList() {
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
}