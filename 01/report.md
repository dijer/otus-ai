# Отчет по ДЗ: AI-инструкции для проекта

## 1. Выбранный AI-инструмент

- Инструмент: GitHub Copilot Chat в VS Code.
- Специализация выполнена через репозиторный файл `.github/copilot-instructions.md`.
- Дополнительный контекст вынесен в `docs/ai/*`.

## 2. Что сделано

Добавлены AI-артефакты:
- `.github/copilot-instructions.md` - основной набор правил, формат ответа, границы и проверочные требования.
- `docs/ai/CONTEXT.md` - описание проекта "для новичка" и шаги запуска.
- `docs/ai/ARCHITECTURE.md` - модули, API-контракты, точки расширения, ограничения.
- `docs/ai/STYLEGUIDE.md` - стиль изменений и проверок.
- `docs/ai/TASKS.md` - типовые сценарии (4 шт) с промптами, ожидаемым ответом и критериями готовности.
- `docs/ai/DEFINITION_OF_DONE.md` - Definition of Done.
- `docs/ai/DECISIONS.md` - зафиксированные архитектурные решения.

## 3. Практическая проверка инструкций через AI-агента

### Что хотели изменить

Сделать маленький багфикс на frontend: при отправке формы отправлять ответы без пробелов по краям.

### Промпт агенту

```text
Ты работаешь в репозитории otus-ai/01. Нужен маленький багфикс в frontend: при отправке формы значения ответов должны отправляться без лишних пробелов по краям. Сейчас валидация уже не пускает пустые/пробельные поля, но в payload могут уходить неtrim-нутые строки. Внеси минимальное изменение только там, где нужно, и ничего не ломай в существующем поведении.
```

### Результат

Агент внес точечное изменение в `frontend/src/App.jsx`:
- было: `value: answers[item.id]`
- стало: `value: (answers[item.id] || '').trim()`

Наблюдение по соответствию инструкциям:
- Изменение минимальное и локальное.
- Контракты backend API не затронуты.
- Архитектурных нарушений нет.
- Формат ответа частично соответствует (краткий отчет по изменениям присутствует).

### Проверка после изменений

Запускалось:
- `frontend`: `npm install` и `npm run build` - успешно.
- `backend`: `go build main.go` - успешно (без вывода, что типично для успешной сборки).

Дополнительно:
- `go test ./...` не применим в текущем виде структуры (нет go.mod; команда падает в немодульной раскладке).

## 4. Трудности (необязательно)

- В проекте backend без `go.mod`, поэтому стандартная проверка `go test ./...` не запускается из коробки.
- Для воспроизводимой проверки backend использована сборка `go build main.go`.

## 5. Использованные промпты (Markdown)

1. Инициализация проекта (`prompts/01-init.md`).
2. Добавление `.gitignore` (`prompts/02-gitignore.md`).
3. Багфикс для проверки следования AI-инструкциям:

```text
Ты работаешь в репозитории otus-ai/01. Нужен маленький багфикс в frontend: при отправке формы значения ответов должны отправляться без лишних пробелов по краям. Сейчас валидация уже не пускает пустые/пробельные поля, но в payload могут уходить неtrim-нутые строки. Внеси минимальное изменение только там, где нужно, и ничего не ломай в существующем поведении.
```

## 6. Журнал работ (последовательно)

### 2026-06-22

1. Проанализирован статус репозитория и проверено, что для ДЗ по LangChain лучше добавить отдельный агент в новую папку, не ломая существующие backend/frontend.
2. Создан каркас агента на Node.js + TypeScript в `01/agent-node`:
	- `package.json`
	- `tsconfig.json`
	- `src/main.ts`
	- `src/tools/apiTools.ts`
	- `src/prompts/systemPrompt.ts`
3. Добавлен файл `01/agent-node/.env.example` с базовыми переменными окружения.
4. Добавлены зависимости для LangChain-агента в `01/agent-node/package.json`:
	- `langchain`
	- `@langchain/openai`
	- `@langchain/anthropic`
	- `@langchain/ollama`
	- `dotenv`
	- `zod`
