const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
const multer = require('multer'); // Middleware for handling file uploads
const path = require('path'); // For handling file paths
const fs = require('fs'); // File system module

// Initialize Firebase Admin SDK
const serviceAccount = require('./hci-project-a2e73-firebase-adminsdk-7dd1s-521d64fb89.json'); // Path to your service account JSON file
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "hci-project-a2e73.appspot.com", // Replace with your Firebase storage bucket
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

const app = express();
const PORT = 3000;
//const multer = require('multer');
const upload1 = multer({ storage: multer.memoryStorage() });
// Middleware
app.use(cors()); // Enable CORS
app.use(bodyParser.json()); // Parse JSON body

// Multer Configuration for File Uploads
const upload2 = multer({
  dest: 'uploads/', // Temporary storage for files
});

// Routes

// Registration Route
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const userRecord = await admin.auth().createUser({ email, password });

    // Store user data in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      userId: userRecord.uid,
      username,
      email: userRecord.email,
      password: password, // Storing password in plain text
      createdAt: new Date().toISOString(),
      profilePic: "https://img-cdn.pixlr.com/image-generator/history/65bb506dcb310754719cf81f/ede935de-1138-4f66-8ed7-44bd16efc709/medium.webp",
      followers: [], // List of user IDs who follow this user
      following: [], // List of user IDs this user follows
      //likes: [], // List of user likes
    });

    res.status(201).send({ message: 'User registered successfully!' });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).send({ message: 'Registration failed', error: error.message });
  }
});

// Get User Stats
app.get('/userStats/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const userDoc = db.collection('users').doc(userId);
    const userSnapshot = await userDoc.get();

    if (!userSnapshot.exists) {
      return res.status(404).send({ message: 'User not found!' });
    }

    const userData = userSnapshot.data();

    res.status(200).send({
      followersCount: userData.followers.length,
      followingCount: userData.following.length,
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).send({ message: 'Failed to retrieve user stats', error: error.message });
  }
});

// Get User's Posts
app.get('/userPosts/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const postsSnapshot = await db
      .collection('Posts')
      .where('authorId', '==', userId)
      .orderBy('timestamp', 'desc') // Sort posts by timestamp (optional)
      .get();

    if (postsSnapshot.empty) {
      return res.status(404).send({ message: 'No posts found for this user.' });
    }

    const posts = postsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    res.status(200).send(posts);
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).send({ message: 'Failed to fetch posts', error: error.message });
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


app.post('/upload-image', upload2.single('image'), async (req, res) => {
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
    const usersCollection = await db
      .collection('users')
      .where('email', '==', email)
      .get();

    if (usersCollection.empty) {
      res.status(404).send({ message: 'Invalid email or password!' });
    } else {
      let validUser = false;
      let userData = null;

      usersCollection.forEach((doc) => {
        const user = doc.data();
        if (user.password === password) {
          validUser = true;
          userData = { id: doc.id, ...user }; // Include user ID and other details
        }
      });

      if (validUser) {
        res.status(200).send({
          message: 'Welcome! You have successfully logged in!',
          userId: userData.id,
          username: userData.username,
          email: userData.email,
          profilePic: userData.profilePic,
        });
      } else {
        res.status(404).send({ message: 'Invalid email or password!' });
      }
    }
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).send({ message: 'Login failed', error: error.message });
  }
});

// Upload Profile Picture Route
app.post('/uploadProfilePic/:userId', upload1.single('profilePic'), async (req, res) => {
  const { userId } = req.params;
  const file = req.file;

  if (!file) {
    return res.status(400).send({ message: 'No file uploaded!' });
  }

  const filePath = path.join(__dirname, file.path);
  const destFileName = `profilePics/${userId}_${Date.now()}_${file.originalname}`;

  try {
    // Upload file to Firebase Storage
    await bucket.upload1(filePath, {
      destination: destFileName,
      metadata: {
        contentType: file.mimetype,
      },
    });

    // Get public URL for the uploaded file
    const fileUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(destFileName)}?alt=media`;

    // Update user profilePic URL in Firestore
    await db.collection('users').doc(userId).update({ profilePic: fileUrl });

    // Delete temporary local file
    fs.unlinkSync(filePath);

    res.status(200).send({ message: 'Profile picture updated successfully!', profilePic: fileUrl });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).send({ message: 'Failed to upload profile picture', error: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
