import nc from 'next-connect';
import dbConnect from '../../../../config/dbConnect';

import {
  allAdminRooms,
  newRoom,
} from '../../../../controllers/roomControllers';
import {
  isAuthenticatedUser,
  authorizeRoles,
} from '../../../../middlewares/auth';

import onError from '../../../../middlewares/errors';

const handler = nc({ onError });

dbConnect();

handler.use(isAuthenticatedUser, authorizeRoles('admin')).get(allAdminRooms);
handler.use(isAuthenticatedUser, authorizeRoles('admin')).post(newRoom);

export default handler;
