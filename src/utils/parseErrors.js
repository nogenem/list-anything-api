import forEach from "lodash.foreach";

const patt = /fields\.\d+\.\w+/g;

export default function(errors) {
  const result = {};
  forEach(errors, (val, k) => {
    let key = k;
    if (patt.test(key)) key = key.substring(key.lastIndexOf(".") + 1);
    result[key] = val.message;
  });
  return result;
}
