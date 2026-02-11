# Lab 8 - AI Search & Embedding Configuration

## 🔧 Environment Variables Setup

### API (.env файл)

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/yellbook"

# Redis
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD=""

# OpenAI API (Embedding)
OPENAI_API_KEY="sk-..."

# API Server
API_PORT="3000"
NODE_ENV="development"
```

## 📦 Installation

### 1. Redis Setup

#### Option A: Docker
```bash
docker run -d -p 6379:6379 --name redis redis:7-alpine
```

#### Option B: Local Installation
```bash
# macOS
brew install redis

# Linux (Ubuntu)
sudo apt-get install redis-server

# Windows (WSL)
wsl -- sudo apt-get install redis-server
```

### 2. Dependencies Install
```bash
npm install
# or
yarn install
```

### 3. Database Migration
```bash
npm run prisma:migrate -- --name add_embedding_field
```

### 4. OpenAI API Key
- Get from: https://platform.openai.com/api-keys
- Set in `.env` file as `OPENAI_API_KEY`

## 🚀 Running Lab 8

### 1. Start Redis
```bash
redis-server
# or
docker start redis
```

### 2. Run Embedding Script
```bash
# Offline embedding эхлүүлэх
npx ts-node prisma/scripts/embed-businesses.ts
```

**Output:**
```
🚀 Businesses embedding эхлүүлээ...

📊 Embedding хэрэгтэй: 150 businesses

⏳ Processing: Restaurant XYZ...
✅ [1/150] Restaurant XYZ

(20 секунд хүлээх - OpenAI rate limit)

📈 Embedding дууссан:
   ✅ Completed: 150
   ❌ Failed: 0
```

### 3. Start API Server
```bash
npm run dev
# or
npm start
```

### 4. Test Search Endpoint

```bash
curl -X POST http://localhost:3000/api/ai/yellow-books/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Сайн үнэтэй ресторан",
    "limit": 5,
    "useCache": true
  }'
```

**Response:**
```json
[
  {
    "id": "uuid-1",
    "name": "Restaurant ABC",
    "summary": "Thai cuisine restaurant",
    "similarity": 0.87,
    "distance": 0
  },
  {
    "id": "uuid-2",
    "name": "Cafe XYZ",
    "summary": "Coffee and pastry shop",
    "similarity": 0.72,
    "distance": 1
  }
]
```

### 5. Open Assistant UI

```
http://localhost:3000/yellow-books/assistant
```

## 🛠️ Troubleshooting

### Redis Connection Error
```
Error: ECONNREFUSED 127.0.0.1:6379
```
**Solution:** Redis сервер ажиллаж байгаа эсэхийг шалгана
```bash
redis-cli ping
# PONG гаралаа = OK
```

### OpenAI API Error
```
Error: 401 Unauthorized
```
**Solution:** OPENAI_API_KEY эргэхгүй
```bash
# Check API key
echo $OPENAI_API_KEY

# Update .env file
OPENAI_API_KEY="sk-xxx"
```

### Embedding Script Timeout
```
Error: timeout after 30000ms
```
**Solution:** OpenAI rate limit (3 req/min)
```bash
# Скрипт 20 секунд хүлээнэ - энэ хэвийн
# Зогсоохгүй үргэлжүүлнэ
```

### Database Connection Error
```
Error: ECONNREFUSED 127.0.0.1:5432
```
**Solution:** PostgreSQL ажиллаж байгаа эсэхийг шалгана
```bash
psql -U postgres
```

## 📊 Performance Tips

1. **Embedding Cache**
   - Redis auto-cache бүх query-г 1 цаг хадгалдаг
   - Cache clear:
   ```bash
   curl -X DELETE http://localhost:3000/api/ai/yellow-books/cache
   ```

2. **Batch Embedding**
   - 1000+ businesses? → batch processing ашиглана
   ```bash
   # Эхлээд embedding скрипт бүрэн эхлүүлнэ
   npx ts-node prisma/scripts/embed-businesses.ts
   ```

3. **Vector Index**
   - PostgreSQL `pgvector` extension ашиглавал илүү хүргүүлэх:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   CREATE INDEX ON yellow_book_entry USING ivfflat (embedding vector_cosine_ops);
   ```

## ✅ Verification Checklist

- [ ] Redis үйлдэл ажиллаж байна
- [ ] Database migration-ын embedding field нэмэгдсэн
- [ ] OPENAI_API_KEY байна
- [ ] Embedding script дуусчээ
- [ ] /api/ai/yellow-books/search endpoint ажиллаж байна
- [ ] /yellow-books/assistant page нээгдөнө
- [ ] Chat сайн ажиллаж байна
- [ ] Cache hit/miss stats хэлэглэж байна

## 📚 API Documentation

### POST /api/ai/yellow-books/search

**Request:**
```json
{
  "query": "Асуалт текст",
  "limit": 5,
  "useCache": true
}
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Business Name",
    "summary": "Description",
    "similarity": 0.95,
    "distance": 0
  }
]
```

### DELETE /api/ai/yellow-books/cache

**Query Parameters:**
- `query` (optional) - Clear specific query cache
- Without query - Clear all cache

**Response:**
```json
{
  "message": "Cache cleared for query: Сайн үнэтэй ресторан"
}
```

## 🔗 References

- [OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings)
- [Redis Documentation](https://redis.io/documentation)
- [Prisma PostgreSQL](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [Cosine Similarity](https://en.wikipedia.org/wiki/Cosine_similarity)
