const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./hci-project-a2e73-firebase-adminsdk-7dd1s-521d64fb89.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "hci-project-a2e73.appspot.com",
});
dotenv.config();
const db = admin.firestore();
const bucket = admin.storage().bucket();

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ limit: '500mb', extended: true }));

const upload = multer({ storage: multer.memoryStorage() });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ================= ROUTES ================= //

// 1. Registration Route
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const userRecord = await admin.auth().createUser({ email, password });

    await db.collection('users').doc(userRecord.uid).set({
      userId: userRecord.uid,
      username,
      email: userRecord.email,
      password: password, // Caution: Avoid storing plain passwords
      createdAt: new Date().toISOString(),
      profilePic: "https://img-cdn.pixlr.com/image-generator/history/default_profile_pic.webp",
      followers: [],
      following: [],
      saved_posts: [],
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
    let userData = null;

    usersSnapshot.forEach((doc) => {
      const user = doc.data();
      if (user.password === password) {
        validUser = true;
        userData = { id: doc.id, ...user };
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
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).send({ message: 'Login failed', error: error.message });
  }
});

// 3. Submit a Review
app.post('/add-review', async (req, res) => {
  const { recipeId, userId, userName, rating, opinion } = req.body;

  if (!recipeId || !userId || !rating || !opinion) {
    return res.status(400).send({ message: 'All fields are required.' });
  }

  try {
    const newReview = {
      recipeId,
      userId,
      userName,
      rating,
      opinion,
      createdAt: new Date().toISOString(),
    };

    const reviewRef = await db.collection('reviews').add(newReview);

    res.status(201).send({
      message: 'Review added successfully!',
      id: reviewRef.id,
    });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).send({ message: 'Failed to add review', error: error.message });
  }
});

// 4. Get Reviews
app.get('/get-reviews/:recipeId', async (req, res) => {
  const { recipeId } = req.params;

  try {
    const reviewsSnapshot = await db
      .collection('reviews')
      .where('recipeId', '==', recipeId)
      .orderBy('createdAt', 'desc')
      .get();

    const reviews = reviewsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    res.status(200).send(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).send({ message: 'Failed to fetch reviews', error: error.message });
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
});

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

app.post('/uploadProfilePic/:userId', upload.single('profilePic'), async (req, res) => {
  const { userId } = req.params;
  const file = req.file;

  if (!file) {
    return res.status(400).send({ message: 'No file uploaded!' });
  }

  const filePath = path.join(__dirname, file.path);
  const destFileName = `profilePics/${userId}_${Date.now()}_${file.originalname}`;

  try {
    // Upload file to Firebase Storage
    await bucket.upload(filePath, {
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


// ================= START SERVER ================= //
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});