import { combineReducers } from 'redux';

import {
  allRoomsReducer,
  roomDetailsReducer,
  newReviewReducer,
  checkReviewReducer,
  newRoomReducer,
  updateRoomReducer,
  deleteRoomReducer,
  roomReviewReducer,
  reviewReducer,
} from './roomReducers';
import {
  authReducer,
  forgotPasswordReducer,
  userReducer,
  loadedUserReducer,
  allUsersReducer,
  userDetailsReducer,
} from './userReducers';
import {
  checkBookingReducer,
  bookedDatesReducer,
  userBookingsReducer,
  bookingDetailsReducer,
  adminBookingsReducer,
  deleteBookingsReducer,
} from './bookingReducers';

const reducer = combineReducers({
  allRooms: allRoomsReducer,
  newRoom: newRoomReducer,
  updateRoom: updateRoomReducer,
  deleteRoom: deleteRoomReducer,
  roomDetails: roomDetailsReducer,
  roomReviews: roomReviewReducer,
  newReview: newReviewReducer,
  checkReview: checkReviewReducer,
  review: reviewReducer,
  auth: authReducer,
  loadedUser: loadedUserReducer,
  user: userReducer,
  userDetails: userDetailsReducer,
  forgotPassword: forgotPasswordReducer,
  allUsers: allUsersReducer,
  checkBooking: checkBookingReducer,
  bookedDates: bookedDatesReducer,
  userBookings: userBookingsReducer,
  adminBookings: adminBookingsReducer,
  bookingDetails: bookingDetailsReducer,
  deleteBooking: deleteBookingsReducer,
  
});

export default reducer;
