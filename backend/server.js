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

const db = admin.firestore(); // Use Firestore; for Realtime DB, use `admin.database()`

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Registration route
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send('Email and password are required.');
  }

  try {
    // Save user to Firebase
    const userRef = db.collection('users').doc(); // Use Firestore
    await userRef.set({ email, password });

    res.status(200).send({ message: 'User registered successfully!' });
  } catch (error) {
    console.error('Error saving user to Firebase:', error);
    res.status(500).send('Error registering user.');
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});