# ARCHITECTURE

## Модули

## backend/
- Точка входа: `backend/main.go`
- Отвечает за HTTP API и CORS.
- Содержит in-memory состояние ответов (`answers`) и mutex для потокобезопасности.

## frontend/
- Основной компонент: `frontend/src/App.jsx`
- Отвечает за загрузку вопросов, управление состоянием формы и отправку ответов.
- Стили: `frontend/src/styles.css`

## Контракты API

`GET /questions`
- Метод: GET
- Успех: 200
- Ответ:
```json
{
  "question": [
    {"id": 1, "text": "..."}
  ]
}
```

`POST /answers`
- Метод: POST
- Тело:
```json
{
  "answers": [
    {"questionId": 1, "value": "..."}
  ]
}
```
- Успех: 201
- Ответ:
```json
{"status":"ok"}
```

## Точки расширения

- Добавление новых полей в `Question`/`Answer` при сохранении обратной совместимости.
- Валидация входящих ответов на backend.
- Улучшение UX формы на frontend без изменения контракта API.

## Что менять нельзя без отдельного согласования

- Пути и семантику существующих эндпоинтов.
- Порт backend `:8080` и origin frontend `http://localhost:5173` (если не оговорено иначе).
- Базовую структуру данных API (`question`, `answers`, `questionId`, `value`).