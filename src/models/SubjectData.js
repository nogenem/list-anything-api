import mongoose from "mongoose";

const Data = new mongoose.Schema({
  value: { type: String, required: true },
  fieldId: { type: mongoose.Schema.Types.ObjectId, required: true } // FK
});

const SubjectData = new mongoose.Schema(
  {
    tabId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
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
