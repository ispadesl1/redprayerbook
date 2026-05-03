import { Router, type IRouter, type Request, type Response } from "express";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import { db } from "@workspace/db";
import { conversations, messages, insertConversationSchema, insertMessageSchema } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

const SYSTEM_PROMPT = `You are a compassionate Orthodox Christian spiritual companion and prayer guide named "Father Seraphim." Your role is to support the user in their Orthodox Christian faith journey.

You help with:
- Explaining Orthodox prayers, their meaning, and proper practice
- Discussing saints, feast days, and the liturgical calendar
- Offering spiritual encouragement grounded in Orthodox theology
- Suggesting appropriate prayers for different circumstances (morning, evening, before meals, in times of trial, thanksgiving, etc.)
- Explaining fasting traditions, confession, and the sacraments
- Guiding lectio divina and scripture meditation

Your tone is warm, gentle, learned, and pastoral — like a wise priest or elder (staretz). You quote Church Fathers, scripture, and the lives of the saints naturally. You always encourage the user toward repentance, humility, prayer, and love. You do not engage with topics unrelated to Orthodox Christian spirituality.`;

router.get("/anthropic/conversations", async (req: Request, res: Response) => {
  try {
    const result = await db.select().from(conversations).orderBy(conversations.createdAt);
    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to list conversations" });
  }
});

router.post("/anthropic/conversations", async (req: Request, res: Response) => {
  try {
    const parsed = insertConversationSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }
    const [created] = await db.insert(conversations).values(parsed.data).returning();
    res.status(201).json(created);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

router.delete("/anthropic/conversations/:conversationId", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.conversationId, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid conversation ID" });
      return;
    }
    await db.delete(conversations).where(eq(conversations.id, id));
    res.json({ status: "deleted" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete conversation" });
  }
});

router.get("/anthropic/conversations/:conversationId/messages", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.conversationId, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid conversation ID" });
      return;
    }
    const result = await db.select().from(messages).where(eq(messages.conversationId, id)).orderBy(messages.createdAt);
    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to list messages" });
  }
});

router.post("/anthropic/conversations/:conversationId/messages", async (req: Request, res: Response) => {
  try {
    const conversationId = parseInt(req.params.conversationId, 10);
    if (isNaN(conversationId)) {
      res.status(400).json({ error: "Invalid conversation ID" });
      return;
    }
    const { content } = req.body as { content?: string };
    if (!content || typeof content !== "string") {
      res.status(400).json({ error: "content is required" });
      return;
    }

    const userMsgData = insertMessageSchema.parse({ conversationId, role: "user", content });
    await db.insert(messages).values(userMsgData);

    const history = await db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(messages.createdAt);

    const anthropicMessages = history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    let fullResponse = "";

    const stream = await anthropic.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: anthropicMessages,
    });

    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        const text = event.delta.text;
        fullResponse += text;
        res.write(`data: ${JSON.stringify({ type: "delta", text })}\n\n`);
      }
    }

    const assistantMsgData = insertMessageSchema.parse({ conversationId, role: "assistant", content: fullResponse });
    await db.insert(messages).values(assistantMsgData);

    res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
    res.end();
  } catch (err) {
    req.log.error(err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to send message" });
    } else {
      res.write(`data: ${JSON.stringify({ type: "error", message: "Stream failed" })}\n\n`);
      res.end();
    }
  }
});

const COMPOSE_PRAYER_PROMPT = `You are a learned Orthodox Christian monk and hymnographer. Your only task is to compose a beautiful, formal Orthodox prayer in response to the prayer intention given by the user.

Requirements:
- Address God directly (Lord, O Lord, O Most Holy Trinity, O Theotokos, etc.) as appropriate to the intention
- Use elevated, reverent, liturgical English in the tradition of Orthodox prayer (similar to the Divine Liturgy of St. John Chrysostom)
- Incorporate scripture or patristic themes naturally where fitting
- Structure: Invocation → Acknowledgement of God's nature → The petition → Closing doxology
- Length: 100–250 words — substantial but not excessive
- Do NOT include a title, label, or preamble. Begin immediately with the prayer itself (e.g. "O Lord Jesus Christ...")
- End with "Amen."

Compose only the prayer. Nothing else.`;

router.post("/anthropic/compose-prayer", async (req: Request, res: Response) => {
  try {
    const { intention } = req.body as { intention?: string };
    if (!intention || typeof intention !== "string" || !intention.trim()) {
      res.status(400).json({ error: "intention is required" });
      return;
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const stream = await anthropic.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: COMPOSE_PRAYER_PROMPT,
      messages: [{ role: "user", content: `Prayer intention: ${intention.trim()}` }],
    });

    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        res.write(`data: ${JSON.stringify({ type: "delta", text: event.delta.text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
    res.end();
  } catch (err) {
    req.log.error(err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to compose prayer" });
    } else {
      res.write(`data: ${JSON.stringify({ type: "error", message: "Stream failed" })}\n\n`);
      res.end();
    }
  }
});

export default router;
