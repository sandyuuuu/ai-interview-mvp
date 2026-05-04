import { InterviewRecord, ReviewNote, QuestionBankItem } from "./types";

const KEYS = {
  interviews: "ai_interview_records",
  notes: "ai_review_notes",
  questions: "ai_question_bank",
};

export const storage = {
  getInterviews(): InterviewRecord[] {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(KEYS.interviews);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveInterview(record: InterviewRecord) {
    if (typeof window === "undefined") return;
    const records = this.getInterviews();
    const idx = records.findIndex((r) => r.id === record.id);
    if (idx >= 0) {
      records[idx] = record;
    } else {
      records.unshift(record);
    }
    localStorage.setItem(KEYS.interviews, JSON.stringify(records));
  },

  getNotes(): ReviewNote[] {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(KEYS.notes);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveNote(note: ReviewNote) {
    if (typeof window === "undefined") return;
    const notes = this.getNotes();
    const idx = notes.findIndex((n) => n.id === note.id);
    if (idx >= 0) {
      notes[idx] = note;
    } else {
      notes.unshift(note);
    }
    localStorage.setItem(KEYS.notes, JSON.stringify(notes));
  },

  deleteNote(id: string) {
    if (typeof window === "undefined") return;
    const notes = this.getNotes().filter((n) => n.id !== id);
    localStorage.setItem(KEYS.notes, JSON.stringify(notes));
  },

  getQuestions(): QuestionBankItem[] {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(KEYS.questions);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveQuestions(questions: QuestionBankItem[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(KEYS.questions, JSON.stringify(questions));
  },
};
