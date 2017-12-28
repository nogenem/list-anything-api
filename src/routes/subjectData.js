import express from "express";
import mongoose from "mongoose";
import forEach from "lodash.foreach";
import escapeRegex from "escape-string-regexp";

import authenticate from "../middlewares/authenticate";
import SubjectData from "../models/SubjectData";
import Subject from "../models/Subject";

import handleErrors from "../utils/handleErrors";
import {
  invalidIdError,
  duplicatedValuesError,
  invalidRequestError
} from "../utils/errors";

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
  const data = { ...req.body };

  Subject.findById(data.subjectId, { fields: true })
    .then(subject => {
      if (!subject) throw invalidIdError();

      // Checagem por valores duplicados para fields que possuem
      // is_unique = true
      const fieldsUniqueIds = subject.fields
        .filter(field => field.is_unique)
        .map(field => String(field._id));
      const toCheck = [];

      forEach(data.data, value => {
        if (fieldsUniqueIds.includes(String(value.fieldId))) {
          toCheck.push(new RegExp(`^${value.value}$`, "i"));
        }
      });

      if (toCheck.length) {
        return SubjectData.find(
          { "data.value": { $in: toCheck } },
          { "data.$": true }
        ).then(result => {
          if (result.length)
            throw duplicatedValuesError([result[0].data[0].fieldId]);
          else return createSubjectData(data, res);
        });
      }
      return createSubjectData(data, res);
    })
    .catch(err => handleErrors(err, res));
});

// $currentDate: { lastModified: true } }
router.put("/", (req, res) => {
  const ObjectId = mongoose.Types.ObjectId;
  const values = Object.values(req.body.data);

  if (!values.length) {
    handleErrors(invalidRequestError(), res);
    return;
  }

  const updates = [];
  try {
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
  } catch (err) {
    handleErrors(err, res);
    return;
  }
  SubjectData.bulkWrite(updates)
    .then(() =>
      SubjectData.find({ _id: req.body._id }, { data: true, tabId: true })
    )
    .then(data => res.json({ subjectData: data }))
    .catch(err => handleErrors(err, res));
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
