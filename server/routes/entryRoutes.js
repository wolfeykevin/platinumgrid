import express from "express";
const router = express.Router();

import { addEntry, edit, archive, addMany } from "../controllers/entryController.js";

router.route("/edit_entry/:entry_id").patch(edit);

router.route("/add_entry/:sheet_id").post(addEntry);

router.route("/add_many_entries/:sheet_id").post(addMany);

router.route('/archive_entry/:entry_id').patch(archive)

export default router;
