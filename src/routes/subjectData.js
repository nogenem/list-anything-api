import express from "express";
import mongoose from "mongoose";
import forEach from "lodash.foreach";
import escapeRegex from "escape-string-regexp";

import authenticate from "../middlewares/authenticate";
import SubjectData from "../models/SubjectData";
import Subject from "../models/Subject";

import handleErrors from "../utils/handleErrors";
import {
  reshapeSearchResult,
  reshapeEditData,
  checkDuplicatedValues
} from "../utils/subjectDataRouteUtils";
import { invalidIdError, invalidRequestError } from "../utils/errors";

const router = express.Router();
router.use(authenticate);

router.get("/", (req, res) => {
  if (req.query.tabId) {
    // findByTabId
    SubjectData.find({ tabId: req.query.tabId }, { data: true, tabId: true })
      .then(data => {
        if (data) res.json({ subjectData: data });
        else throw invalidIdError();
      })
      .catch(err => handleErrors(err, res));
  } else if (req.query._id) {
    // findById
    SubjectData.findById(req.query._id, { data: true, tabId: true })
      .then(data => {
        if (data) res.json({ subjectData: [data] });
        else throw invalidIdError();
      })
      .catch(err => handleErrors(err, res));
  } else if (req.query.query) {
    // findByQuery [restringido aos dados do usuário]
    Subject.find({ userId: req.currentUser._id }, { _id: true })
      .then(subjects => {
        if (!subjects) {
          res.json({ subjectData: [] });
          return null;
        }

        const ids = subjects.map(subject => subject._id);
        return SubjectData.find(
          {
            subjectId: { $in: ids },
            "data.value": {
              $regex: escapeRegex(req.query.query),
              $options: "i"
            }
          },
          { "data.$": true, tabId: true }
        ).populate("subjectId", "description tabs fields");
      })
      .then(data => {
        if (data) res.json({ subjectData: reshapeSearchResult(data) });
      })
      .catch(err => handleErrors(err, res));
  } else {
    handleErrors(invalidRequestError(), res);
  }
});

const createSubjectData = (data, res) =>
  SubjectData.create(data).then(subjectData =>
    res.json({
      subjectData: {
        _id: subjectData._id,
        tabId: subjectData.tabId,
        data: subjectData.data
      }
    })
  );

router.post("/", (req, res) => {
  const subjData = { ...req.body };
  checkDuplicatedValues(subjData, res, createSubjectData);
});

const editSubjectData = (subjData, res) => {
  const ObjectId = mongoose.Types.ObjectId;
  const values = subjData.data;

  if (!values.length) {
    handleErrors(invalidRequestError(), res);
    return;
  }

  const updates = [];
  try {
    updates.push({
      updateOne: {
        filter: { _id: ObjectId(subjData._id) },
        update: { tabId: subjData.tabId }
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
  } catch (err) {
    handleErrors(err, res);
    return;
  }
  SubjectData.bulkWrite(updates)
    .then(() =>
      SubjectData.find({ _id: subjData._id }, { data: true, tabId: true })
    )
    .then(data => res.json({ subjectData: data }))
    .catch(err => handleErrors(err, res));
};

router.put("/", (req, res) => {
  const subjData = reshapeEditData(req.body);
  checkDuplicatedValues(subjData, res, editSubjectData);
});

router.delete("/", (req, res) => {
  if (req.query._id) {
    const _id = req.query._id;
    SubjectData.deleteOne({ _id })
      .then(val => {
        if (val) res.json({ _id });
        else throw invalidIdError();
      })
      .catch(err => handleErrors(err, res));
  } else {
    handleErrors(invalidRequestError(), res);
  }
});

export default router;
