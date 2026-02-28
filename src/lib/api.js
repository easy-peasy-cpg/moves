const API_BASE = '/api'

export async function getCelebrationPrompt(moveTitle, category) {
  const res = await fetch(`${API_BASE}/celebrate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ moveTitle, category }),
  })
  if (!res.ok) return 'You did it! Drop the proof.'
  const data = await res.json()
  return data.prompt
}

export async function getMoveSuggestions(category, existingMoves = [], seasonLength = '3 months') {
  const res = await fetch(`${API_BASE}/suggest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category, existingMoves, seasonLength }),
  })
  if (!res.ok) return []
  const data = await res.json()
  return data.suggestions
}
