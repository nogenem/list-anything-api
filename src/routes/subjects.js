import express from "express";
import mongoose from "mongoose";

import authenticate from "../middlewares/authenticate";
import Subject from "../models/Subject";
import SubjectData from "../models/SubjectData";

import handleErrors from "../utils/handleErrors";
import {
  invalidIdError,
  duplicatedValuesError,
  invalidRequestError
} from "../utils/errors";

const router = express.Router();
router.use(authenticate);

router.get("/", (req, res) => {
  if (req.query._id) {
    // findById
    Subject.findById(req.query._id, {
      description: true,
      tabs: true,
      fields: true
    })
      .then(subject => {
        if (subject) res.json({ subject });
        else throw invalidIdError();
      })
      .catch(err => handleErrors(err, res));
  } else if (req.query.tabId) {
    // findByTabId
    Subject.findOne(
      { "tabs._id": req.query.tabId },
      {
        description: true,
        tabs: true,
        fields: true
      }
    )
      .then(subject => {
        if (subject) res.json({ subject });
        else throw invalidIdError();
      })
      .catch(err => handleErrors(err, res));
  } else {
    // findByUserId
    Subject.find(
      { userId: req.currentUser._id },
      { _id: true, description: true }
    )
      .then(subjects => res.json({ subjects }))
      .catch(err => handleErrors(err, res));
  }
});

router.post("/", (req, res) => {
  Subject.findOne({
    userId: req.currentUser._id,
    description: req.body.subject.description
  })
    .then(data => {
      if (data) throw duplicatedValuesError(["description"]);
      else {
        return Subject.create({
          ...req.body.subject,
          userId: req.currentUser._id
        });
      }
    })
    .then(subject =>
      res.json({
        subject: { _id: subject._id, description: subject.description }
      })
    )
    .catch(err => handleErrors(err, res));
});

router.delete("/", (req, res) => {
  if (req.query._id) {
    const _id = req.query._id;
    Subject.findByIdAndRemove(_id, { select: "tabs" })
      .then(subject => {
        if (!subject) throw invalidIdError();
        else {
          const tabs = subject.tabs.map(tab =>
            mongoose.Types.ObjectId(tab._id)
          );
          return SubjectData.deleteMany({ tabId: { $in: tabs } });
        }
      })
      .then(() => res.json({ _id }))
      .catch(err => handleErrors(err, res));
  } else {
    handleErrors(invalidRequestError(), res);
  }
});

export default router;
