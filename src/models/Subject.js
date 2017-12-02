import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

const Tabs = new mongoose.Schema({
  description: { type: String, required: true } // Unique para um mesmo Subject!
});

const Fields = new mongoose.Schema({
  description: { type: String, required: true }, // Unique para um mesmo Subject!
  is_unique: { type: Boolean, default: false },
  show_in_list: { type: Boolean, default: false },
  field_type: { type: String, required: true }
});

const Subjects = new mongoose.Schema(
  {
    description: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    tabs: [Tabs],
    fields: [Fields]
  },
  { timestamps: true }
);

const customErrorMsg = {
  // TODO: remover isso e tratar na Interface!!
  message: "Error, expected {PATH} to be unique."
};
Subjects.plugin(uniqueValidator, customErrorMsg);

export default mongoose.model("Subject", Subjects);
