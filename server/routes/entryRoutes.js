import express from "express";
const router = express.Router();

import { addEntry, editEntry, archiveEntry, addManyEntry } from "../controllers/entryController.js";

router.route("/edit_entry/:entry_id").patch(editEntry);

router.route("/add_entry/:sheet_id").post(addEntry);

router.route("/add_many_entries/:sheet_id").post(addManyEntry);

router.route('/archive_entry/:entry_id').patch(archiveEntry)

export default router;
