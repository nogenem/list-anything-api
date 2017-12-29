import express from "express";

import User from "../models/User";
import { sendConfirmationEmail } from "../mailer";

import handleErrors from "../utils/handleErrors";
import getHostName from "../utils/getHostName";

const router = express.Router();

router.post("/", (req, res) => {
  const { email, password } = req.body.user;
  const host = getHostName(req.headers);
  const user = new User({ email });

  user.setPassword(password);
  user.setConfirmationToken();
  user
    .save()
    .then(userRecord => {
      sendConfirmationEmail(userRecord, host);
      res.json({ user: userRecord.toAuthJSON() });
    })
    .catch(err => handleErrors(err, res));
});

export default router;
