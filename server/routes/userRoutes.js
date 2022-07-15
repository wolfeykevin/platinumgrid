import express from "express";
const router = express.Router();

import { myAuth, addUser, getAllSheetUsers, requestAllUsers, editUserRoles, removeUserRoles, getUserId, addUserRole } from "../controllers/userController.js";

router.route("/add_user").post(addUser);

router.route("/get_user_id").get(getUserId);

router.route("/get_all_users").get(requestAllUsers);

router.route("/get_sheet_users/:sheet_id").get(getAllSheetUsers)

router.route("/edit_user_roles/:sheet_id").patch(editUserRoles)

router.route("/remove_roles/:sheet_id").delete(removeUserRoles)

router.route("/add_user_roles/:sheet_id").post(addUserRole);

router.route("/authCheck/:sheet_id").get(myAuth)

export default router;
