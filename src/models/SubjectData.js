import mongoose from "mongoose";

const Data = new mongoose.Schema({
  value: { type: String },
  fieldId: { type: mongoose.Schema.Types.ObjectId, required: true } // FK
});
Data.index({ value: 1 }, { sparse: true });

const SubjectData = new mongoose.Schema(
  {
    tabId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    }, // FK
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Subject"
    }, // FK
    data: [Data]
  },
  { timestamps: true }
);

export default mongoose.model("SubjectData", SubjectData);
