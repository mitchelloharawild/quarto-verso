// Shared types for the core library. The core imports nothing from node:*;
// host capabilities arrive through the adapter interfaces at the bottom.

export type UnitKind = 'block' | 'caption' | 'meta' | 'code';

/** Half-open offset range into a source string (UTF-16 indices). */
export interface Range {
  start: number;
  end: number;
}

/** A unit as found in the current source (never stored). */
export interface SourceUnit {
  kind: UnitKind;
  hash: string;
  /** Markdown (block, caption), plain text (meta), or the cell body without option lines (code). */
  source: string;
  section?: string;
  /** Cell label, for code and caption units. */
  cell?: string;
  /** Meta field path (`title`, `book.title`, `book.chapters.2.part`) or caption option name. */
  field?: string;
  /** Splice location in the source file (block: the inline text; caption: the option line; code: the cell body). */
  range?: Range;
  /** Code units: the cell's language (informational; no language-specific processing). */
  lang?: string;
  /** Heading level, when the block is a heading. */
  heading?: number;
  /** Auto-generated id of a heading without an explicit id, pinned in translations. */
  autoId?: string;
}

export interface Review {
  by: string;
  date: string;
}

export interface Origin {
  by: string;
  model?: string;
  date: string;
}

/** One entry in a translation file. */
export interface TUnit {
  id: string;
  kind: UnitKind;
  section?: string;
  cell?: string;
  field?: string;
  'source-hash': string;
  source?: string;
  /** Translation: Markdown, plain text, or the whole translated cell body (code). */
  text?: string;
  /** Glossary keys used when translating, with the hash of the target term then. */
  terms?: Record<string, string>;
  origin?: Origin;
  reviews?: Review[];
  reverted?: string;
}

export interface TFile {
  source: string;
  lang: string;
  units: TUnit[];
}

export type UnitStatus = 'current' | 'stale' | 'missing';

/** Display status written into rendered pages. */
export type DisplayStatus = 'missing' | 'stale' | 'machine' | 'reviewed';

export interface SyncedUnit {
  id: string;
  src: SourceUnit;
  stored?: TUnit;
  status: UnitStatus;
}

export interface GlossaryEntry {
  key: string;
  term: string;
  variants?: string[];
  definition?: string;
  keep?: boolean;
}

export interface LangGlossaryEntry {
  'source-hash': string;
  term: string;
  variants?: string[];
  note?: string;
  origin?: Origin;
  reviews?: Review[];
}

export interface TranslateConfig {
  source: string;
  targets: string[];
  instructions?: string;
  glossary?: string | Record<string, Omit<GlossaryEntry, 'key'>>;
  backend?: { provider: string; model?: string; 'api-key-env'?: string };
  'on-render'?: 'off' | 'missing' | 'stale';
  'max-cost'?: number;
  'on-stale'?: 'source' | 'previous';
  /**
   * Where translations live. `yaml` (default): text in the translation
   * files. `parallel` (prototype): a translated copy of each document plus a
   * tracking file with ids, hashes and reviews.
   */
  storage?: 'yaml' | 'parallel';
  /** Pages with a smaller translated share are published with noindex. Default 0.5. */
  'min-coverage'?: number;
  review?: {
    /** GitHub repository (owner/name) that receives contribution PRs. */
    repo?: string;
    /** Reviews per unit counted as fully reviewed. */
    target?: number;
    /** PR service URL. */
    service?: string;
    /** Directory of the site inside the repository, when not the root. */
    dir?: string;
  };
}

// ---- adapters ---------------------------------------------------------------

/** Pandoc JSON AST (loosely typed). */
export type PandocAst = { blocks: any[]; meta: any };

export interface MarkdownAdapter {
  /** Parse with `commonmark_x+sourcepos`. */
  parseWithPositions(text: string): Promise<PandocAst>;
  /** Parse several Markdown snippets (no positions) in one call. */
  parseMany(texts: string[]): Promise<any[][]>;
}
