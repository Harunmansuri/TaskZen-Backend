import mongoose from "mongoose";


const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1); // stop app if DB connection fails
  }
};

export default connectDB;
/*

beginner methid 
import mongoose from "mongoose";

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("Connection Error:", err));


  production use
  import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("DB Connection Failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;

*/