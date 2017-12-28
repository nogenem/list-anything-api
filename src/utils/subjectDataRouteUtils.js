import forEach from "lodash.foreach";

import SubjectData from "../models/SubjectData";
import Subject from "../models/Subject";
import handleErrors from "./handleErrors";
import { invalidIdError, duplicatedValuesError } from "./errors";

export const reshapeSearchResult = data => {
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

export const reshapeEditData = data => {
  const newData = {
    ...data,
    data: []
  };

  forEach(Object.keys(data.data), fieldId => {
    newData.data.push({
      ...data.data[fieldId],
      fieldId
    });
  });

  return newData;
};

export const checkDuplicatedValues = (subjData, res, cb) => {
  Subject.findById(subjData.subjectId, { fields: true })
    .then(subject => {
      if (!subject) throw invalidIdError();

      // Checagem por valores duplicados para fields que possuem
      // is_unique = true
      const fieldsUniqueIds = subject.fields
        .filter(field => field.is_unique)
        .map(field => String(field._id));
      const toCheck = [];

      forEach(subjData.data, value => {
        if (fieldsUniqueIds.includes(String(value.fieldId))) {
          toCheck.push(new RegExp(`^${value.value}$`, "i"));
        }
      });

      if (toCheck.length) {
        // Caso seja uma operação de edit não se deve verificar
        // os dados do subjectData que esta sendo editado
        const idCheck = subjData._id
          ? { _id: { $ne: subjData._id || "" } }
          : {};
        return SubjectData.find(
          { ...idCheck, "data.value": { $in: toCheck } },
          { "data.$": true }
        ).then(result => {
          if (result.length)
            throw duplicatedValuesError([result[0].data[0].fieldId]);
          else return cb(subjData, res);
        });
      }
      return cb(subjData, res);
    })
    .catch(err => handleErrors(err, res));
};
