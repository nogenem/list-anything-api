import forEach from "lodash.foreach";

export default function(errors) {
  const result = {};
  forEach(errors, (val, key) => {
    result[key] = val.message;
  });
  return result;
}
