import express from "express";
import mongoose from "mongoose";
import forEach from "lodash.foreach";

import authenticate from "../middlewares/authenticate";
import SubjectData from "../models/SubjectData";
import parseErrors from "../utils/parseErrors";

const router = express.Router();
router.use(authenticate);

router.get("/", (req, res) => {
  if (req.query.tabId) {
    // findByTabId
    SubjectData.find(
      { tabId: req.query.tabId },
      { data: true, tabId: true }
    ).then(data => res.json({ subjectData: data }));
  } else if (req.query._id) {
    // findById
    SubjectData.findById(req.query._id, { data: true, tabId: true }).then(
      data => res.json({ subjectData: [data] })
    );
  } else {
    res.status(400).json({});
  }
});

router.post("/", (req, res) => {
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
router.put("/", (req, res) => {
  const ObjectId = mongoose.Types.ObjectId;
  const values = Object.values(req.body.data);

  if (!values.length) {
    res.status(400).json({ errors: { global: "Invalid data." } });
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

router.delete("/", (req, res) => {
  if (req.query._id) {
    const _id = mongoose.Types.ObjectId(req.query._id);
    SubjectData.deleteOne({ _id })
      .then(val => res.json({ result: val.result.ok }))
      .catch(() => res.json({ result: false }));
  }
});

export default router;
