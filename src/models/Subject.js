import mongoose from "mongoose";

const Tabs = new mongoose.Schema({
  description: { type: String, required: true }
});
Tabs.index({ _id: 1 });

const Fields = new mongoose.Schema({
  description: { type: String, required: true },
  is_unique: { type: Boolean, default: false },
  show_in_list: { type: Boolean, default: false },
  field_type: { type: String, required: true }
});

const Subjects = new mongoose.Schema(
  {
    description: { type: String, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },
    tabs: [Tabs],
    fields: [Fields]
  },
  { timestamps: true }
);

export default mongoose.model("Subject", Subjects);
