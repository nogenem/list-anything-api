import express from "express";
import authenticate from "../middlewares/authenticate";
import Subject from "../models/Subject";

const router = express.Router();
router.use(authenticate);

router.get("/", (req, res) => {
  Subject.find(
    { userId: req.currentUser._id },
    { _id: true, description: true }
  ).then(subjects => res.json({ subjects }));
});

export default router;
