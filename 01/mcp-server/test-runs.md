# MCP-сервер: сценарии тестирования

Проверка инструментов сервера `otus-project-helper`, вызванных **из IDE (VS Code Copilot Agent)** через MCP-протокол.

- Дата прогона: **2026-07-04**
- Транспорт: **stdio**
- Конфиг подключения: `~/.vscode/mcp.json` (пользовательский конфиг в домашней папке)
- Go backend: `http://localhost:8080` (`01/backend/main.go`)
- Формат лога в stderr: `[MCP] tool=<name> params=<sanitized> status=<pending|success|error>`

Итог: **5 сценариев**, из них **5 — подтверждённые реальные вызовы tool из IDE** (требовалось минимум 3).

---

## Сценарий 1 — проверка доступности (backend недоступен) ✅ подтверждён из IDE

- **Запрос пользователя:** «проверь, доступен ли backend»
- **Ожидаемый tool:** `get_status`
- **Условие:** Go backend не запущен.
- **Фактический вызов из IDE:** `get_status` (без параметров)
- **Фактический результат (structuredContent):**
  ```json
  { "status": "error", "reachable": false, "message": "fetch failed" }
  ```
- **Ожидаемый лог (stderr):**
  ```
  [MCP] tool=get_status params={} status=pending
  [MCP] tool=get_status status=error message=fetch failed
  ```
- **Вывод:** ошибка обработана корректно, tool не падает, а возвращает структурированный статус ошибки.

---

## Сценарий 2 — проверка доступности (backend поднят) ✅ подтверждён из IDE

- **Запрос пользователя:** «сервер жив?»
- **Ожидаемый tool:** `get_status`
- **Условие:** Go backend запущен на `:8080`.
- **Фактический вызов из IDE:** `get_status` (без параметров)
- **Фактический результат (structuredContent):**
  ```json
  { "status": "ok", "reachable": true, "url": "http://localhost:8080" }
  ```
- **Ожидаемый лог (stderr):**
  ```
  [MCP] tool=get_status params={} status=pending
  [MCP] tool=get_status status=success
  ```
- **Вывод:** healthcheck возвращает `reachable: true`.

---

## Сценарий 3 — получение списка вопросов ✅ подтверждён из IDE

- **Запрос пользователя:** «какие вопросы есть в анкете?»
- **Ожидаемый tool:** `get_questions`
- **Фактический вызов из IDE:** `get_questions` (без параметров)
- **Фактический результат (structuredContent):**
  ```json
  {
    "status": "ok",
    "questions": [
      { "id": 1, "text": "Как тебя зовут?" },
      { "id": 2, "text": "Сколько тебе лет?" },
      { "id": 3, "text": "Твой любимый ai?" }
    ]
  }
  ```
- **Ожидаемый лог (stderr):**
  ```
  [MCP] tool=get_questions params={} status=pending
  [MCP] tool=get_questions status=success count=3
  ```
- **Вывод:** список вопросов получен из backend (`GET /questions`).

---

## Сценарий 4 — отправка ответов ✅ подтверждён из IDE

- **Запрос пользователя:** «отправь ответы: имя Alex, возраст 25, любимый ai GPT»
- **Ожидаемый tool:** `submit_answers`
- **Фактический вызов из IDE:** `submit_answers` с параметрами
  ```json
  {
    "answers": [
      { "questionId": 1, "value": "Alex" },
      { "questionId": 2, "value": "25" },
      { "questionId": 3, "value": "GPT" }
    ]
  }
  ```
- **Фактический результат (structuredContent):**
  ```json
  { "status": "ok", "result": { "status": "ok" } }
  ```
- **Ожидаемый лог (stderr):**
  ```
  [MCP] tool=submit_answers params={"count":3} status=pending
  [MCP] tool=submit_answers status=success
  ```
- **Вывод:** ответы приняты backend (`POST /answers`, 201 Created). В логах пишется только `count`, значения ответов не логируются.

---

## Сценарий 5 — получение вопросов при недоступном backend ✅ подтверждён из IDE

- **Запрос пользователя:** «покажи вопросы» (при выключенном backend)
- **Ожидаемый tool:** `get_questions`
- **Условие:** Go backend не запущен.
- **Фактический вызов из IDE:** `get_questions` (без параметров)
- **Фактический результат:** `fetch failed` (сетевая ошибка обращения к backend)
- **Ожидаемый лог (stderr):**
  ```
  [MCP] tool=get_questions params={} status=pending
  ```
- **Вывод:** при недоступном backend tool корректно сигнализирует об ошибке, а не возвращает выдуманные данные.

---

## Как воспроизвести

1. Собрать сервер: `cd 01/mcp-server && npm install && npm run build`.
2. Запустить Go backend: `cd 01/backend && go run main.go` (слушает `:8080`).
3. В VS Code: `Ctrl+Shift+P` → **MCP: List Servers** → запустить `otus-project-helper`.
4. Открыть Copilot Chat (**Agent**) и отправить запросы из сценариев выше.
5. Логи tool видны в выводе MCP-сервера (`MCP: Show Output` / канал сервера).