5. Расширен `01/agent-node/.env.example` примерами для провайдеров OpenAI, Anthropic и Ollama (без реальных секретов).
6. Реализованы LangChain tools с реальными HTTP-вызовами к backend в `01/agent-node/src/tools/apiTools.ts`:
	- `getQuestions` -> `GET /questions`
	- `submitAnswers` -> `POST /answer` (с fallback на `POST /answers` для совместимости с текущим backend)
	- результат tools возвращается как структурированный JSON-объект (`status`, `action`, `data`, `errors`).
7. Обновлен системный промпт агента в `01/agent-node/src/prompts/systemPrompt.ts`:
	- роль: API-оператор;
	- ограничение: работа только через tools;
	- запрет на выдумывание данных;
	- при ошибке обязательно указывается причина;
	- зафиксирован контракт ответа в JSON с полями `status`, `action`, `data`, `errors`.
8. Реализован запуск агента из CLI в `01/agent-node/src/main.ts`:
	- аргумент из команды (`npm run dev -- "..."`) передается агенту как `user input`;
	- при пустом аргументе выводится подсказка по использованию и пример запуска;
	- подключены провайдеры из `.env` (`openai`, `anthropic`, `ollama`) и запуск через LangChain AgentExecutor с tools.
9. Подготовлено окружение для запуска Node/TS агента:
	- установлены зависимости в `01/agent-node` (`npm install`);
	- добавлен `@types/node` и `types: ["node"]` в `tsconfig.json`;
	- проверка сборки `npm run build` прошла успешно.
10. Проверено поведение CLI:
	- `npm run dev -- ""` выводит подсказку и пример запуска (как требовалось);
	- `npm run dev -- "создай ответы для анкеты: имя Alex, возраст 25, любимый ai GPT"` передает аргумент в агентный поток (дальше ожидаемо требуется ключ провайдера в `.env`).
11. Исправлен шаблон системного промпта для LangChain:
	- в `01/agent-node/src/prompts/systemPrompt.ts` экранированы фигурные скобки в JSON-контракте (`{{` и `}}`), чтобы `ChatPromptTemplate` не воспринимал их как переменные.
12. Выполнены 5 проверочных запросов агента с локальным провайдером Ollama (`qwen2.5:3b`) и сохранены результаты в `01/agent-node/test-runs.md`:
	- подтверждено минимум 3 реальных вызова API-tool (фактически 4 вызова);
	- добавлен один сценарий с неподдерживаемым намерением и ошибкой.
13. Обновлены env-файлы для локального запуска без секретов:
	- в `01/agent-node/.env.example` выставлены рабочие значения для локального Ollama (`OLLAMA_BASE_URL=http://127.0.0.1:11400`, `OLLAMA_MODEL=qwen2.5:3b`);
	- создан `01/agent-node/.env` с локальной конфигурацией (`LLM_PROVIDER=ollama`, `API_BASE_URL=http://localhost:8080`).
14. Сведены к одной базовой локальной конфигурации `.env` и `.env.example`:
	- в `.env.example` дефолтный провайдер тоже переключен на `ollama`, чтобы не было расхождения с реальным `.env`;
	- альтернативные провайдеры `openai` и `anthropic` оставлены как шаблоны для ручного переключения.

Дальше журнал будет пополняться после каждого значимого шага по реализации агента.

---

# Отчет по ДЗ: Простой MCP-сервер

## 1. Принципы MCP

