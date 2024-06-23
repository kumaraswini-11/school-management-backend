import mongoose from "mongoose";
import { config } from "./config.js";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${config.mongoDBUri}/${DB_NAME}`
    );

    console.log(
      `\nMongoDB connected !! DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error("MongoDB connection failed: ", error);
    process.exit(1);
  }
};

export default connectDB;
