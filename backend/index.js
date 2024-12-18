const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const admin = require('firebase-admin');

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


app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const userRecord = await admin.auth().createUser({ email, password });

    await db.collection('users').doc(userRecord.uid).set({
      userId: userRecord.uid,
      username,
      email: userRecord.email,
      password: password, 
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
      return res.status(200).send([]); 
    }

    const recipes = [];
    for (const doc of snapshot.docs) {
      const recipeData = doc.data();
      const userSnapshot = await db.collection('users').doc(recipeData.authorId).get();
      const userData = userSnapshot.exists ? userSnapshot.data() : { name: 'Anonymous' };

      recipes.push({
        postId: doc.id,
        ...recipeData,
        author: userData, 
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
  console.log('User ID:', userId, 'Post ID:', postId); 

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


app.post('/like-recipe/:userId/:postId', async (req, res) => {
  const { userId, postId } = req.params;

  try {
    const postRef = db.collection('Posts').doc(postId);
    const postSnapshot = await postRef.get();

    if (!postSnapshot.exists) {
      return res.status(404).send({ message: 'Recipe not found!' });
    }

    const postData = postSnapshot.data();
    const likedBy = postData.likedBy || [];
    const likes = Number(postData.likes) || 0; // Cast likes to number

    if (likedBy.includes(userId)) {
      return res.status(400).send({ message: 'You already liked this recipe!' });
    }

    // Add the user ID to the likedBy array and increment the likes count
    likedBy.push(userId);
    const updatedLikes = likes + 1;

    await postRef.update({ likedBy, likes: updatedLikes });

    res.status(200).send({ 
      message: 'Recipe liked successfully!', 
      updatedLikes 
    });
  } catch (error) {
    console.error('Error liking recipe:', error);
    res.status(500).send({ message: 'Failed to like recipe', error: error.message });
  }
});



app.post('/add-comment/:postId', async (req, res) => {
  const { postId } = req.params;
  const { userId, comment , username } = req.body;

  try {
    const postRef = db.collection('Posts').doc(postId);
    const postSnapshot = await postRef.get();

    if (!postSnapshot.exists) {
      return res.status(404).send({ message: 'Recipe not found!' });
    }

    const postData = postSnapshot.data();
    const comments = postData.comments || [];

    // Add new comment
    comments.push({ userId, comment, timestamp: new Date().toISOString() , username});

    // Update the recipe document
    await postRef.update({ comments });

    res.status(200).send({ message: 'Comment added successfully!' });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).send({ message: 'Failed to add comment', error: error.message });
  }
});

  // Save Meal Plan
app.post('/save-meal-plan/:userId', async (req, res) => {
  const { userId } = req.params;
  const { selectedMeals } = req.body; // The meal plan data

  try {
    // Reference to the user's document in Firestore
    const userRef = db.collection('MealPlans').doc(userId);

    // Save or update the meal plan for the user
    await userRef.set({ selectedMeals }, { merge: true });

    res.status(200).send({ message: 'Meal plan saved successfully!' });
  } catch (error) {
    console.error('Error saving meal plan:', error);
    res.status(500).send({ message: 'Failed to save meal plan', error: error.message });
  }
});

// Unsave Meal Plan (Remove a meal)
app.post('/unsave-meal/:userId', async (req, res) => {
  const { userId } = req.params;
  const { day, mealToRemove } = req.body; // Day and meal to remove

  try {
    const userRef = db.collection('MealPlans').doc(userId);
    const userSnapshot = await userRef.get();
    
    if (!userSnapshot.exists) {
      return res.status(404).send({ message: 'Meal plan not found!' });
    }

    const userData = userSnapshot.data();
    const selectedMeals = userData.selectedMeals || {};
    
    /*if (!selectedMeals[day]) {
      return res.status(400).send({ message: 'No meals found for this day.' });
    }*/

    const updatedMeals = selectedMeals[day].filter(meal => meal.recipe.name !== mealToRemove.recipe.name);

    selectedMeals[day] = updatedMeals;

    // Update the meal plan with the removed meal
    await userRef.update({ selectedMeals });

    res.status(200).send({ message: 'Meal removed successfully!' });
  } catch (error) {
    console.error('Error removing meal:', error);
    res.status(500).send({ message: 'Failed to remove meal', error: error.message });
  }
});

// Retrieve Meal Plan
app.get('/get-meal-plan/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const userRef = db.collection('MealPlans').doc(userId);
    const userSnapshot = await userRef.get();
    
    if (!userSnapshot.exists) {
      return res.status(404).send({ message: 'Meal plan not found!' });
    }

    const userData = userSnapshot.data();
    res.status(200).send(userData);
  } catch (error) {
    console.error('Error retrieving meal plan:', error);
    res.status(500).send({ message: 'Failed to retrieve meal plan', error: error.message });
  }
});

app.get('/get-comments', async (req, res) => {
  try {
    const recipesSnapshot = await db.collection('Posts').get();
    const recipes = recipesSnapshot.docs.map((doc) => ({
      postId: doc.id,
      ...doc.data(),
    }));

    res.status(200).send(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).send({ message: 'Failed to fetch recipes', error: error.message });
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
      return res.status(200).send([]); 
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
app.post('/upload-image', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: 'No image file provided!' });
  }

  try {
    // Convert the file buffer to base64 (required for Cloudinary)
    const imageBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(imageBase64, {
      folder: 'recipe_images', // Optional folder in Cloudinary
    });

    // Return the secure image URL from Cloudinary
    res.status(200).send({ imageUrl: result.secure_url });
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    res.status(500).send({ message: 'Error uploading image', error: error.message });
  }
});

