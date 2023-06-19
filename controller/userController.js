const db = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
// const nodemailer = require('nodemailer');
const transporter = require("./../helpers/transporter")
const handlebars = require('handlebars')
const path = require('path')
const fs = require('fs')

const users = db.users;

const register = async (req, res) => {
  try {
    const { name, email, password, confirmpassword } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Data harus diisi'
      });
    }

    const findUser = await users.findOne({ where: { email: email } });
    if (findUser) {
      return res.status(409).json({
        success: false,
        message: 'Pengguna sudah terdaftar'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await users.create({
      name,
      email,
      password: hashedPassword
    });

    // token jwt verification
    const token = jwt.sign({ userId: newUser.id }, 'secretKey', { expiresIn: '3h' });
    const verificationLink = `http://localhost:5000/verification/${token}`;
    
    // Load the email template
    const templatePath = path.join(__dirname, '..', 'support', 'template.html');
    const templateFile = fs.readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(templateFile);
    
    // Set the template variables
    const templateData = {
      verificationLink: verificationLink
    };
    
    // Render the email template with the data
    const emailHtml = template(templateData);
    
    // Send verification email
    const mailOptions = {
      from: 'hansenchan7@gmail.com',
      to: email,
      subject: 'Account Verification',
      html: emailHtml
    };

    transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
        console.log(error);
        return res.status(500).json({
          success: false,
          message: 'Gagal mengirim email verifikasi'
        });
      } else {
        console.log('Email sent: ' + info.response);
        res.status(201).json({
          success: true,
          message: 'Registrasi berhasil. Silakan cek email Anda untuk verifikasi.',
          userData: newUser,
          token: token
        });
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat registrasi'
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password harus diisi'
      });
    }

    const user = await users.findOne({ where: { [Op.or]: [{ name: email }, { email: email }] } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Akun tidak ditemukan'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Password salah'
      });
    }

    // jwt token auth
    const token = jwt.sign({ userId: user.id, is_admin: user.is_admin }, 'secretKey');

    const { password: userPassword, ...userData } = user.toJSON();

    res.status(200).json({
      success: true,
      message: 'Login berhasil',
      userData: userData,
      token: token
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat login'
    });
  }
}

  const verify = async (req, res) => {
    try {
      const token = req.params.token;
  
      // Verify the token
      const decoded = jwt.verify(token, 'secretKey');
  
      // update users verification status
      const user = await users.findByPk(decoded.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Akun tidak ditemukan'
        });
      }
  
      user.isVerified = true;
      await user.save();
  
      res.status(200).json({
        success: true,
        message: 'Akun berhasil diverifikasi'
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat verifikasi akun'
      });
    }
  };

  const resendVerificationEmail = async (req, res) => {
    try {
      const { email } = req.body;
  
      // find  user by email
      const user = await users.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Akun tidak ditemukan'
        });
      }
  
      // new verification token
      const token = jwt.sign({ userId: user.id }, 'secretKey', { expiresIn: '3h' });
  
      // Send verification email
      const verificationLink = `http://localhost:5000/verification/${token}`;
      const mailOptions = {
        from: 'hello@example.com',
        to: user.email,
        subject: 'Account Verification',
        html: `<p>Click the following link to verify your account:</p><p><a href="${verificationLink}">${verificationLink}</a></p>`
      };
  
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
          return res.status(500).json({
            success: false,
            message: 'Gagal mengirim email verifikasi'
          });
        } else {
          console.log('Email sent: ' + info.response);
          res.status(200).json({
            success: true,
            message: 'Email verifikasi berhasil dikirim ulang'
          });
        }
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengirim email verifikasi'
      });
    }
  }


module.exports = {
  register,
  login,
  verify,
  resendVerificationEmail
};
