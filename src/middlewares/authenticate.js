import jwt from "jsonwebtoken";
import User from "../models/User";

import { invalidTokenError, noTokenError } from "../utils/errors";
import handleErrors from "../utils/handleErrors";

export default (req, res, next) => {
  const header = req.headers.authorization;
  let token;

  if (header) token = header.split(" ")[1];

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        handleErrors(invalidTokenError(), res);
      } else {
        User.findOne({ email: decoded.email }).then(user => {
          if (!user) {
            handleErrors(invalidTokenError(), res);
            req.currentUser = null;
            return;
          }
          req.currentUser = user;
          next();
        });
      }
    });
  } else {
    handleErrors(noTokenError(), res);
  }
};
