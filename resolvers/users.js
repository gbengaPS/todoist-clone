/* eslint-disable no-underscore-dangle */
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { generateUserToken } = require('./includes');
const { AUTH_ERROR } = require('../helpers');

const userResolvers = {
  getUsers: (args, req) => {
    if (!req.isAuthenticated) {
      throw new Error(AUTH_ERROR);
    }
    return User.find()
      .then(users => users)
      .catch(error => error);
  },

  login: async (args) => {
    const { password, email } = args;
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User does not exist');
    }

    const isAuthenticated = await bcrypt.compare(password, user.password);

    if (!isAuthenticated) {
      throw new Error('Password incorrect');
    }

    const userToken = generateUserToken(user);
    user.token = userToken;
    return user;
  },

  signup: async (args) => {
    const { email, password } = args;
    const transformedEmail = email.toLowerCase();
    const newUser = new User({
      password,
      email,
      createdBy: transformedEmail,
      updatedBy: transformedEmail,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    try {
      const createdUser = await newUser.save();
      const token = generateUserToken(newUser);
      createdUser.token = token;
      return createdUser;
    } catch (error) {
      return error;
    }
  },
};

module.exports = userResolvers;
