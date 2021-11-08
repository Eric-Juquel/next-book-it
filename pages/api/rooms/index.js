import nc from 'next-connect';
import dbConnect from '../../../config/dbConnect';

import { allRooms} from '../../../controllers/roomControllers';

import onError from '../../../middlewares/errors';

const handler = nc({ onError });

dbConnect();

handler.get(allRooms);

export default handler;
