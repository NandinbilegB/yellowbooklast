# Lab 8 - AI Search with Embeddings & Redis Caching

## 📋 Overview

Lab 8 implements an intelligent search system for Yellow Books using:
- **OpenAI Embeddings** - Convert text to semantic vectors
- **Vector Search** - Find similar businesses using cosine similarity
- **Redis Caching** - Cache AI responses for performance
- **React UI** - Chat-like assistant interface

## ✨ Features

### 1. Embedding System
- Add `embedding: Float[]` field to Business model
- Offline script to embed all existing businesses
- Support for both OpenAI and local (Ollama) models

### 2. AI Search Endpoint
```
POST /api/ai/yellow-books/search
```
- Semantic search using embeddings
- Redis cache with 1-hour TTL
- Sorted by cosine similarity score

### 3. Assistant UI Page
```
GET /yellow-books/assistant
```
- Real-time chat interface
- Cache hit/miss statistics
- Markdown support for responses
- Responsive design with Tailwind CSS

### 4. Cache Management
```
DELETE /api/ai/yellow-books/cache
```
- Clear specific query cache
- Clear all cache at once
- Manual invalidation support

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│         React UI (/assistant)               │
│  - Chat interface                           │
│  - Real-time search                         │
│  - Cache stats display                      │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│    POST /api/ai/yellow-books/search         │
│  - Query validation                         │
│  - Embedding generation                     │
│  - Cache lookup/store                       │
└────────────────┬────────────────────────────┘
                 │
     ┌───────────┼───────────┐
     ▼           ▼           ▼
  ┌──────┐   ┌─────────┐  ┌──────────┐
  │Redis │   │OpenAI   │  │PostgreSQL│
  │Cache │   │API      │  │Embeddings│
  └──────┘   └─────────┘  └──────────┘
```

## 📦 Files Created

### Backend
- `apps/api/prisma/schema.prisma` - Updated with embedding fields
- `apps/api/prisma/scripts/embed-businesses.ts` - Embedding script
- `apps/api/src/app/services/ai-search.service.ts` - Search logic
- `apps/api/src/app/services/redis.service.ts` - Redis client
- `apps/api/src/app/routes/ai-search.controller.ts` - API endpoint
- `apps/api/src/app/modules/ai-search.module.ts` - NestJS module

### Frontend
- `apps/web/src/app/yellow-books/assistant/page.tsx` - UI page

### Configuration
- `docker-compose.yml` - Added Redis service
- `LAB8_SETUP.md` - Setup guide
- `LAB8_README.md` - This file

### Testing
- `apps/api/src/app/services/ai-search.service.spec.ts` - Unit tests

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
```bash
# .env файл үүсгэнэ
echo 'OPENAI_API_KEY=sk-xxx' > apps/api/.env
echo 'REDIS_HOST=localhost' >> apps/api/.env
echo 'REDIS_PORT=6379' >> apps/api/.env
```

### 3. Start Services
```bash
# Docker-compose ашиглан
docker-compose up -d

# Эсвэл manual start
redis-server &
npm run dev
```

### 4. Run Embedding
```bash
# Offline embedding эхлүүлэх
npx ts-node apps/api/prisma/scripts/embed-businesses.ts
```

### 5. Test API
```bash
curl -X POST http://localhost:3001/api/ai/yellow-books/search \
  -H "Content-Type: application/json" \
  -d '{"query":"Сайн үнэтэй ресторан","limit":5}'
```

### 6. Open UI
```
http://localhost:3000/yellow-books/assistant
```

## 📊 Data Flow

### Embedding Process

```
┌─────────────────────────────────┐
│  Offline: embed-businesses.ts   │
├─────────────────────────────────┤
│ 1. Read all businesses from DB  │
│ 2. Combine text fields          │
│ 3. Send to OpenAI               │
│ 4. Store embedding in DB        │
│ 5. Set embeddedAt timestamp     │
└─────────────────────────────────┘
         ▼
    ┌─────────────────────────────┐
    │   PostgreSQL Database       │
    │   YellowBookEntry           │
    │   ├─ id                     │
    │   ├─ name                   │
    │   ├─ embedding: float[]     │
    │   └─ embeddedAt: timestamp  │
    └─────────────────────────────┘
