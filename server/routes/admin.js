const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const adminLayout = '../views/layouts/admin';
const jwtSecret = process.env.JWT_SECRET;


/**
 * 
 * Check Login
*/
const authMiddleware = (req, res, next ) => {
  const token = req.cookies.token;

  if(!token) {
    return res.status(401).json( { message: 'Unauthorized'} );
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch(error) {
    res.status(401).json( { message: 'Unauthorized'} );
  }
}


/**
 * GET /
 * Admin - Login Page
*/
router.get('/admin', async (req, res) => {
  try {
    const locals = {
      title: "Admin",
      description: "Simple Blog created with NodeJs, Express & MongoDb."
    }

    res.render('admin/index', { locals, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});


/**
 * POST /
 * Admin - Check Login
*/
router.post('/admin', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne( { username } );

    if(!user) {
      return res.status(401).json( { message: 'Invalid credentials' } );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if(!isPasswordValid) {
      return res.status(401).json( { message: 'Invalid credentials' } );
    }

    const token = jwt.sign({ userId: user._id}, jwtSecret );
    res.cookie('token', token, { httpOnly: true });
    res.redirect('/dashboard');

  } catch (error) {
    console.log(error);
  }
});


/**
 * GET /
 * Admin Dashboard
*/
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: 'Dashboard',
      description: 'Simple Blog created with NodeJs, Express & MongoDb.'
    }

    const data = await Post.find();
    res.render('admin/dashboard', {
      locals,
      data,
      layout: adminLayout
    });

  } catch (error) {
    console.log(error);
  }

});


/**
 * GET /
 * Admin - Create New Post
*/
router.get('/add-post', authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: 'Add Post',
      description: 'Simple Blog created with NodeJs, Express & MongoDb.'
    }

    const data = await Post.find();
    res.render('admin/add-post', {
      locals,
      layout: adminLayout
    });

  } catch (error) {
    console.log(error);
  }

});


/**
 * POST /
 * Admin - Create New Post
*/
router.post('/add-post', authMiddleware, async (req, res) => {
  try {
    const { title, body, image1, image2, image3 } = req.body;

    // Проверка наличия всех необходимых полей
    if (!title || !body || !image1 || !image2 || !image3) {
      return res.status(400).send('All fields are required');
    }

    // Формирование массива путей к изображениям
    const imagePaths = [image1, image2, image3];

    // Создание нового поста с использованием данных из формы
    const newPost = new Post({
      title,
      body,
      imagePaths,
    });

    // Сохранение поста в базе данных
    await newPost.save();

    res.redirect('/dashboard');
  } catch (error) {
    console.log(error);
    res.status(500).send('Error adding new post');
  }
});


/**
 * GET /
 * Admin - Create New Post
*/
router.get('/edit-post/:id', authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Edit Post",
      description: "Free NodeJs User Management System",
    };

    const data = await Post.findOne({ _id: req.params.id });

    res.render('admin/edit-post', {
      locals,
      data,
      layout: adminLayout
    });

  } catch (error) {
    console.log(error);
    res.status(500).send('Error editing post');
  }
});

router.put('/edit-post/:id', authMiddleware, async (req, res) => {
  try {
    const { title, body, image1, image2, image3 } = req.body;

    // Проверка наличия всех необходимых полей
    if (!title || !body || !image1 || !image2 || !image3) {
      return res.status(400).send('All fields are required');
    }

    // Формирование массива путей к изображениям
    const imagePaths = [image1, image2, image3];

    // Находим пост по ID и обновляем его данные
    await Post.findByIdAndUpdate(req.params.id, {
      title,
      body,
      imagePaths,
      updatedAt: Date.now() // Обновляем дату обновления
    });

    res.redirect('/dashboard');
  } catch (error) {
    console.log(error);
    res.status(500).send('Error editing post');
  }
});



/**
 * PUT /
 * Admin - Create New Post
*/
router.put('/edit-post/:id', authMiddleware, async (req, res) => {
  try {

    await Post.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      body: req.body.body,
      updatedAt: Date.now()
    });

    res.redirect(`/edit-post/${req.params.id}`);

  } catch (error) {
    console.log(error);
  }

});


// router.post('/admin', async (req, res) => {
//   try {
//     const { username, password } = req.body;
    
//     if(req.body.username === 'admin' && req.body.password === 'password') {
//       res.send('You are logged in.')
//     } else {
//       res.send('Wrong username or password');
//     }

//   } catch (error) {
//     console.log(error);
//   }
// });


/**
 * POST /
 * Admin - Register
*/
// Replace with your actual SMTP credentials
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'mmedikoshh@gmail.com', // Your Gmail username
    pass: process.env.GMAIL_APP_PASSWORD, // Your Gmail password stored in an environment variable
  },
});

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, age, country, gender } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10); // Hash password with bcrypt

    try {
      const user = await User.create({
        username,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        age,
        country,
        gender,
      });

      // Send email
      const mailOptions = {
        from: 'mmedikoshh@gmail.com', // Your email address
        to: email,
        subject: 'Welcome to our App!',
        text: `Hi ${firstName},

        Thank you for registering with our app!

        Sincerely,

        The App Team`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(error);
          res.status(500).json({ message: 'Internal server error' });
        } else {
          console.log(`Email sent to ${email}`);
          res.status(201).json({ message: 'User Created', user }); // Send user object without password
        }
      });
    } catch (error) {
      if (error.code === 11000) { // Handle duplicate key errors
        res.status(409).json({ message: 'Username or email already in use' });
      } else {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



module.exports = router; // Export router for use in your main app


/**
 * DELETE /
 * Admin - Delete Post
*/
router.delete('/delete-post/:id', authMiddleware, async (req, res) => {

  try {
    await Post.deleteOne( { _id: req.params.id } );
    res.redirect('/dashboard');
  } catch (error) {
    console.log(error);
  }

});


/**
 * GET /
 * Admin Logout
*/
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  //res.json({ message: 'Logout successful.'});
  res.redirect('/');
});


module.exports = router;