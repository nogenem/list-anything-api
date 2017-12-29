import express from "express";
import jwt from "jsonwebtoken";

import User from "../models/User";

import { sendResetPasswordEmail } from "../mailer";
import handleErrors from "../utils/handleErrors";
import {
  invalidCredentialsError,
  noUserWithSuchEmailError,
  invalidTokenError
} from "../utils/errors";
import getHostName from "../utils/getHostName";

const router = express.Router();

router.post("/", (req, res) => {
  const { credentials } = req.body;
  User.findOne({ email: credentials.email }).then(user => {
    if (user && user.isValidPassword(credentials.password)) {
      res.json({ user: user.toAuthJSON() });
    } else {
      handleErrors(invalidCredentialsError(), res);
    }
  });
});

router.post("/confirmation", (req, res) => {
  const token = req.body.token;
  User.findOneAndUpdate(
    { confirmationToken: token },
    { confirmationToken: "", confirmed: true },
    { new: true }
  ).then(
    user =>
      user ? res.json({ user: user.toAuthJSON() }) : res.status(400).json({})
  );
});

router.post("/reset_password_request", (req, res) => {
  const host = getHostName(req.headers);

  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      sendResetPasswordEmail(user, host);
      res.json({});
    } else {
      handleErrors(noUserWithSuchEmailError(), res);
    }
  });
});

router.post("/validate_token", (req, res) => {
  jwt.verify(req.body.token, process.env.JWT_SECRET, err => {
    if (err) {
      res.status(401).json({});
    } else {
      res.json({});
    }
  });
});

router.post("/reset_password", (req, res) => {
  const { password, token } = req.body.data;
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      handleErrors(invalidTokenError(), res);
    } else {
      User.findOne({ _id: decoded._id }).then(user => {
        if (user) {
          user.setPassword(password);
          user.save().then(() => res.json({}));
        } else {
          handleErrors(invalidTokenError(), res);
        }
      });
    }
  });
});

export default router;
