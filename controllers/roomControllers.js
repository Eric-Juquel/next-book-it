import Room from '../models/room';
import Booking from '../models/booking';

import ErrorHandler from '../utils/errorHandler';
import APIFeatures from '../utils/apiFeatures';

import cloudinary from 'cloudinary';

// @desc   Get all rooms
// @route  GET/api/rooms
// @acces  Public
const allRooms = async (req, res) => {
  const resPerPage = 4;
  const roomsCount = await Room.countDocuments();

  const apiFeatures = new APIFeatures(Room.find(), req.query).search().filter();

  let rooms = await apiFeatures.query;
  let filteredRoomsCount = rooms.length;

  apiFeatures.pagination(resPerPage);
  rooms = await apiFeatures.query.clone();

  res.status(200).json({
    success: true,
    roomsCount,
    resPerPage,
    filteredRoomsCount,
    rooms,
  });
};

// @desc   Get room details
// @route  GET/api/rooms/:id
// @acces  Public
const getSingleRoom = async (req, res, next) => {
  const room = await Room.findById(req.query.id);

  if (!room) {
    return next(new ErrorHandler('Room not found with this ID', 404));
  }

  res.status(200).json({
    success: true,
    room,
  });
};

//Get Select Options from Room model
const categoriesOptions = async (req, res) => {
  const options = await Room.schema.path('category').enumValues;

  res.status(200).json({
    success: true,
    options,
  });
};

// @desc   Create a new room
// @route  POST /api/admin/rooms
// @acces  Admin
const newRoom = async (req, res) => {
  const images = req.body.images;

  let imagesLinks = [];

  for (let i = 0; i < images.length; i++) {
    const result = await cloudinary.v2.uploader.upload(images[i], {
      folder: 'bookit/rooms',
    });

    imagesLinks.push({
      public_id: result.public_id,
      url: result.secure_url,
    });
  }

  req.body.images = imagesLinks;
  req.body.user = req.user._id;

  const room = await Room.create(req.body);

  res.status(200).json({
    success: true,
    room,
  });
};

// @desc   Update room details
// @route  PUT/api/admin/rooms/:id
// @acces  Admin
const updateRoom = async (req, res) => {
  let room = await Room.findById(req.query.id);

  if (!room) {
    return next(new ErrorHandler('Room not found with this ID', 404));
  }

  if (req.body.images) {
    // Delete images assiocated with the room
    for (let i = 0; i < room.images.length; i++) {
      await cloudinary.v2.uploader.destroy(room.images[i].public_id);
    }

    let imagesLinks = [];
    const images = req.body.images;
    

    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.v2.uploader.upload(images[i], {
        folder: 'bookit/rooms',
      });

      imagesLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }

    req.body.images = imagesLinks;
  }

  room = await Room.findByIdAndUpdate(req.query.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    room,
  });
};

// @desc   Delete room
// @route  PUT/api/rooms/:id
// @acces  Admin
const deleteRoom = async (req, res) => {
  const room = await Room.findById(req.query.id);

  if (!room) {
    return next(new ErrorHandler('Room not found with this ID', 404));
  }

 // Delete images assiocated with the room
 for (let i = 0; i < room.images.length; i++) {
  await cloudinary.v2.uploader.destroy(room.images[i].public_id);
}

  await room.remove();

  res.status(200).json({
    success: true,
    message: 'Room is deleted',
  });
};

// @desc   Create aa new review
// @route  PUT/api/reviews
// @acces  Private
const createRoomReview = async (req, res) => {
  const { rating, comment, roomId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const room = await Room.findById(roomId);

  const isReviewed = room.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );

  if (isReviewed) {
    room.reviews.forEach((review) => {
      if (review.user.toDtring() === req.user._id.toString()) {
        review.comment = comment;
        review.rating = rating;
      }
    });
  } else {
    room.reviews.push(review);
    room.numOfReviews = room.reviews.length;
  }

  room.rating =
    room.reviews.reduce((acc, item) => item.rating + acc, 0) /
    room.reviews.length;

  await room.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
};

// @desc   Check Review availability
// @route  GET/api/reviews/check_review_availability
// @acces  Private
const checkReviewAvailability = async (req, res) => {
  const { roomId } = req.query;

  const bookings = await Booking.find({ user: req.user._id, room: roomId });

  let isReviewAvailable = false;

  if (bookings.length > 0) isReviewAvailable = true;

  res.status(200).json({
    success: true,
    isReviewAvailable,
  });
};

// @desc   Get all rooms
// @route  GET/api/admin/rooms
// @acces  Admin
const allAdminRooms = async (req, res) => {
  const rooms = await Room.find();

  res.status(200).json({
    success: true,
    rooms,
  });
};

// @desc   Get all room reviews
// @route  GET/api/admin/reviews
// @acces  Admin
const getRoomReviews = async (req, res) => {
  const room = await Room.findById(req.query.id);

  res.status(200).json({
    success: true,
    reviews: room.reviews
  });
};

// @desc   Delete a review
// @route  Delete/api/admin/reviews/:id
// @acces  Admin
const deleteReview = async (req, res) => {
  const room = await Room.findById(req.query.roomId);

  const reviews = room.reviews.filter(review => review._id.toString() !== req.query.id.toString())

  const numOfReviews = reviews.length

  const ratings = room.reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length

await Room.findByIdAndUpdate(req.query.roomId, {
  reviews,
  ratings,
  numOfReviews
}, {
  new:true,
  runValidators: true,
  useFindAndModify: false
})

  res.status(200).json({
    success: true,
    reviews: room.reviews
  });
};

export {
  allRooms,
  newRoom,
  getSingleRoom,
  updateRoom,
  deleteRoom,
  categoriesOptions,
  createRoomReview,
  checkReviewAvailability,
  allAdminRooms,
  getRoomReviews,
  deleteReview
};
