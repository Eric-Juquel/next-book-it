import nc from 'next-connect';
import dbConnect from '../../../config/dbConnect';

import { categoriesOptions  } from '../../../controllers/roomControllers';

import onError from '../../../middlewares/errors';

const handler = nc({ onError });

dbConnect();

handler.get(categoriesOptions);



export default handler;