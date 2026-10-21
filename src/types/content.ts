import type { ToolId } from './batch';

export interface FaqItem {
  q: string;
  a: string;
}

export interface ToolStep {
  title: string;
  body: string;
}

export interface ToolInfo {
  id: ToolId;
  slug: string;
  name: string;
  tagline: string;
  title: string;
  lede: string;
  dropTitle: string;
  settingsPreview: {label: string;value: string;}[];
  steps: ToolStep[];
  notes: {title: string;body: string;}[];
  faqs: FaqItem[];
  keywords: string[];
}

export interface ArticleSection {
  id: string;
  heading: string;
  paragraphs: string[];
  list?: string[];
  image?: { src: string; alt: string; caption: string; width: number; height: number };
}

export interface HelpArticle {
  slug: string;
  title: string;
  summary: string;
  category: string;
  readTime: string;
  sections: ArticleSection[];
}

export interface TroubleshootingEntry {
  problem: string;
  fix: string;
}

export interface HelpCategory {
  id: string;
  title: string;
  description: string;
  href: string;
}
