export interface Intent {
  id: string;
  rawText: string;
  timestamp: number;
}

export interface Goal {
  id: string;
  intentId: string;
  description: string;
  constraints: string[];
  successCriteria: string[];
}
