import express from "express";
import path from "path";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Promise from "bluebird";

import auth from "./routes/auth";
import users from "./routes/users";
import subjects from "./routes/subjects";
import subjectData from "./routes/subjectData";

dotenv.config();
const app = express();
app.use(bodyParser.json());
mongoose.Promise = Promise;
mongoose.connect(process.env.MONGODB_URL, { useMongoClient: true });

app.use("/api/auth", auth);
app.use("/api/users", users);
app.use("/api/subjects", subjects);
app.use("/api/subjects/data", subjectData);

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(8080, () => console.log("Running on localhost:8080"));
