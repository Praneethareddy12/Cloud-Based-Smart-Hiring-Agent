import type { EvaluationResponse } from '../types/evaluation'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

export async function uploadResume(file: File): Promise<EvaluationResponse> {
  const formData = new FormData()
  formData.append('resume', file)

  const response = await fetch(`${API_BASE}/evaluate`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null)
    throw new Error(errorBody?.detail || 'Failed to evaluate resume.')
  }

  return response.json()
}

export async function fetchHistory() {
  const response = await fetch(`${API_BASE}/history`)
  if (!response.ok) {
    throw new Error('Failed to load history.')
  }
  return response.json()
}
