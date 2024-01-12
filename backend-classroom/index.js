const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const app = express();
const { PrismaClient} = require('@prisma/client');
const {JWT_SECRET} = require('./config')

app.use(cors());

app.use(express.json());
const prisma = new PrismaClient();

// Authentication endpoint
app.post('/signup',async(req, res) => {
    const name = req.body.name;
    const password = req.body.password;
    const email = req.body.email;
    const role = req.body.role;

    if (name && password && email && role) {
      await prisma.user.create({
        data:{
          name: name,
          email: email,
          password: password,
          role: role
        }
      })
      res.json({
        message: 'User created successfully'
      })
    }else{
      res.status(411).json({ message: 'Please enter username, password, email, and role'});
    }
  });

app.post('/login', async(req, res) => {
  // Implement login logic
  const email = req.body.email;
  const password = req.body.password;

    // Search for a user with the provided email
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      return res.status(400).send('User with this email does not exist');
    }

    const validPassword = (password === user.password);

    if (!validPassword) {
      return res.status(400).send('Invalid password');
    }

    // If the user exists and the password is correct, sign the JWT with the user's details
    const accessToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
    res.json({ accessToken });

});



//Create New Assignment
app.post('/assignments', authenticateToken, async (req, res) => {
  const { title, description, dueDate, creatorId} = req.body;

  const newAssignment = await prisma.assignment.create({
    data: {
      title,
      description,
      dueDate: new Date(dueDate),
      creatorId: parseInt(creatorId)
    },
  });

  res.json(newAssignment);
});


// Get all Assignment
app.get('/assignments', authenticateToken, async (req, res) => {
  const assignments = await prisma.assignment.findMany();
  res.json(assignments);
});

// Update Assignment
app.put('/assignments/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, description, dueDate, creatorId} = req.body;

  const updatedAssignment = await prisma.assignment.update({
    where: { id: Number(id) },
    data: {
      title,
      description,
      dueDate: new Date(dueDate),
      creatorId: parseInt(creatorId)
    },
  });

  res.json(updatedAssignment);
});

// Delete Assignment
app.delete('/assignment/:id',authenticateToken, async (req, res) => {
  const { id } = req.params;

  // Check if the assignment with the provided id exists
  const assignment = await prisma.assignment.findUnique({
    where: {
      id: parseInt(id),
    },
  });

  if (!assignment) {
    return res.status(404).send('Assignment with this id does not exist');
  }

  // If the assignment exists, delete it
  const deletedAssignment = await prisma.assignment.delete({
    where: {
      id: parseInt(id),
    },
  });

  res.json({ deletedAssignment, msg: `Assignment with id ${id} is deleted` });
});



// Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  try{
    const decodedValue = jwt.verify(token, JWT_SECRET);
    if(decodedValue.email){
        next();
    }else{
        res.status(403).json({
            msg: "You are not authenticated"
        })
    }
  }catch(e){
    res.json({
        msg: "Incorrect inputs"
    })
  }
}



app.listen(3000);
