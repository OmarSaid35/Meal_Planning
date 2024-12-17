const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');

// Firebase Admin Initialization
const serviceAccount = require('./hci-project-a2e73-firebase-adminsdk-7dd1s-521d64fb89.json'); // Path to your service account JSON
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore(); // Firestore instance

const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); // Enable CORS
app.use(bodyParser.json()); // Parse JSON body

// ======================== ROUTES ======================== //

// 1. Registration Route
app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('Email and password are required.');
  }

  try {
    const userRecord = await admin.auth().createUser({ email, password });

    await db.collection('users').doc(userRecord.uid).set({
      email: userRecord.email,
      createdAt: new Date().toISOString(),
    });

    res.status(201).send({ message: 'User registered successfully!' });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).send({ message: 'Registration failed', error: error.message });
  }
});

// 2. Login Route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const usersSnapshot = await db.collection('users').where('email', '==', email).get();

    if (usersSnapshot.empty) {
      return res.status(404).send({ message: 'Invalid email or password!' });
    }

    let validUser = false;
    usersSnapshot.forEach((doc) => {
      if (doc.data().password === password) validUser = true;
    });

    if (validUser) {
      res.status(200).send({ message: 'Welcome! You have successfully logged in!' });
    } else {
      res.status(404).send({ message: 'Invalid email or password!' });
    }
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).send({ message: 'Login failed', error: error.message });
  }
});

// 3. Submit a Review (POST /ratings)
app.post('/add-review', async (req, res) => {
  const { recipeId, userId, userName, rating, opinion } = req.body;

  if (!recipeId || !userId || !rating || !opinion) {
    return res.status(400).send({ message: 'All fields are required.' });
  }

  try {
    const newReview = {
      recipeId,              // ID of the recipe being reviewed
      userId,                // User ID of the reviewer
      userName,              // Name of the user
      rating,                // User's rating
      opinion,               // Review opinion
      createdAt: new Date().toISOString(), // Timestamp
    };

    // Save the review to the 'reviews' collection
    const reviewRef = await db.collection('reviews').add(newReview);

    res.status(201).send({
      message: 'Review added successfully!',
      id: reviewRef.id, // Return the generated document ID
    });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).send({ message: 'Failed to add review', error: error.message });
  }
});

// 4. Get Reviews for a Recipe (GET /get-reviews/:recipeId)
app.get('/get-reviews/:recipeId', async (req, res) => {
  const { recipeId } = req.params;

  if (!recipeId) {
    return res.status(400).send({ message: 'Recipe ID is required.' });
  }

  try {
    const reviewsSnapshot = await db
      .collection('reviews')
      .where('recipeId', '==', recipeId) // Filter reviews by recipeId
      .orderBy('createdAt', 'desc')     // Sort by createdAt
      .get();

    const reviews = [];
    reviewsSnapshot.forEach((doc) => {
      reviews.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).send(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).send({ message: 'Failed to fetch reviews', error: error.message });
  }
});

// ======================== START SERVER ======================== //
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});