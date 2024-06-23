import { config } from "./config/config.js";
import { app } from "./app.js";
import connectDB from "./config/connectDB.js";

connectDB()
  .then(() => {
    app.listen(config.port, () => {
      console.log(`Server is running on port: ${config.port}`);
    });
  })
  .catch((err) => {
    console.error("MONGO db connection failed !!! ", err);
  });
