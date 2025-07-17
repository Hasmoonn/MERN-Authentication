import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from '../config/emailTemplates.js'


// User Registration (success)
export const register = async (req, res) => {

  const { name, email, password } = req.body

  if (!name || !email || !password) {
    return res.json({success: false, message: "Missing Details"})
  }

  try {

    const existingUser = await userModel.findOne({email})

    if (existingUser) {
      return res.json({success:false, message: "User already exist"})
    }

    // encrypt password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new userModel({name, email, password: hashedPassword});

    await user.save();

    const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    // Sending welcome email
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome to My MERN Authentication Website",
      text: `Welcome to my website. Your account has been created with email id: ${email}`
    }

    await transporter.sendMail(mailOptions);



    return res.json({success: true});
    
  } catch (error) {
     console.log(error.message);
     res.json({success: false, message: error.message})
  }
}


// User Login (success)
export const login = async (req, res) => {

  const { email, password } = req.body

  if (!email || !password) {
    return res.json({success:false, message: "Email and Password are required"})
  }

  try {

    const user = await userModel.findOne({email});

    if (!user) {
      return res.json({success: false, message: "Invalid Email"})
    }

    const isMatch = await bcrypt.compare(password, user.password) 
    
    if (!isMatch) {
      return res.json({success:false, message: "Invalid Password"})
    }

    const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });


    return res.json({success:true})

  } catch (error) {
      console.log(error.message);
      res.json({success: false, message: error.message})
  }
}


// User Logout (success)
export const logout = async (req, res) => {

  try {

    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    })

    return res.json({success: true, message: "Logged out"})
    
  } catch (error) {
      console.log(error.message);
      res.json({success: false, message: error.message})
  }
}


// Send verification OTP to the user's mail (success)
export const sendVerifyOtp = async (req, res) => {

  try {
    
    const userId = req.user.id;

    const user = await userModel.findById(userId)

    if (user.isAccountVerified) {
      return res.json({success:false, message: 'Account already verified'})
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000))

    user.verifyOtp = otp;

    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000

    await user.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Account verification OTP",
      // text: `Your OTP is ${otp}. verify your account using this OTP.`,
      html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace('{{email}}', user.email)
    }

    await transporter.sendMail(mailOptions);

    res.json({success:true, message:"Verification OTP sent on Email"});

  } catch (error) {
      console.log(error.message);
      res.json({success: false, message: error.message})
  }
}


// verify the email after otp recieved... (success)
export const verifyEmail = async (req, res) => {

  const userId = req.user.id
  const { otp } = req.body

  if (!userId || !otp) {
    return res.json({success:false, message:"Missing Details"})
  }

  try {

    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({success:false, message: "User Not found"})
    }
    
    if (user.verifyOtp === '' || user.verifyOtp !== otp) {
      return res.json({success: false, message: "Invalid OTP" })
    }

    if (user.verifyOtpExpireAt < Date.now()) {
      return res.json({success: false, message: "OTP Expired" })
    }

    user.isAccountVerified = true;

    user.verifyOtp = ''
    user.verifyOtpExpireAt = 0;

    await user.save();

    return res.json({ success:true, message: 'Email verified successfully' })

  } catch (error) {
      res.json({success:false, message:error.message})
  }
}


// check if user is authenticated (success)
export const isAuthenticated = async (req, res) => {

  try {
    return res.json({ success: true, userId: req.user.id }) // changed
  } catch (error) {
      return res.json({success:false, message:error.message})
  }
}



// send password reset otp (success)
export const sendResetOtp = async (req, res) => {

  const { email } = req.body;

  if (!email) {
    return res.json({success:false, message: "Email is required"})
  }

  try {

    const user = await userModel.findOne({email})

    if (!user) {
      return res.json({success:false, message: "User not found"})
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000))

    user.resetOtp = otp;

    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000

    await user.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password reset OTP",
      // text: `Your OTP for resetting your password is ${otp}. Use this OTP to proceed with resetting your password.`,
      html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email)
    };

    await transporter.sendMail(mailOptions);

    return res.json({success:true, message:"OTP send to your email"})
    
  } catch (error) {
      res.json({success:false, message:error.message});
  }
}


//Reset user Password (success)
export const resetPassword = async (req, res) => {

  const {email, otp, newPassword} = req.body

  if (!email || !otp || !newPassword) {
    return res.json({success:false, message:"Email, Otp and New Password are required"})
  }

  try {

    const user = await userModel.findOne({email})

    if (!user) {
      return res.json({success:false, message:"User not found"})
    }

    if (user.resetOtp === '' || user.resetOtp !== otp) {
      return res.json({success:false, message:"Invalid OTP"})
    }
    
    if (user.resetOtpExpireAt < Date.now()) {
      return res.json({success:false, message:"OTP Expired"})
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    user.resetOtp = ''
    user.resetOtpExpireAt = 0;

    await user.save();

    return res.json({success:true, message:"Password has been reset successfully"})

  } catch (error) {
    return res.json({success:false, message: error.message})
  }
}