**Как IDE/агент подключается к MCP-серверу.**
VS Code Copilot Agent использует конфигурацию из `.vscode/mcp.json`, где прописан способ запуска сервера и транспорт. При первом обращении агент запускает сервер как дочерний процесс и общается с ним через **stdio** (стандартный ввод/вывод). Агент запрашивает список доступных инструментов (`tools/list`), получает их схемы и описания, после чего может вызывать нужный инструмент через `tools/call` с JSON-параметрами. Весь обмен идёт по [протоколу MCP](https://modelcontextprotocol.io/).

**Что считается «tool» в нашем сервере.**
Tool — это именованная функция с описанием и JSON Schema входных параметров, которую агент может вызвать явно через `tools/call`. Сервер предоставляет 3 инструмента поверх Go backend (`http://localhost:8080`):
- `get_questions` — получить список вопросов анкеты (`GET /questions`);
- `submit_answers` — отправить ответы (`POST /answers`);
- `get_status` — проверить доступность backend (healthcheck).

Результат возвращается как структурированный объект (`structuredContent`). Секреты и значения ответов не логируются — в stderr пишется только имя tool, статус и `count`.

## 2. Реализация MCP-сервера

Транспорт: **stdio**. Сервер объявляет 3 инструмента, вызывающих Go backend (`http://localhost:8080`). Результат каждого инструмента возвращается как структурированный объект через `structuredContent` (текстовый блок оставлен только как fallback для клиентов без поддержки structured output).

### Инструменты

| Инструмент | Описание | Файл |
|---|---|---|
| `get_questions` | Получить список вопросов анкеты (`GET /questions`) | [mcp-server/src/tools/getQuestions.ts](mcp-server/src/tools/getQuestions.ts) |
| `submit_answers` | Отправить ответы на вопросы (`POST /answers`) | [mcp-server/src/tools/submitAnswers.ts](mcp-server/src/tools/submitAnswers.ts) |
| `get_status` | Проверить доступность Go сервера (healthcheck) | [mcp-server/src/tools/getStatus.ts](mcp-server/src/tools/getStatus.ts) |

### Логи

Каждый tool пишет в `stderr` строку формата:
```
[MCP] tool=<name> params=<sanitized> status=<pending|success|error>
```

### Ссылки на код

- Регистрация сервера и инструментов: [mcp-server/src/index.ts](mcp-server/src/index.ts) L1–L37
- `get_questions`: [mcp-server/src/tools/getQuestions.ts](mcp-server/src/tools/getQuestions.ts) L1–L20
- `submit_answers`: [mcp-server/src/tools/submitAnswers.ts](mcp-server/src/tools/submitAnswers.ts) L1–L38
- `get_status`: [mcp-server/src/tools/getStatus.ts](mcp-server/src/tools/getStatus.ts) L1–L29

### Доказательства вызовов из IDE

Воспроизводимые сценарии тестирования и фактические вызовы MCP-tools из VS Code Copilot Agent (5 сценариев, все подтверждены реальными вызовами): [mcp-server/test-runs.md](mcp-server/test-runs.md).

## 3. Использованные промпты

1. Скаффолдинг проекта (`prompts/06-mcp-setup.md`)
2. Реализация инструментов (`prompts/07-mcp-tools.md`)

## 4. Журнал работ

### 2026-06-23

1. Создан каркас MCP-сервера в `01/mcp-server/`:
   - `package.json` — зависимости: `@modelcontextprotocol/sdk`, `zod`, `dotenv`
   - `tsconfig.json` — ESM, NodeNext, ES2022
   - `.env.example` — переменная `API_BASE_URL`
   - `README.md` — структура проекта, инструкция запуска, интеграция с VS Code
   - `src/index.ts` — точка входа (заглушка)
2. Реализованы 3 MCP-инструмента для работы с Go backend:
   - `src/tools/getQuestions.ts` — `GET /questions`, возвращает `{ status, questions[] }`
   - `src/tools/submitAnswers.ts` — `POST /answers`, принимает `answers[{questionId, value}]`, возвращает `{ status, result }`
   - `src/tools/getStatus.ts` — healthcheck с таймаутом 3с, возвращает `{ status, reachable, url }`
3. Подключены tools в `src/index.ts`, сервер стартует через stdio-транспорт.
4. Проверена компиляция: `npm install && npm run build` — ошибок нет.
