import express from "express";
import path from "path";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Promise from "bluebird";
import compression from "compression";
import helmet from "helmet";

import auth from "./routes/auth";
import users from "./routes/users";
import subjects from "./routes/subjects";
import subjectData from "./routes/subjectData";

dotenv.config();
const app = express();

app.use(bodyParser.json());
mongoose.Promise = Promise;

let staticFiles = path.join(__dirname, "index.html");
if (process.env.MY_NODE_ENV === "production") {
  app.use(helmet());
  app.use(compression());

  staticFiles = express.static(path.join(__dirname, "../build-client/"));
  app.use(staticFiles);
}

mongoose.connect(process.env.MONGODB_URL, { useMongoClient: true });

app.use("/api/auth", auth);
app.use("/api/users", users);
app.use("/api/subjects", subjects);
app.use("/api/subjects/data", subjectData);

if (process.env.MY_NODE_ENV === "production") {
  app.use("/*", staticFiles);
} else {
  app.get("/*", (req, res) => {
    res.sendFile(staticFiles);
  });
}

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Running on port ${port}`));
