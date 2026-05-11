import { useEffect, useMemo, useState } from 'react'

const API_URL = 'http://localhost:8080'

function App() {
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    async function loadQuestions() {
      try {
        const response = await fetch(`${API_URL}/questions`)
        if (!response.ok) {
          throw new Error('Не удалось загрузить вопросы')
        }

        const data = await response.json()
        if (mounted) {
          const loadedQuestions = data.question ?? []
          setQuestions(loadedQuestions)

          const initialAnswers = loadedQuestions.reduce((acc, item) => {
            acc[item.id] = ''
            return acc
          }, {})
          setAnswers(initialAnswers)
        }
      } catch (err) {
        if (mounted) {
          setError(err.message)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadQuestions()

    return () => {
      mounted = false
    }
  }, [])

  const isFormValid = useMemo(
    () => questions.every((item) => (answers[item.id] || '').trim() !== ''),
    [answers, questions],
  )

  const handleChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const payload = {
        answers: questions.map((item) => ({
          questionId: item.id,
          value: answers[item.id],
        })),
      }

      const response = await fetch(`${API_URL}/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Не удалось отправить ответы')
      }

      setSubmitted(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="page">
      <section className="card">
        <h1>Минианкета</h1>

        {loading && <p>Загрузка...</p>}

        {!loading && error && <p className="error">{error}</p>}

        {!loading && !submitted && !error && (
          <form onSubmit={handleSubmit} className="form">
            {questions.map((item) => (
              <label key={item.id} className="field">
                <span>{item.text}</span>
                <input
                  type="text"
                  value={answers[item.id] || ''}
                  onChange={(e) => handleChange(item.id, e.target.value)}
                  required
                />
              </label>
            ))}

            <button type="submit" disabled={!isFormValid || submitting}>
              {submitting ? 'Отправка...' : 'Отправить'}
            </button>
          </form>
        )}

        {!loading && submitted && <p className="success">Спасибо!</p>}
      </section>
    </main>
  )
}

export default App
