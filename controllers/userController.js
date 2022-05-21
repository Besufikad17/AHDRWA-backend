const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const userController = {};
const mongoose = require('mongoose');
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
                                            id: user._id,
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
    
    const { username, password} = req.body;

    if(!username || !password){
        console.log('Please enter all fields');
        return res.status(400).json({ msg: 'Please enter all fields' });
    }

    User.findOne({
        username: username,
        password: password
    }).exec((err, user) => {
        if (err) {
            console.log(err);
            console.log('triggered');
            res.status(400).send({ message: err });
            res.status(500).send({ message: err });
            return;
        }
        if (user) {  
            jwt.sign({ user }, 'secretKey', (err, token) => {
                if (err) {
                    console.log(err);
                    console.log('triggered');
                    res.status(400).send({ message: err });
                    res.status(500).send({ message: err });
                    return;
                }
                let userInfo = {
                    user: user,
                    token: token
                }
                res.status(200).json(userInfo)
            })
        }
    })
}

userController.updateSubscriptionLevel = async(req, res) => {
    const { id, subscription_lvl } = req.body;

    if(!id || !subscription_lvl){
        console.log('Please enter all fields');
        return res.status(400).json({ msg: 'Please enter all fields' });
    }

    User.findOne({ _id: { $in: mongoose.Types.ObjectId(id) } }, function (err, user) {
        if (user) {
            user.subscription = subscription_lvl;
            user.save();
            res.json(user)
        }

        if (err) {
            res.json(err)
        }
    })

}

userController.getUserById = async(req,res) => {
    console.log(req.params)
    User.findOne({ _id: { $in: mongoose.Types.ObjectId(req.params.id) } }, function (err, user) {
        if (user) {
            res.json(user)
        }

        if (err) {
            res.json(err)
        }
    })
}

module.exports = userController;
