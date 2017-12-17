import express from "express";
import mongoose from "mongoose";
import forEach from "lodash.foreach";
import escapeRegex from "escape-string-regexp";

import authenticate from "../middlewares/authenticate";
import SubjectData from "../models/SubjectData";
import Subject from "../models/Subject";
import parseErrors from "../utils/parseErrors";

const router = express.Router();
router.use(authenticate);

const reshapeSearchResult = data => {
  const results = [];

  forEach(data, val => {
    const result = {
      _id: val._id,
      value: val.data[0].value,
      subject: val.subjectId.description
    };
    const tabData = val.subjectId.tabs.filter(
      tab => String(tab._id) === String(val.tabId)
    );
    result.tab = tabData[0].description;
    const fieldData = val.subjectId.fields.filter(
      field => String(field._id) === String(val.data[0].fieldId)
    );
    result.field = {
      description: fieldData[0].description,
      field_type: fieldData[0].field_type
    };
    results.push(result);
  });
  return results;
};

router.get("/", (req, res) => {
  if (req.query.tabId) {
    // findByTabId
    SubjectData.find(
      { tabId: req.query.tabId },
      { data: true, tabId: true }
    ).then(data => {
      if (data) res.json({ subjectData: data });
      else res.status(400).json({ errors: { global: "Invalid tab id" } });
    });
  } else if (req.query._id) {
    // findById
    SubjectData.findById(req.query._id, { data: true, tabId: true }).then(
      data => {
        if (data) res.json({ subjectData: [data] });
        else
          res
            .status(400)
            .json({ errors: { global: "Invalid subjectdata id" } });
      }
    );
  } else if (req.query.query) {
    // findByQuery [restringido aos dados do usuário]
    Subject.find({ userId: req.currentUser._id }, { _id: true }).then(
      subjects => {
        const ids = subjects.map(subject => subject._id);
        SubjectData.find(
          {
            subjectId: { $in: ids },
            "data.value": {
              $regex: escapeRegex(req.query.query),
              $options: "i"
            }
          },
          { "data.$": true, tabId: true }
        )
          .populate("subjectId", "description tabs fields")
          .then(data => {
            res.json({ subjectData: reshapeSearchResult(data) });
          });
      }
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
  updates.push({
    updateOne: {
      filter: { _id: ObjectId(req.body._id) },
      update: { tabId: req.body.tabId }
    }
  });
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
  } else {
    res.status(400).json({});
  }
});

export default router;
