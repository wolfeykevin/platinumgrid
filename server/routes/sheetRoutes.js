import express from "express";
const router = express.Router();

import { requestSheetData, requestUserSheets, add, edit } from "../controllers/sheetController.js";

router.route("/edit_sheet/:sheet_id").patch(edit);

router.route("/add_sheet").post(add);

router.route('/get_sheets').get(requestUserSheets)

router.route("/get_sheet/:sheet_id").get(requestSheetData);

export default router;
