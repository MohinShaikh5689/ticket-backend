import { prisma } from '../../lib/prisma.js';
import { NotFoundError } from '../../utils/errors.js';
import type { TicketPriority, Sentiment } from '@prisma/client';
import type { EditInsightInput } from './ai.schema.js';
import { env } from '../../config/env.js';
import { GoogleGenAI } from '@google/genai';

const aiClient = env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: env.GEMINI_API_KEY })
  : null;

export class AIService {
  async generateInsight(ticketId: string) {
    // Get ticket with comments for full context
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        comments: { select: { content: true } },
      },
    });

    if (!ticket) {
      throw new NotFoundError('Ticket', ticketId);
    }

    // Mark existing insights as stale
    await prisma.aIInsight.updateMany({
      where: { ticketId, isStale: false },
      data: { isStale: true },
    });

    // Get current max version
    const latestInsight = await prisma.aIInsight.findFirst({
      where: { ticketId },
      orderBy: { version: 'desc' },
      select: { version: true },
    });

    const newVersion = (latestInsight?.version ?? 0) + 1;

    let insightResult: {
      summary: string;
      suggestedPriority: TicketPriority;
      sentiment: Sentiment;
      nextAction: string;
      confidenceScore: number;
    };

    if (aiClient) {
      try {
        const prompt = `You are an AI support ticket analyzer. Analyze the following ticket title, description, and comments, then return structured insights:
Ticket Title: ${ticket.title}
Ticket Description: ${ticket.description}
Comments:
${ticket.comments.map(c => `- ${c.content}`).join('\n')}`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'OBJECT',
              properties: {
                summary: { type: 'STRING', description: 'A concise summary of the issue, max 2 sentences.' },
                suggestedPriority: {
                  type: 'STRING',
                  enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
                  description: 'The priority level the ticket should have.'
                },
                sentiment: {
                  type: 'STRING',
                  enum: ['POSITIVE', 'NEUTRAL', 'FRUSTRATED', 'ANGRY'],
                  description: 'The customer sentiment.'
                },
                nextAction: { type: 'STRING', description: 'The recommended next step for the support agent.' },
                confidenceScore: { type: 'NUMBER', description: 'Confidence score from 0.0 to 1.0.' }
              },
              required: ['summary', 'suggestedPriority', 'sentiment', 'nextAction', 'confidenceScore']
            }
          }
        });

        const text = response.text;
        if (!text) throw new Error('Empty response from Gemini API');

        const parsed = JSON.parse(text);
        insightResult = {
          summary: parsed.summary || ticket.description.slice(0, 150) + '...',
          suggestedPriority: (parsed.suggestedPriority || ticket.priority) as TicketPriority,
          sentiment: (parsed.sentiment || 'NEUTRAL') as Sentiment,
          nextAction: parsed.nextAction || 'Review ticket details.',
          confidenceScore: Number(parsed.confidenceScore) || 0.8,
        };
      } catch (err) {
        console.warn('⚠️ Gemini insight generation failed, using static fallback:', err);
        insightResult = {
          summary: ticket.description.slice(0, 150) + '...',
          suggestedPriority: ticket.priority,
          sentiment: 'NEUTRAL',
          nextAction: 'Review ticket details manually.',
          confidenceScore: 0.5,
        };
      }
    } else {
      console.log('ℹ️ GEMINI_API_KEY is not defined, using static fallback.');
      insightResult = {
        summary: ticket.description.slice(0, 150) + '...',
        suggestedPriority: ticket.priority,
        sentiment: 'NEUTRAL',
        nextAction: 'Review ticket details manually.',
        confidenceScore: 0.5,
      };
    }

    // Generate new insight
    const insight = await prisma.aIInsight.create({
      data: {
        ticketId,
        summary: insightResult.summary,
        suggestedPriority: insightResult.suggestedPriority,
        sentiment: insightResult.sentiment,
        nextAction: insightResult.nextAction,
        confidenceScore: insightResult.confidenceScore,
        version: newVersion,
      },
    });

    return {
      ...insight,
      lowConfidence: insight.confidenceScore < 0.5,
    };
  }

  async getLatestInsight(ticketId: string) {
    // Verify ticket exists
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      throw new NotFoundError('Ticket', ticketId);
    }

    const insight = await prisma.aIInsight.findFirst({
      where: { ticketId, isStale: false },
      orderBy: { version: 'desc' },
      include: {
        editedByAgent: { select: { id: true, name: true } },
      },
    });

    if (!insight) {
      return null;
    }

    return {
      ...insight,
      lowConfidence: insight.confidenceScore < 0.5,
    };
  }

  async editInsight(insightId: string, agentId: string, data: EditInsightInput) {
    const insight = await prisma.aIInsight.findUnique({
      where: { id: insightId },
    });

    if (!insight) {
      throw new NotFoundError('AIInsight', insightId);
    }

    return prisma.aIInsight.update({
      where: { id: insightId },
      data: {
        isEdited: true,
        editedSummary: data.editedSummary,
        editedByAgentId: agentId,
        editedAt: new Date(),
      },
      include: {
        editedByAgent: { select: { id: true, name: true } },
      },
    });
  }
}

export const aiService = new AIService();