```

### Search Process

```
┌─────────────────────────────────┐
│  User Query: "Сайн ресторан"    │
└──────────────┬──────────────────┘
               ▼
    ┌─────────────────────────────┐
    │ 1. Check Redis Cache        │
    │    Key: ai-search:query     │
    └──────────────┬──────────────┘
         HIT ✅     │     MISS ❌
           │        ▼
           │   ┌─────────────────────┐
           │   │ 2. Generate Query   │
           │   │    Embedding        │
           │   │    (OpenAI)         │
           │   └──────────────┬──────┘
           │                  ▼
           │   ┌─────────────────────┐
           │   │ 3. Calculate        │
           │   │    Cosine Similarity│
           │   │    with all entries │
           │   └──────────────┬──────┘
           │                  ▼
           │   ┌─────────────────────┐
           │   │ 4. Sort by Score    │
           │   │    Top 5 results    │
           │   └──────────────┬──────┘
           │                  ▼
           │   ┌─────────────────────┐
           │   │ 5. Cache in Redis   │
           │   │    TTL: 3600s       │
           │   └──────────────┬──────┘
           │                  │
           └──────────┬───────┘
                      ▼
         ┌─────────────────────────────┐
         │ Return Results              │
         │ ├─ id                       │
         │ ├─ name                     │
         │ ├─ summary                  │
         │ ├─ similarity (0.0-1.0)    │
         │ └─ distance (ranking)       │
         └─────────────────────────────┘
```

## 🧪 Testing

### Unit Tests
```bash
npm run test -- ai-search.service.spec.ts
```

### Integration Tests
```bash
# API endpoint test
npm run test:e2e
```

### Manual Testing
```bash
# Test embedding
curl -X POST http://localhost:3001/api/ai/yellow-books/search \
  -H "Content-Type: application/json" \
  -d '{"query":"ресторан","limit":3,"useCache":false}'

# Clear cache
curl -X DELETE http://localhost:3001/api/ai/yellow-books/cache

# Cache specific query
curl -X DELETE http://localhost:3001/api/ai/yellow-books/cache?query=ресторан
```

## ⚡ Performance Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| Embedding API | 20-50ms | Per request |
| Cache Hit | <5ms | Redis lookup |
| Cosine Similarity | O(n) | Linear with entries |
| Cache TTL | 1 hour | Configurable |
| Max Query Length | 500 chars | Validation |

## 🔍 Troubleshooting

### Issue: "ECONNREFUSED 127.0.0.1:6379"
```
Solution: Start Redis server
redis-server
# or
docker-compose up redis
```

### Issue: "401 Unauthorized" from OpenAI
```
Solution: Check OPENAI_API_KEY
echo $OPENAI_API_KEY
# Update .env with valid key
```

### Issue: "Query embedding timeout"
```
Solution: OpenAI rate limit (3 req/min)
- Script waits 20s between requests
- This is normal behavior
- Embedding completes when timeout passes
```

### Issue: "PostgreSQL connection refused"
```
Solution: Start PostgreSQL
docker-compose up db
# or
postgres -D /usr/local/var/postgres
```

## 📈 Scaling Considerations

1. **Large Datasets (10k+ entries)**
   - Use pgvector extension for fast similarity search
   - Add indexing: `CREATE INDEX ON entries USING ivfflat (embedding)`
   - Consider batch processing

2. **High Traffic**
   - Redis Cluster for distributed caching
   - Connection pooling
   - Rate limiting on API

3. **Cost Optimization**
   - Cache longer (TTL = 24h)
   - Batch embed requests
   - Use text-embedding-3-small (cheaper)

## 🔐 Security

- Validate query length (max 500 chars)
- Rate limit API requests
- Use environment variables for API keys
- CORS policy for web requests
- Input sanitization

## 📚 Resources

- [OpenAI Embeddings API](https://platform.openai.com/docs/guides/embeddings)
- [Redis Documentation](https://redis.io/docs/)
- [Prisma Vector Support](https://www.prisma.io/docs/orm/prisma-client/special-use-cases/full-text-search)
- [Cosine Similarity](https://en.wikipedia.org/wiki/Cosine_similarity)

## ✅ Verification Checklist

- [ ] Embedding field added to Prisma schema
- [ ] Migration created and applied
- [ ] Embedding script runs without errors
- [ ] All businesses have embeddings
- [ ] Redis service running
- [ ] POST /api/ai/yellow-books/search works
- [ ] Cache system functioning
- [ ] UI page loads correctly
- [ ] Chat interface responds
- [ ] Tests passing

## 🎯 Expected Results

### API Response Example
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Green Restaurant",
    "summary": "Thai cuisine with organic ingredients",
    "similarity": 0.92,
    "distance": 0
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Cafe Corner",
    "summary": "Coffee shop with pastries",
    "similarity": 0.78,
    "distance": 1
  }
]
```

### UI Features
- Chat-like conversation interface
- Real-time search results
- Cache statistics (hits/misses)
- Markdown rendering for responses
- Responsive mobile design

## 🎉 Completion

Lab 8 is complete when:
1. ✅ Embedding field in database
2. ✅ All businesses embedded offline
3. ✅ Search endpoint responding correctly
4. ✅ Redis cache operational
5. ✅ UI page displaying results
6. ✅ Tests passing
7. ✅ Documentation complete

---

**Total Points: 100**
- Embeddings: 20 pts
- Search Endpoint: 25 pts
- Redis Caching: 20 pts
- UI Page: 25 pts
- Documentation: 10 pts

**Status:** 🚀 Ready for deployment!
