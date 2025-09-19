import express from "express";
import { globalSearch } from "../controllers/globalSearchController.js";

const router = express.Router();
// GET /api/v1/global-search
router.get("/", globalSearch);

export default router;
