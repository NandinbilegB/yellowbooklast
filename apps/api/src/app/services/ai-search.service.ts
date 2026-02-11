import axios from 'axios';

export interface SearchResult {
  id: string;
  name: string;
  summary: string;
  distance: number;
  similarity: number;
}

export interface AISearchRequest {
  query: string;
  limit?: number;
  useCache?: boolean;
}

/**
 * AI Search Service - Semantic search using OpenAI embeddings
 * Note: This is a utility service. The actual route is implemented in routes/ai-search.ts
 */
export class AISearchService {
  private readonly OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  private readonly EMBEDDING_MODEL = 'text-embedding-3-small';

  async getEmbedding(text: string): Promise<number[]> {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/embeddings',
        {
          model: this.EMBEDDING_MODEL,
          input: text,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.data[0].embedding;
    } catch (error) {
      console.error('Embedding error:', error);
      throw error;
    }
  }

  cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));

    if (magnitudeA === 0 || magnitudeB === 0) return 0;
    return dotProduct / (magnitudeA * magnitudeB);
  }
}
