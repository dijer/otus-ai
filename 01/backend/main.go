package main

import (
    "encoding/json"
    "log"
    "net/http"
    "sync"
)

type Question struct {
    ID   int    `json:"id"`
    Text string `json:"text"`
}

type Answer struct {
    QuestionID int    `json:"questionId"`
    Value      string `json:"value"`
}

type QuestionsResponse struct {
    Question []Question `json:"question"`
}

type AnswersRequest struct {
    Answers []Answer `json:"answers"`
}

var (
    questions = []Question{
        {ID: 1, Text: "Как тебя зовут?"},
        {ID: 2, Text: "Сколько тебе лет?"},
        {ID: 3, Text: "Твой любимый ai?"},
    }

    answersMu sync.Mutex
    answers   []Answer
)

func main() {
    mux := http.NewServeMux()
    mux.HandleFunc("/questions", questionsHandler)
    mux.HandleFunc("/answers", answersHandler)

    handler := withCORS(mux)

    log.Println("backend started on :8080")
    if err := http.ListenAndServe(":8080", handler); err != nil {
        log.Fatal(err)
    }
}

func questionsHandler(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodGet {
        http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
        return
    }

    writeJSON(w, http.StatusOK, QuestionsResponse{Question: questions})
}

func answersHandler(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPost {
        http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
        return
    }

    var req AnswersRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "invalid json", http.StatusBadRequest)
        return
    }

    answersMu.Lock()
    answers = append(answers, req.Answers...)
    answersMu.Unlock()

    writeJSON(w, http.StatusCreated, map[string]string{"status": "ok"})
}

func withCORS(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
        w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
        w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")

        if r.Method == http.MethodOptions {
            w.WriteHeader(http.StatusNoContent)
            return
        }

        next.ServeHTTP(w, r)
    })
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(status)
    _ = json.NewEncoder(w).Encode(payload)
}
