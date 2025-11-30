"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const eventsService_1 = require("../services/eventsService");
const router = (0, express_1.Router)();
const DEMO_USER_ID = "demo-user";
router.get("/", async (req, res) => {
    try {
        const events = await (0, eventsService_1.getLifeEvents)(DEMO_USER_ID);
        res.json({ events });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch events" });
    }
});
exports.default = router;