app.post('/post-recipe', async (req, res) => {
  const { title, instructions, ingredients, imageUrl, authorId } = req.body;


  if (!title || !instructions) {
    return res.status(400).send({
      message: 'Title and instructions are required fields.',
    });
  }

  try {

    const newRecipe = {
      title,
      instructions,
      ingredients: ingredients || [], 
      imageUrl: imageUrl || '', 
      authorId: authorId || 'anonymous', 
      timestamp: new Date().toISOString(),
      likes: [], 
      comments: [], 
    };

    const docRef = await db.collection('Posts').add(newRecipe);

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

app.get('/userPosts/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const postsSnapshot = await db
      .collection('Posts')
      .where('authorId', '==', userId)
      .orderBy('timestamp', 'desc') 
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

  try {
    // Convert file to Base64 for Cloudinary
    const imageBase64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(imageBase64, {
      folder: 'profile_pics', // Optional folder name
    });

    // Update Firestore with the Cloudinary URL
    const fileUrl = result.secure_url;
    await db.collection('users').doc(userId).update({ profilePic: fileUrl });

    res.status(200).send({
      message: 'Profile picture updated successfully!',
      profilePic: fileUrl,
    });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).send({ message: 'Failed to upload profile picture', error: error.message });
  }
});



// ================= START SERVER ================= //

// Fetch Author Profile Data (User Info + Stats + Posts)
app.get('/author-profile/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    // Fetch user info
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).send({ message: 'User not found!' });
    }

    const userData = userDoc.data();

    // Fetch user's posts
    const postsSnapshot = await db
      .collection('Posts')
      .where('authorId', '==', userId)
      .orderBy('timestamp', 'desc')
      .get();

    const posts = postsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Prepare stats
    const stats = {
      followersCount: userData.followers.length,
      followingCount: userData.following.length,
      postsCount: posts.length,
    };

    // Combine everything
    const profileData = {
      userId,
      username: userData.username,
      email: userData.email,
      profilePic: userData.profilePic,
      followers: userData.followers,
      following: userData.following,
      stats,
      posts,
    };

    res.status(200).send(profileData);
  } catch (error) {
    console.error('Error fetching author profile:', error);
    res.status(500).send({ message: 'Failed to fetch author profile', error: error.message });
  }
});

// Follow User Route
app.post('/follow/:userId/:followUserId', async (req, res) => {
  const { userId, followUserId } = req.params;

  try {
    // Get current user data
    const userRef = db.collection('users').doc(userId);
    const userSnapshot = await userRef.get();
    if (!userSnapshot.exists) {
      return res.status(404).send({ message: 'User not found!' });
    }
    const userData = userSnapshot.data();

    // Get followed user data
    const followUserRef = db.collection('users').doc(followUserId);
    const followUserSnapshot = await followUserRef.get();
    if (!followUserSnapshot.exists) {
      return res.status(404).send({ message: 'Followed user not found!' });
    }

    const followUserData = followUserSnapshot.data();

    // Check if already following
    if (userData.following.includes(followUserId)) {
      return res.status(400).send({ message: 'Already following this user.' });
    }

    // Add to following and followers
    await userRef.update({
      following: [...userData.following, followUserId],
    });
    await followUserRef.update({
      followers: [...followUserData.followers, userId],
    });

    res.status(200).send({ message: 'User followed successfully!' });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).send({ message: 'Failed to follow user', error: error.message });
  }
});

// Unfollow User Route
app.post('/unfollow/:userId/:followUserId', async (req, res) => {
  const { userId, followUserId } = req.params;

  try {
    // Get current user data
    const userRef = db.collection('users').doc(userId);
    const userSnapshot = await userRef.get();
    if (!userSnapshot.exists) {
      return res.status(404).send({ message: 'User not found!' });
    }
    const userData = userSnapshot.data();

    // Get followed user data
    const followUserRef = db.collection('users').doc(followUserId);
    const followUserSnapshot = await followUserRef.get();
    if (!followUserSnapshot.exists) {
      return res.status(404).send({ message: 'Followed user not found!' });
    }

    const followUserData = followUserSnapshot.data();

    // Check if not following
    if (!userData.following.includes(followUserId)) {
      return res.status(400).send({ message: 'Not following this user.' });
    }

    // Remove from following and followers
    await userRef.update({
      following: userData.following.filter((id) => id !== followUserId),
    });
    await followUserRef.update({
      followers: followUserData.followers.filter((id) => id !== userId),
    });

    res.status(200).send({ message: 'User unfollowed successfully!' });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).send({ message: 'Failed to unfollow user', error: error.message });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});