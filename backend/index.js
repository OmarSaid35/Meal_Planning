const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');

// Initialize Firebase Admin SDK
const serviceAccount = require('./hci-project-a2e73-firebase-adminsdk-7dd1s-521d64fb89.json'); // Path to your service account JSON file
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const app = express();
const PORT = 3000;
  const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
// Middleware
app.use(cors()); // Enable CORS
app.use(bodyParser.json()); // Parse JSON body

// Routes

// Registration Route
app.post('/register', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const userRecord = await admin.auth().createUser({ email, password });
  
      await db.collection('users').doc(userRecord.uid).set({
        email: userRecord.email,
        password, // Include password for testing (remove for production)
        createdAt: new Date().toISOString(),
      });
  
      res.status(201).send({ message: 'User registered successfully!' });
    } catch (error) {
      console.error('Error during registration:', error); // Log error
      res.status(500).send({ message: 'Registration failed', error: error.message });
    }
  });
  app.post('/post-recipe', async (req, res) => {
    const { title, instructions, ingredients, imageUrl, authorId } = req.body;
  
    // Validate required fields
    if (!title || !instructions) {
      return res.status(400).send({
        message: 'Title and instructions are required fields.',
      });
    }
  
    try {
      // Create a new recipe object
      const newRecipe = {
        title,
        instructions,
        ingredients: ingredients || [], // Default to an empty array if not provided
        imageUrl: imageUrl || '', // Default to an empty string if not provided
        authorId: authorId || 'anonymous', // Default to 'anonymous' if not provided
        timestamp: new Date().toISOString(),
        likes: [], // Initialize likes as an empty array
        comments: [], // Initialize comments as an empty array
      };
  
      // Save the recipe to the 'Posts' collection
      const docRef = await db.collection('Posts').add(newRecipe);
  
      res.status(201).send({
        message: 'Recipe posted successfully!',
        postId: docRef.id,
      });
    } catch (error) {
      console.error('Error posting recipe:', error);
      res.status(500).send({
        message: 'Failed to post the recipe.',
        error: error.message,
      });
    }
  });


app.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    const bucket = admin.storage().bucket();
    const fileName = `recipes/${Date.now()}_${req.file.originalname}`;
    const file = bucket.file(fileName);

    await file.save(req.file.buffer);

    const imageUrl = await file.getSignedUrl({
      action: 'read',
      expires: '03-01-2500', // Set expiration far in the future
    });

    res.status(200).send({ imageUrl: imageUrl[0] });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).send({ message: 'Failed to upload image', error: error.message });
  }
});
// Login Route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Query Firestore to verify user credentials
    const usersCollection = await db
      .collection('users')
      .where('email', '==', email)
      .get();

    if (usersCollection.empty) {
      res.status(404).send({ message: 'Invalid email or password!' });
    } else {
      // Check password (in real applications, passwords should be hashed and compared)
      let validUser = false;
      usersCollection.forEach((doc) => {
        const userData = doc.data();
        if (userData.password === password) {
          validUser = true;
        }
      });

      if (validUser) {
        res.status(200).send({ message: 'Welcome! You have successfully logged in!' });
      } else {
        res.status(404).send({ message: 'Invalid email or password!' });
      }
    }
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).send({ message: 'Login failed', error: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});