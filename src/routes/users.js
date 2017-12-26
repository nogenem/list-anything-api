import express from "express";

import User from "../models/User";
import { sendConfirmationEmail } from "../mailer";

import handleErrors from "../utils/handleErrors";

const router = express.Router();

router.post("/", (req, res) => {
  const { email, password } = req.body.user;
  const user = new User({ email });
  user.setPassword(password);
  user.setConfirmationToken();
  user
    .save()
    .then(userRecord => {
      sendConfirmationEmail(userRecord);
      res.json({ user: userRecord.toAuthJSON() });
    })
    .catch(err => handleErrors(err, res));
});

export default router;
