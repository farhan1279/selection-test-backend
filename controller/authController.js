const db = require('../models');
const { Op } = require('sequelize');

const path = require('path');
const fs = require('fs');

const jwt = require('jsonwebtoken');
const transporter = require('./../helpers/transporter');

const users = db.users;


const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await users.findByPk(id, { attributes: ['fullName', 'bio', 'username', 'email', 'profilePicture', 'isVerified'] });
    console.log(id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'id not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully',
      user
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving user profile'
    });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req;
    const { fullName, bio, username } = req.body;

    // Check if the new username is unique
    const existingUser = await users.findOne({
      where: {
        username: username,
        id: { [Op.not]: userId }
      }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Username is already taken'
      });
    }

    // Update user's profile
    const user = await users.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.fullName = fullName;
    user.bio = bio;
    user.username = username;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User profile updated successfully',
      user
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating user profile'
    });
  }
};

const updateProfilePicture = async (req, res) => {
  try {
    const { userId } = req;

    upload(req, res, async function (err) {
      if (err) {
        return res.status(400).json({
          success: false,
          message: 'Failed to upload profile picture',
          error: err.message
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file selected'
        });
      }

      const user = await users.findByPk(userId);
      if (!user) {
        // Remove the uploaded file if the user is not found
        fs.unlinkSync(req.file.path);

        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Remove the previous profile picture if it exists
      if (user.profilePicture) {
        const previousPicturePath = path.join('uploads', 'profile-pictures', user.profilePicture);
        fs.unlinkSync(previousPicturePath);
      }

      user.profilePicture = req.file.filename;
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Profile picture updated successfully',
        profilePicture: req.file.filename
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating profile picture'
    });
  }
};

const resendVerificationEmail = async (req, res) => {
  try {
    const { userId, email } = req;

    const user = await users.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'User is already verified'
      });
    }

    const token = jwt.sign({ userId }, 'secretKey', { expiresIn: '3h' });
    const verificationLink = `http://localhost:5000/verification/${token}`;

    const mailOptions = {
      from: 'hansenchan7@gmail.com',
      to: email,
      subject: 'Account Verification',
      html: `<p>Click the following link to verify your account:</p><p><a href="${verificationLink}">${verificationLink}</a></p>`
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        return res.status(500).json({
          success: false,
          message: 'Failed to send verification email'
        });
      } else {
        console.log('Email sent: ' + info.response);
        res.status(200).json({
          success: true,
          message: 'Verification email has been sent successfully'
        });
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while resending verification email'
    });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  updateProfilePicture,
  resendVerificationEmail
};
