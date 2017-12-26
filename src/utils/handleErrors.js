import parseErrors from "./parseErrors";

const isMongooseObjectIdError = err =>
  (err.name === "CastError" && err.kind === "ObjectId") ||
  err.message ===
    "Argument passed in must be a single String of 12 bytes or a string of 24 hex characters";

export default (err, res) => {
  if (err.kind === "CustomError") {
    res.status(err.status).json({ errors: err.msgObj });
  } else if (isMongooseObjectIdError(err)) {
    // Erro de cast de object id lançado pelo mongoose
    res.status(400).json({ errors: { global: "Invalid id" } });
  } else if (err.errors) {
    // Erros vindos do mongoose e referentes a campos de alguma collection
    res.status(400).json({ errors: parseErrors(err.errors) });
  } else {
    console.error(err);
    res.status(500).json({});
  }
};
