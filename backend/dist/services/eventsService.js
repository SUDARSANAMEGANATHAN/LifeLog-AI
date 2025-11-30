"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLifeEvents = getLifeEvents;
// In a real system you'd do clustering. For MVP, you can:
// - run a broad search with empty query or wildcard
// - group by eventType / timeContext / tags
async function getLifeEvents(userId) {
    // naive: search with random vector? Instead, you can store summary docs
    // For MVP, this can return a fake list or be based on metadata.
    return [
        {
            id: "event-1",
            title: "Internship Preparation Phase",
            description: "Notes, chats and resources about internships and DSA.",
            startDate: "2024-06-01",
            endDate: "2024-08-30",
            type: "education",
            chunkIds: [],
        },
    ];
}
