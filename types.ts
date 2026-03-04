export enum TrainingLevel {
  BASIC = 'Básico',
  INTERMEDIATE = 'Intermediário',
  ADVANCED = 'Avançado'
}

export interface Lesson {
  title: string;
  description: string;
  duration: string;
}

export interface Module {
  title: string;
  lessons: Lesson[];
}

export interface TrainingPath {
  title: string;
  description: string;
  modules: Module[];
}

export type AppView = 'LANDING' | 'PROFESSION_FORM' | 'PROFESSION_PATH' | 'MASTER_LEVEL' | 'MASTER_PATH' | 'LEARNING';
