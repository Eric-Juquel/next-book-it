import User from '../models/user';
import cloudinary from 'cloudinary';

import absoluteUrl from 'next-absolute-url';
import crypto from 'crypto';

import ErrorHandler from '../utils/errorHandler';
import sendEmail from '../utils/sendEmail';

// Setting up cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// @desc   Register user
// @route  POST/api/auth/register
// @acces  Public
const registerUser = async (req, res) => {
  const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
    folder: 'bookit/avatars',
    width: '150',
    crop: 'scale',
  });

  const { name, email, password } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: result.public_id,
      url: result.secure_url,
    },
  });

  res.status(200).json({
    success: true,
    message: 'Account Registered successfully',
  });
};

// @desc   Current user profile
// @route  GET/api/user
// @acces  Private
const currentUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    user,
  });
};

// @desc   Update user profile
// @route  GET/api/user/update
// @acces  Private
const updateProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name;
    user.email = req.body.email;

    if (req.body.password) user.password = req.body.password;
  }

  // Update avatar
  if (req.body.avatar !== '') {
    const image_id = user.avatar.public_id;

    // Delete user previous avatar
    await cloudinary.v2.uploader.destroy(image_id);

    const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: 'bookit/avatars',
      width: '150',
      crop: 'scale',
    });

    user.avatar = {
      public_id: result.public_id,
      url: result.secure_url,
    };
  }

  await user.save();

  res.status(200).json({
    success: true,
  });
};

// @desc   Forgot password
// @route  POST/api/password/forgot
// @acces  Private
const forgotPassword = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler('User not found with this email', 404));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  //Get origin
  const { origin } = absoluteUrl(req);

  // Create reset password url
  const resetUrl = `${origin}/password/reset/${resetToken}`;

  const message = `Your password reset url is as follow: \n\n ${resetUrl} \n\n If you have not requested this email, then ignore it.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'BookIT Password Recovery',
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to: ${user.email}`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforSave: false });

    return next(new ErrorHandler(error.message, 500));
  }
};

// @desc   Reset password
// @route  PUT/api/password/reset/:token
// @acces  Private
const resetPassword = async (req, res, next) => {
  //Hash URL token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.query.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler(
        'Password reset token is invalid or has been expired',
        400
      )
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler('Password does not match', 400));
  }

  // Setup the new password
  user.password = req.body.password;

  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password updated siccessfully',
  });
};

// @desc   All users
// @route  GET/api/admin/users
// @acces  ADMIN
const allAdminUsers = async (req, res) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
};

// @desc   Get user details
// @route  GET/api/admin/users/:id
// @acces  ADMIN
const getUserDetails = async (req, res) => {
  const user = await User.findById(req.query.id);

  if (!user) {
    return next(new ErrorHandler('User not found with this ID.', 404));
  }

  res.status(200).json({
    success: true,
    user,
  });
};

// @desc   Update user details
// @route  PUT/api/admin/users/:id
// @acces  ADMIN
const updateUser = async (req, res) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  const user = await User.findByIdAndUpdate(req.query.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  if (!user) {
    return next(new ErrorHandler('User not found with this ID.', 404));
  }

  res.status(200).json({
    success: true,
    user,
  });
};

// @desc   Delete details
// @route  DELETE/api/admin/users/:id
// @acces  ADMIN
const deleteUser = async (req, res) => {
  const user = await User.findById(req.query.id);

  if (!user) {
    return next(new ErrorHandler('User not found with this ID.', 404));
  }

  // Remove avatar
  const image_id = user.avatar.public_id;
  await cloudinary.v2.uploader.destroy(image_id);

  await user.remove();

  res.status(200).json({
    success: true,
    user,
  });
};

export {
  registerUser,
  currentUserProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
  allAdminUsers,
  getUserDetails,
  updateUser,
  deleteUser,
};
