import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

const Tabs = new mongoose.Schema({
  tab: { type: String, required: true, unique: true }
});

const Fields = new mongoose.Schema({
  description: { type: String, required: true, unique: true },
  is_unique: { type: Boolean, default: false },
  show_in_list: { type: Boolean, default: false },
  field_type: { type: String, required: true }
});

const Subjects = new mongoose.Schema({
  description: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  tabs: [Tabs],
  fields: [Fields]
});

const customErrorMsg = {
  message: "Error, expected {PATH} to be unique."
};
Tabs.plugin(uniqueValidator, customErrorMsg);
Fields.plugin(uniqueValidator, customErrorMsg);
Subjects.plugin(uniqueValidator, customErrorMsg);

export default mongoose.model("Subject", Subjects);
