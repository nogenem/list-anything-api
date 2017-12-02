import express from "express";

import authenticate from "../middlewares/authenticate";
import Subject from "../models/Subject";
import parseErrors from "../utils/parseErrors";

const router = express.Router();
router.use(authenticate);

router.get("/", (req, res) => {
  Subject.find(
    { userId: req.currentUser._id },
    { _id: true, description: true }
  ).then(subjects => res.json({ subjects }));
});

router.post("/", (req, res) => {
  Subject.create({ ...req.body.subject, userId: req.currentUser._id })
    .then(subject => res.json({ subject }))
    .catch(err => res.status(400).json({ errors: parseErrors(err.errors) }));
});

export default router;
