const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
const multer = require('multer'); // Middleware for handling file uploads
const path = require('path'); // For handling file paths
const fs = require('fs'); // File system module
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
// Initialize Firebase Admin SDK
const serviceAccount = require('./hci-project-a2e73-firebase-adminsdk-7dd1s-521d64fb89.json'); // Path to your service account JSON file
const { userInfo } = require('os');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "hci-project-a2e73.appspot.com", // Replace with your Firebase storage bucket
});
dotenv.config();
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
  dest: 'uploads/',
})// Temporary storage for files
//const upload = multer({ storage: multer.memoryStorage() });
// Middleware
app.use(cors()); // Enable CORS
app.use(bodyParser.json()); // Parse JSON body
// Increase payload size limit for JSON and URL-encoded requests
app.use(bodyParser.json({ limit: '500mb' })); // Set JSON payload limit to 10MB
app.use(bodyParser.urlencoded({ limit: '500mb', extended: true }));
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
// Routes
const axios = require('axios'); // Use axios to interact with external APIs
// Multer Middleware for File Uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    console.log('Received file:', req.file); // Log file data to debug
    if (!req.file) {
      return res.status(400).send({ message: 'No file uploaded!' });
    }

    const fileBuffer = req.file.buffer.toString('base64');
    console.log('Base64 Buffer Generated');

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(`data:image/png;base64,${fileBuffer}`, {
      folder: 'uploads', // Optional Cloudinary folder
    });

    console.log('Cloudinary Upload Result:', result);
    res.status(200).send({
      message: 'Image uploaded successfully!',
      imageUrl: result.secure_url,
    });
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    res.status(500).send({ message: 'Failed to upload image', error: error.message });
  }
});
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
      following: [],
      saved_posts: []// List of user IDs this user follows
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


app.get('/recipes', async (req, res) => {
  try {
    const snapshot = await db.collection('Posts').get();

    if (snapshot.empty) {
      return res.status(200).send([]); // Return an empty array if no recipes
    }

    const recipes = [];
    for (const doc of snapshot.docs) {
      const recipeData = doc.data();
      const userSnapshot = await db.collection('users').doc(recipeData.authorId).get();
      const userData = userSnapshot.exists ? userSnapshot.data() : { name: 'Anonymous' };

      recipes.push({
        postId: doc.id,
        ...recipeData,
        author: userData, // Add user data to the response
      });
    }

    res.status(200).send(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).send({ message: 'Failed to fetch recipes', error: error.message });
  }
});// Save Recipe Route
app.post('/save-recipe/:userId/:postId', async (req, res) => {
  const { userId, postId } = req.params;
  console.log('User ID:', userId, 'Post ID:', postId); // Debug IDs

  try {
    const userRef = db.collection('users').doc(userId);
    const userSnapshot = await userRef.get();

    if (!userSnapshot.exists) {
      return res.status(404).send({ message: 'User not found!' });
    }

    const userData = userSnapshot.data();
    const savedPosts = userData.saved_posts || [];

    if (savedPosts.includes(postId)) {
      return res.status(400).send({ message: 'Recipe already saved!' });
    }

    savedPosts.push(postId);
    await userRef.update({ saved_posts: savedPosts });

    res.status(200).send({ message: 'Recipe saved successfully!' });
  } catch (error) {
    console.error('Error saving recipe:', error);
    res.status(500).send({ message: 'Failed to save recipe', error: error.message });
  }
});

app.post('/unsave-recipe/:userId/:postId', async (req, res) => {
  const { userId, postId } = req.params;

  try {
    const userRef = db.collection('users').doc(userId);
    const userSnapshot = await userRef.get();

    if (!userSnapshot.exists) {
      return res.status(404).send({ message: 'User not found!' });
    }

    const userData = userSnapshot.data();
    const savedPosts = userData.saved_posts || [];

    // Remove the postId from saved_posts
    const updatedPosts = savedPosts.filter((id) => id !== postId);
    await userRef.update({ saved_posts: updatedPosts });

    res.status(200).send({ message: 'Post unsaved successfully!' });
  } catch (error) {
    console.error('Error unsaving post:', error);
    res.status(500).send({ message: 'Failed to unsave post', error: error.message });
  }
});

app.get('/bookmarked/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const userRef = db.collection('users').doc(userId);
    const userSnapshot = await userRef.get();

    if (!userSnapshot.exists) {
      return res.status(404).send({ message: 'User not found!' });
    }

    const userData = userSnapshot.data();
    const savedPosts = userData.saved_posts || [];

    if (savedPosts.length === 0) {
      return res.status(200).send([]); // No saved posts
    }

    const posts = [];
    for (const postId of savedPosts) {
      const postSnapshot = await db.collection('Posts').doc(postId).get();
      if (postSnapshot.exists) {
        const postData = postSnapshot.data();
        posts.push(postData);
      }
    }

    res.status(200).send(posts);
  } catch (error) {
    console.error('Error fetching saved posts:', error);
    res.status(500).send({ message: 'Failed to fetch saved posts', error: error.message });
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
    // Create a new recipe object without postId initially
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

    // Add the recipe to the 'Posts' collection and get the document reference
    const docRef = await db.collection('Posts').add(newRecipe);

    // Update the document with the generated postId
    await db.collection('Posts').doc(docRef.id).update({
      postId: docRef.id,
    });

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
