import { Router } from "express";
import { getLifeEvents } from "../services/eventsService";

const router = Router();
const DEMO_USER_ID = "demo-user";

router.get("/", async (req, res) => {
  try {
    const events = await getLifeEvents(DEMO_USER_ID);
    res.json({ events });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

export default router;
