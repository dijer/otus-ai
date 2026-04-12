# Минианкета (Go + React)

Минимальное fullstack приложение с backend на Go и frontend на React (Vite).

## Структура

- `backend/` - API на Go
- `frontend/` - клиент на React + Vite

## Backend

Эндпоинты:

- `GET /questions` - возвращает вопросы анкеты
- `POST /answers` - принимает и сохраняет ответы в памяти

### Запуск backend

```bash
cd backend
go run main.go
```

Сервер поднимается на `http://localhost:8080`.

## Frontend

### Установка и запуск

```bash
cd frontend
npm install
npm run dev
```

Frontend запускается на `http://localhost:5173` и работает с backend `http://localhost:8080`.

## Примеры запросов

### GET /questions

```bash
curl http://localhost:8080/questions
```

### POST /answers

```bash
curl -X POST http://localhost:8080/answers \
  -H "Content-Type: application/json" \
  -d '{"answers":[{"questionId":1,"value":"Timur"},{"questionId":2,"value":"25"}]}'
```
