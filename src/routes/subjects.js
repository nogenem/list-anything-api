import express from "express";

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

router.get("/data", (req, res) => {
  if (req.query.tabId) {
    SubjectData.find(
      { tabId: req.query.tabId },
      { data: true, tabId: true }
    ).then(data => res.json({ subjectData: data }));
  } else if (req.query._id) {
    SubjectData.find({ _id: req.query._id }, { data: true, tabId: true }).then(
      data => res.json({ subjectData: data })
    );
  } else {
    res.status(400).json({});
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

router.post("/data", (req, res) => {
  SubjectData.create({ ...req.body })
    .then(subjectData =>
      res.json({
        subjectData: {
          _id: subjectData._id,
          tabId: subjectData.tabId,
          data: subjectData.data
        }
      })
    )
    .catch(err => res.status(400).json({ errors: parseErrors(err.errors) }));
});

export default router;
