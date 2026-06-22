# mcp-server

MCP (Model Context Protocol) сервер для проекта otus-ai.  
Предоставляет агенту в IDE инструменты для работы с Go backend.

Транспорт: **stdio** (стандартный для VS Code Copilot Agent).

---

## Структура

```
mcp-server/
├── src/
│   ├── index.ts                # точка входа, регистрация сервера и инструментов
│   └── tools/
│       ├── getQuestions.ts     # инструмент: получить список вопросов
│       ├── submitAnswers.ts    # инструмент: отправить ответы
│       └── getStatus.ts        # инструмент: проверить доступность сервера
├── .env                        # локальный конфиг (не коммитить)
├── .env.example                # шаблон конфига
├── package.json
└── tsconfig.json
```

---

## Инструменты (tools)

| Имя | Описание |
|-----|----------|
| `get_questions` | Получить список вопросов анкеты (`GET /questions`) |
| `submit_answers` | Отправить ответы на вопросы (`POST /answers`) |
| `get_status` | Проверить доступность Go сервера (healthcheck) |

Каждый вызов логируется в stderr:
```
[MCP] tool=<name> params=<sanitized> status=<pending|success|error>
```

---

## Настройка

1. Перейди в папку:
   ```bash
   cd 01/mcp-server
   ```

2. Установи зависимости:
   ```bash
   npm install
   ```

3. Создай `.env` из примера:
   ```bash
   cp .env.example .env
   ```
   Содержимое `.env`:
   ```env
   API_BASE_URL=http://localhost:8080
   ```

---

## Запуск

**Dev-режим (с hot reload):**
```bash
npm run dev
```

**Production (после сборки):**
```bash
npm run build
npm start
```

Go backend должен быть запущен на `API_BASE_URL` (по умолчанию `http://localhost:8080`).

---

## Интеграция с VS Code Copilot Agent

Конфиг: `~/.vscode/mcp.json` (пользовательский конфиг в домашней папке)

### Как включить

1. Собери сервер:
   ```bash
   cd 01/mcp-server
   npm install
   npm run build
   ```

2. Убедись что Go backend запущен (`http://localhost:8080`).

3. Открой Command Palette (`Ctrl+Shift+P`) → **MCP: List Servers** — должен появиться `otus-project-helper`.

4. Нажми **Start** рядом с сервером (или он стартует автоматически при первом обращении агента).

5. Открой Copilot Chat в режиме **Agent** и проверь:
   ```
   какие вопросы есть в анкете?
   ```
   Агент должен вызвать `get_questions` и вернуть список.

### Содержимое mcp.json

```json
{
  "servers": {
    "otus-project-helper": {
      "type": "stdio",
      "command": "node",
      "args": ["${workspaceFolder}/01/mcp-server/dist/index.js"],
      "env": {
        "API_BASE_URL": "http://localhost:8080"
      }
    }
  }
}
```

> `API_BASE_URL` можно переопределить в `env` если backend запущен на другом порту.

Подробнее: [Using MCP servers in VS Code](https://code.visualstudio.com/docs/copilot/chat/mcp-servers).

---

## Безопасность

- Секреты (`.env`) не коммитятся. В `.env.example` — только структура без значений.
- MCP-сервер не хранит и не логирует значения ответов пользователей.
