import express from "express";
import cors from "cors";
import helmet from "helmet";
import router from "./routes/index.js";

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

// Default route for the root path
app.get("/", (req, res) => {
  res.status(200).send("API is working properly.");
});
app.use("/api", router);

export { app };
