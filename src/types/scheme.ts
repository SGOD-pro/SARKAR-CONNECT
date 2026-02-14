export interface Scheme {
  id: string;
  name: string;
  nameHindi: string;
  category: 'agriculture' | 'health' | 'housing' | 'education' | 'women' | 'employment' | 'senior';
  benefits: string;
  eligibility: {
    minAge?: number;
    maxAge?: number;
    occupation?: string[];
    incomeLimit?: number;
    states?: string | string[];
  };
  documents: string[];
  applicationProcess: string;
  keywords: string[];
}

export interface UserQuery {
  message: string;
  age?: number;
  income?: number;
  language?: 'en' | 'hi';
}

export interface ExtractedEntities {
  age?: number;
  income?: number;
}
