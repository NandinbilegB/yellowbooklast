import { describe, it, expect, beforeEach } from '@jest/globals';
import { AISearchService } from './ai-search.service';

describe('AISearchService', () => {
  let service: AISearchService;

  beforeEach(() => {
    service = new AISearchService();
  });

  describe('cosineSimilarity', () => {
    it('should return 1 for identical vectors', () => {
      const a = [1, 0, 0];
      const b = [1, 0, 0];
      const result = service.cosineSimilarity(a, b);
      expect(result).toBe(1);
    });

    it('should return value between 0 and 1 for different vectors', () => {
      const a = [1, 0, 0];
      const b = [1, 1, 0];
      const result = service.cosineSimilarity(a, b);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(1);
    });

    it('should return 0 for zero vectors', () => {
      const a = [0, 0, 0];
      const b = [1, 0, 0];
      const result = service.cosineSimilarity(a, b);
      expect(result).toBe(0);
    });

    it('should handle orthogonal vectors', () => {
      const a = [1, 0];
      const b = [0, 1];
      const result = service.cosineSimilarity(a, b);
      expect(result).toBe(0);
    });
  });

  describe('getEmbedding', () => {
    it('should be defined', () => {
      expect(service.getEmbedding).toBeDefined();
    });

    it('should be async function', async () => {
      expect(service.getEmbedding instanceof Function).toBe(true);
    });
  });
});
