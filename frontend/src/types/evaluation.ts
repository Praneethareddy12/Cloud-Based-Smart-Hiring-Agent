export interface EvaluationScores {
  open_source: number
  self_projects: number
  production: number
  technical_skills: number
}

export interface GithubPayload {
  username?: string
  repositories?: number
  profile?: Record<string, any>
}

export interface EvaluationResponse {
  candidate_name: string
  overall_score: number
  scores: EvaluationScores
  bonus_points: number
  strengths: string[]
  improvements: string[]
  github: GithubPayload
  projects: any[]
}
