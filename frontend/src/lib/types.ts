export type VerdictType = 'GUILTY' | 'NOT GUILTY' | 'PARTIALLY RESPONSIBLE' | 'INSUFFICIENT EVIDENCE';

export interface Participant {
  name: string;
}

export interface Statement {
  participantName: string;
  statementText: string;
  explanation?: string;
}

export interface Evidence {
  id: string;
  type: 'image' | 'text';
  content: string; // url or text content
  submittedBy: string;
}

export interface Question {
  id: string;
  askedTo: string;
  questionText: string;
}

export interface Answer {
  questionId: string;
  answerText: string;
}

export interface Hearing {
  questions: Question[];
  answers: Answer[];
}

export interface Verdict {
  verdictType: VerdictType;
  responsibleParty: string;
  severityScore: number;
  evidenceStrength: string;
  keyFindings: string[];
  reasoning: string;
  consequence: string;
  friendshipRecommendation: string;
}

export interface Appeal {
  id: string;
  counterArgument: string;
  newEvidence: Evidence[];
  status: 'PENDING' | 'UPHELD' | 'MODIFIED' | 'OVERTURNED';
  revisedVerdict?: Verdict;
}

export interface Case {
  id: string;
  title: string;
  category: string;
  friendA: Participant;
  friendB: Participant;
  description: string;
  statements: Statement[];
  evidence: Evidence[];
  hearing?: Hearing;
  verdict?: Verdict;
  appeals: Appeal[];
}
