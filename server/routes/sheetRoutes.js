import express from "express";
const router = express.Router();

import { requestSheetData, requestUserSheets, add, edit, addUserRole } from "../controllers/sheetController.js";

router.route("/edit_sheet/:sheet_id").patch(edit);

router.route("/add_sheet").post(add);

router.route("/add_user_roles/:sheet_id").post(addUserRole);

router.route('/get_sheets').get(requestUserSheets)

router.route("/get_sheet/:sheet_id").get(requestSheetData);

export default router;
