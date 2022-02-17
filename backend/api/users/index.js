const userRouter = require('express').Router();
const userController = require('./user.controller');

userRouter.get('/all', userController.getAllUsers);

module.exports = userRouter