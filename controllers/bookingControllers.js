import Booking from '../models/booking';

import ErrorHandler from '../utils/errorHandler';

import Moment from 'moment';
import { extendMoment } from 'moment-range';

const moment = extendMoment(Moment);

// @desc   Create new booking
// @route  POST/api/bookings
// @acces  Private
const newBooking = async (req, res) => {
  const {
    room,
    checkInDate,
    checkOutDate,
    daysOfStay,
    amountPaid,
    paymentInfo,
  } = req.body;

  const booking = await Booking.create({
    room,
    user: req.user._id,
    checkInDate,
    checkOutDate,
    daysOfStay,
    amountPaid,
    paymentInfo,
    paidAt: Date.now(),
  });

  res.status(200).json({
    success: true,
    booking,
  });
};

// @desc   Check room booking availability
// @route  GET/api/bookings/check_room_availability
// @acces  Public
const checkRoomBookingAvailability = async (req, res) => {
  let { roomId, checkInDate, checkOutDate } = req.query;

  console.log(req.query);

  checkInDate = new Date(checkInDate);
  checkOutDate = new Date(checkOutDate);

  const bookings = await Booking.find({
    room: roomId,
    $and: [
      {
        checkInDate: {
          $lte: checkOutDate,
        },
      },
      {
        checkOutDate: {
          $gte: checkInDate,
        },
      },
    ],
  });

  //Check if there is any booking available
  let isAvailable;

  if (bookings && bookings.length === 0) {
    isAvailable = true;
  } else {
    isAvailable = false;
  }

  res.status(200).json({
    success: true,
    isAvailable,
  });
};

// @desc   Check booked dates of a room
// @route  GET/api/bookings/check_booked_dates
// @acces  Public
const checkBookedDatesOfRoom = async (req, res) => {
  const { roomId } = req.query;

  const bookings = await Booking.find({ room: roomId });

  let bookedDates = [];

  const timeDifference = moment().utcOffset() / 60;

  bookings.forEach((booking) => {
    const checkInDate = moment(booking.checkInDate).add(
      timeDifference,
      'hours'
    );
    const checkOutDate = moment(booking.checkOutDate).add(
      timeDifference,
      'hours'
    );

    const range = moment.range(moment(checkInDate), moment(checkOutDate));

    const dates = Array.from(range.by('day'));
    bookedDates = bookedDates.concat(dates);
  });

  res.status(200).json({
    success: true,
    bookedDates,
  });
};

// @desc   Get all bookings of current user
// @route  GET/api/bookings/user
// @acces  Private
const userBookings = async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate({
      path: 'room',
      select: 'name pricePerNight images',
    })
    .populate({
      path: 'user',
      select: 'name email',
    });

  res.status(200).json({
    success: true,
    bookings,
  });
};

// @desc   Get booking details
// @route  GET/api/bookings/:id
// @acces  Private
const getBookingDetails = async (req, res) => {
  const booking = await Booking.findById(req.query.id)
    .populate({
      path: 'room',
      select: 'name pricePerNight images',
    })
    .populate({
      path: 'user',
      select: 'name email',
    });

  res.status(200).json({
    success: true,
    booking,
  });
};

// @desc   Get all bookings
// @route  GET/api/admin/bookings
// @acces ADMIN
const allAdminBookings = async (req, res) => {
  const bookings = await Booking.find()
    .populate({
      path: 'room',
      select: 'name pricePerNight images',
    })
    .populate({
      path: 'user',
      select: 'name email',
    });
  res.status(200).json({
    success: true,
    bookings,
  });
};

// @desc   Delete booking
// @route  DELETE/api/admin/bookings/:id
// @acces ADMIN
const deleteBooking = async (req, res, next) => {
  const booking = await Booking.findById(req.query.id);

  if (!booking) {
    return next(new ErrorHandler('Booking not found with this ID', 404));
  }

  await booking.remove();

  res.status(200).json({
    success: true,
  });
};

export {
  newBooking,
  checkRoomBookingAvailability,
  checkBookedDatesOfRoom,
  userBookings,
  getBookingDetails,
  allAdminBookings,
  deleteBooking,
};
