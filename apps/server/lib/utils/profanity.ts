export interface ProfanityEntry {
  id: string;
  match: string;
  tags: string[];
  severity: number;
}

export class ProfanityParser {
  private readonly entries: ProfanityEntry[];
  private readonly patterns: Array<{
    entry: ProfanityEntry;
    regex: RegExp;
  }>;

  constructor(entries: ProfanityEntry[]) {
    this.entries = entries;

    this.patterns = entries.map((entry) => ({
      entry,
      regex: new RegExp(entry.match, "i"),
    }));
  }

  /** Check whether the input matches any entry. */
  has(input: string): boolean {
    return this.find(input) !== undefined;
  }

  /** Find the first matching entry. */
  find(input: string): ProfanityEntry | undefined {
    const normalized = input.trim();

    if (!normalized) return undefined;

    for (const { entry, regex } of this.patterns) {
      regex.lastIndex = 0;

      if (regex.test(normalized)) {
        return entry;
      }
    }

    return undefined;
  }

  /** Find every matching entry. */
  findAll(input: string): ProfanityEntry[] {
    const normalized = input.trim();

    if (!normalized) return [];

    return this.patterns
      .filter(({ regex }) => {
        regex.lastIndex = 0;
        return regex.test(normalized);
      })
      .map(({ entry }) => entry);
  }
}
