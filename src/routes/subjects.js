import express from "express";
import mongoose from "mongoose";
import forEach from "lodash.foreach";

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

router.delete("/", (req, res) => {
  if(req.query._id){
    const _id = mongoose.Types.ObjectId(req.query._id)
    Subject.deleteOne({ _id })
      .then(val => res.json({result: val.result.ok, _id}))
      .catch(() => res.json({result: false, _id}))
  }
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

// $currentDate: { lastModified: true } }
// http://mongoosejs.com/docs/api.html#model_Model.bulkWrite
router.put("/data", (req, res) => {
  const ObjectId = mongoose.Types.ObjectId;
  const values = Object.values(req.body.data);

  if(!values.length) {
    res.status(400).json({errors: {global: "Invalid data."}});
    return;
  }

  const updates = [];
  forEach(values, elem => {
    updates.push({
      updateOne: {
        filter: { "data._id": ObjectId(elem._id) },
        update: { "data.$.value": elem.value }
      }
    });
  });
  SubjectData.bulkWrite(updates).then(() =>
    SubjectData.find({ _id: req.body._id }, { data: true, tabId: true }).then(
      data => res.json({ subjectData: data })
    )
  );
});

router.delete("/data", (req, res) => {
  if(req.query._id){
    const _id = mongoose.Types.ObjectId(req.query._id)
    SubjectData.deleteOne({ _id })
      .then(val => res.json({result: val.result.ok}))
      .catch(() => res.json({result: false}))
  }
});

export default router;
