# Agent Test Runs

Date: 2026-06-22

Environment:
- Backend: `http://localhost:8080` (Go server running)
- Agent provider: `LLM_PROVIDER=ollama`
- Ollama base URL: `http://127.0.0.1:11400`
- Ollama model: `qwen2.5:3b`

## Run 1
Request:
`получи список вопросов анкеты`

Tool called:
`getQuestions` (real HTTP call `GET /questions`)

Result:
```json
{
  "status": "success",
  "action": "getQuestions",
  "data": {
    "question": [
      { "id": 1, "text": "Как тебя зовут?" },
      { "id": 2, "text": "Сколько тебе лет?" },
      { "id": 3, "text": "Твой любимый ai?" }
    ]
  },
  "errors": []
}
```

Status: passed

## Run 2
Request:
`отправь ответы: questionId 1 = Alex, questionId 2 = 25, questionId 3 = GPT`

Tool called:
`submitAnswers` (real HTTP call `POST /answer`, fallback to `POST /answers`)

Result:
```json
{
  "status": "success",
  "action": "submitAnswers",
  "data": {
    "status": "ok"
  },
  "errors": []
}
```

Status: passed

## Run 3
Request:
`покажи вопросы еще раз`

Tool called:
`getQuestions` (real HTTP call `GET /questions`)

Result:
```json
{
  "status": "success",
  "action": "getQuestions",
  "data": {
    "question": [
      { "id": 1, "text": "Как тебя зовут?" },
      { "id": 2, "text": "Сколько тебе лет?" },
      { "id": 3, "text": "Твой любимый ai?" }
    ]
  },
  "errors": []
}
```

Status: passed

## Run 4
Request:
`удали все ответы анкеты`

Tool called:
No successful tool call. Intent is unsupported by available tools.

Result:
```text
Agent failed: Received tool input did not match expected schema
```

Status: failed (expected unsupported operation path)

## Run 5
Request:
`какие вопросы в анкете`

Tool called:
`getQuestions` (real HTTP call `GET /questions`)

Result:
```json
{
  "status": "success",
  "action": "getQuestions",
  "data": {
    "question": [
      { "id": 1, "text": "Как тебя зовут?" },
      { "id": 2, "text": "Сколько тебе лет?" },
      { "id": 3, "text": "Твой любимый ai?" }
    ]
  },
  "errors": []
}
```

Status: passed

## Summary
- Total requests: 5
- Real API tool calls: 4 (`getQuestions` x3, `submitAnswers` x1)
- Requirement check: at least 3 real API tool calls -> passed
