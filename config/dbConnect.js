import mongoose from 'mongoose';
import colors from 'colors';

const dbConnect = () => {

  if (mongoose.connection.readyState >= 1) {
    return;
  }

  mongoose
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(console.log('MongoDB Connected'.cyan.underline))
    .catch((err) => console.error(`Error: ${err.message}`.red.underline.bold));
};

export default dbConnect;
