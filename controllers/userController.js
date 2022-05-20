const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const userController = {};
const config = require('config');

userController.signup = (req, res) => {
    const { username, email, password, subscription } = req.body;

    //simple valemailation
    if (!username || !email || !password) {
        console.log('Please enter all fields');
        return res.status(400).json({ msg: 'Please enter all fields' });
    }

    //checking for existing user
    User.findOne({ email })
        .then(user => {
            if (user) {
                console.log('user exists');
                return res.status(400).json({ msg: 'User already exists!!' });
            } else {
                const newAcccount = new User({
                    username,
                    email,
                    password
                })

                //create salt and hash
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newAcccount.password, salt, (err, hash) => {
                        if (err) throw err;
                        newAcccount.password = hash;
                        newAcccount.save().
                            then(user => {
                                jwt.sign({ email: user.email }, config.get('jwtSecret'), { expiresIn: 3600 }, (err, token) => {
                                    if (err) throw err;
                                    res.json({
                                        token,
                                        user: {
                                            email: user.email,
                                            username: user.username,
                                            email: user.email,
                                            subscription: user.subscription
                                        }
                                    })
                                })
                            })
                    })
                })
            }
        })
}

userController.login = async (req, res) => {
    User.findOne({
        username: req.body.username,
        password: req.body.password
    }).exec((err, user) => {
        if (err) {
            console.log(err);
            res.status(400).send({ message: err });
            res.status(500).send({ message: err });
            return;
        }
        if (user) {  
            console.log('triggered');
            jwt.sign({ user }, 'secretKey', (err, token) => {
                let userInfo = {
                    user: user,
                    token: token
                }
                res.json(userInfo)
            })
        }
    })
}

userController.updateSubscriptionLevel = async(req, res) => {
    console.log(req.body);
}

module.exports = userController;
