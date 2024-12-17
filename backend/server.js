const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const serviceAccount = require('./path-to-your-firebase-key.json'); // Replace with the actual path to your Firebase JSON key

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://hci-project-a2e73.firebaseio.com', // Use your project-specific URL
});

const db = admin.firestore(); // Firestore instance

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ======================== ROUTES ======================== //

// 1. Registration route
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send('Email and password are required.');
  }

  try {
    const userRef = db.collection('users').doc();
    await userRef.set({ email, password });

    res.status(200).send({ message: 'User registered successfully!' });
  } catch (error) {
    console.error('Error saving user to Firebase:', error);
    res.status(500).send('Error registering user.');
  }
});

// 2. Submit a Review (POST /ratings)
app.post('/ratings', async (req, res) => {
  const { recipeId, userId, userName, rating, opinion } = req.body;

  // Validate required fields
  if (!recipeId || !userId || !userName || !rating || !opinion) {
    return res.status(400).send('All fields are required.');
  }

  try {
    const reviewsRef = db.collection('reviews'); // Firestore collection for reviews
    await reviewsRef.add({
      recipeId,
      userId,
      userName,
      rating,
      opinion,
      createdAt: admin.firestore.Timestamp.now(), // Timestamp for review creation
    });

    res.status(201).send({ message: 'Review submitted successfully!' });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).send('Error submitting review.');
  }
});

// 3. Get Reviews for a Recipe (GET /get-reviews/:recipeId)
app.get('/get-reviews/:recipeId', async (req, res) => {
  const { recipeId } = req.params;

  if (!recipeId) {
    return res.status(400).send('Recipe ID is required.');
  }

  try {
    const reviewsSnapshot = await db
      .collection('reviews')
      .where('recipeId', '==', recipeId)
      .orderBy('createdAt', 'desc')
      .get();

    const reviews = [];
    reviewsSnapshot.forEach((doc) => {
      reviews.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).send('Error fetching reviews.');
  }
});

// ======================== SERVER ======================== //

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});