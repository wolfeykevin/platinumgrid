import express, { json } from "express";
import cors from "cors";
import {
  entryRoutes,
  fieldRoutes,
  sheetRoutes,
  userRoutes,
} from "../routes/index.js";
import decodedToken from "../middleware/decodeToken.js"

const server = express();
//
var opts = {
  origin: "*",
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
  credentials: true,
};


server.use(cors(opts));
server.use(json());
server.use(decodedToken)
server.use("/api/", entryRoutes);
server.use("/api/", fieldRoutes);
server.use("/api/", sheetRoutes);
server.use("/api/", userRoutes);


export default server;
