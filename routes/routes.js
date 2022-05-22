const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('./auth');

router.post('/signup', userController.signup);

router.post('/login', auth.auth);

router.put('/subscribe', userController.updateSubscriptionLevel);

router.get('/user/:id', userController.getUserById);

router.get('/user', auth.getCurrentUser)

module.exports = router;
