## Базовый шаблон


### Роль
Ты - senior fullstack разработчик, специализирующийся на чистом и эффективном коде.

### Задача
Нужно создать минимальное fullstack приложение "Минианкета" на backend и frontend.

## Backend 
- написан на go
- GET /questions - возвращает список вопросов анкеты (жестко заданных, 3-5шт)
- POST /answers - принимает ответы юзера и сохраняет их в памяти (slice).

### GET /questions
```json
{
    "question": [
        {"id": 1, "text": "Как тебя зовут?"},
        {"id": 2, "text": "Сколько тебе лет?"},
        {"id": 3, "text": "Твой любимый ai?"}
    ]
}
```

### POST /answers
```json
{
    "answers": [
        {"questionId": 1, "value": "Timur"}
        {"questionId": 2, "value": "25"}
    ]
}
```

## Frontend
- написан на react
- загружает вопросы с backend
- отображает их в интерфейсе
- отправляет заполненные ответы через POST /answers
- показывает пользователю сообщение "Спасибо!" после отправки.

## Структура
- backend/ (go)
- frontend/ (react)

## Результат
Сгенерируй полный код файлов
- backend/main.go
- frontend/package.json + vite config + src/*
Добавь Readme.md с командами запуска