import express, { json } from "express";
import cors from "cors";
import {
  entryRoutes,
  fieldRoutes,
  sheetRoutes,
  userRoutes,
} from "../routes/index.js";
import {corsSetting, decodedToken } from "../middleware/index.js"

const server = express();

server.use(express.json({limit: '50mb'}));
server.use(express.urlencoded({limit: '50mb'}));
//Middleware
server.use(cors(corsSetting));
server.use(json());
server.use(decodedToken)
// Routes Paths
server.use("/api/", entryRoutes);
server.use("/api/", fieldRoutes);
server.use("/api/", sheetRoutes);
server.use("/api/", userRoutes);

export default server;