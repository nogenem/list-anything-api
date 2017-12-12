import express from "express";
import mongoose from "mongoose";

import authenticate from "../middlewares/authenticate";
import Subject from "../models/Subject";
import SubjectData from "../models/SubjectData";
import parseErrors from "../utils/parseErrors";

const router = express.Router();
router.use(authenticate);

router.get("/", (req, res) => {
  if (req.query._id) {
    Subject.find(
      {
        userId: req.currentUser._id,
        _id: req.query._id
      },
      {
        description: true,
        tabs: true,
        fields: true
      }
    )
      .limit(1)
      .then(resp => res.json({ subject: resp[0] }));
  } else {
    Subject.find(
      { userId: req.currentUser._id },
      { _id: true, description: true }
    ).then(subjects => res.json({ subjects }));
  }
});

router.post("/", (req, res) => {
  Subject.create({ ...req.body.subject, userId: req.currentUser._id })
    .then(subject =>
      res.json({
        subject: { _id: subject._id, description: subject.description }
      })
    )
    .catch(err => res.status(400).json({ errors: parseErrors(err.errors) }));
});

router.delete("/", (req, res) => {
  if (req.query._id) {
    const _id = req.query._id;
    Subject.findByIdAndRemove(_id, { select: "tabs" })
      .then(subject => {
        const tabs = subject.tabs.map(tab => mongoose.Types.ObjectId(tab._id));
        SubjectData.deleteMany({ tabId: { $in: tabs } })
          .then(() => res.json({ result: true, _id }))
          .catch(() => res.json({ result: false, _id }));
      })
      .catch(() => res.json({ result: false, _id }));
  }
});

export default router;
