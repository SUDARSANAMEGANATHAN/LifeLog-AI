export interface ChunkMetadata {
  id: string;
  userId: string;
  sourceType: "pdf" | "image" | "text" | "chat" | "audio";
  fileName?: string;
  createdAt: string;
  tags?: string[];
  timeContext?: string; // e.g. "2024-03", "college-first-year"
  eventType?: string; // e.g. "health", "travel", "finance"
}

export interface Chunk {
  id: string;
  text: string;
  metadata: ChunkMetadata;
}

export interface LifeEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  type: "health" | "travel" | "finance" | "education" | "project" | "other";
  chunkIds: string[];
}
