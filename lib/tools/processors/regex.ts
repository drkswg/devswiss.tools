import type { FieldErrors, ValidationState } from '@/lib/validation/common';
import { getRegexFieldErrors, regexSchema, type RegexDraft, type RegexFlavor } from '@/lib/validation/regex';

const EXECUTED_MATCH_LIMIT = 25;
const inlineJavaFlagPattern = /^\(\?([ims]+)\)/;

const posixClassTranslations: Record<string, string> = {
  alnum: 'A-Za-z0-9',
  alpha: 'A-Za-z',
  digit: '0-9',
  lower: 'a-z',
  space: '\\t\\r\\n\\f\\v ',
  upper: 'A-Z',
  xdigit: 'A-Fa-f0-9'
};

type TokenizationCounts = {
  alternations: number;
  anchors: number;
  characterClasses: number;
  escapes: number;
  groups: number;
  lookarounds: number;
  quantifiers: number;
};

type TokenizationResult = {
  counts: TokenizationCounts;
  executionBlockers: string[];
  explanation: string[];
  inlineFlags: string[];
  warnings: string[];
};

type TranslationResult =
  | {
      flags: string;
      supported: true;
      translatedSource: string;
    }
  | {
      reason: string;
      supported: false;
    };

export type RegexMatchGroup = {
  index: number;
  value: string;
};

export type RegexMatchRow = {
  end: number;
  groups: RegexMatchGroup[];
  index: number;
  start: number;
  value: string;
};

export type RegexExecutionDetails =
  | {
      anyMatch: boolean;
      flags: string;
      fullMatch: boolean;
      matchLimitReached: boolean;
      matches: RegexMatchRow[];
      supported: true;
      translatedPattern: string;
    }
  | {
      supported: false;
      unsupportedReason: string;
    };

export type RegexAnalysisDetails = {
  execution: RegexExecutionDetails;
  explanation: string[];
  flavor: RegexFlavor;
  summary: string;
  warnings: string[];
};

export type RegexProcessorResult = {
  details?: RegexAnalysisDetails;
  errors?: string[];
  fieldErrors?: FieldErrors;
  message: string;
  state: Exclude<ValidationState, 'idle'>;
};

function buildErrorList(fieldErrors: FieldErrors, fallbackIssues: string[]) {
  return Array.from(new Set([...Object.values(fieldErrors).flat(), ...fallbackIssues]));
}

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function pushUnique(target: string[], message: string) {
  if (!target.includes(message)) {
    target.push(message);
  }
}

function describeEscape(sequence: string) {
  switch (sequence) {
    case '\\d':
      return 'Digit shorthand `\\d` matches numeric characters.';
    case '\\D':
      return 'Digit exclusion `\\D` matches any non-digit character.';
    case '\\w':
      return 'Word shorthand `\\w` matches letters, digits, and underscore characters.';
    case '\\W':
      return 'Word exclusion `\\W` matches any non-word character.';
    case '\\s':
      return 'Whitespace shorthand `\\s` matches spaces, tabs, and line breaks.';
    case '\\S':
      return 'Whitespace exclusion `\\S` matches non-whitespace characters.';
    case '\\b':
      return 'Word-boundary `\\b` asserts a transition between word and non-word characters.';
    case '\\B':
      return 'Non-boundary `\\B` asserts that the current position stays within the same word boundary context.';
    case '\\A':
      return 'Start-of-input anchor `\\A` targets only the beginning of the sample text.';
    case '\\Z':
      return 'End-of-input anchor `\\Z` targets the end of the sample text before an optional trailing line break.';
    case '\\z':
      return 'Absolute end-of-input anchor `\\z` targets only the final character position.';
    case '\\t':
      return 'Escape `\\t` matches a tab character.';
    case '\\n':
      return 'Escape `\\n` matches a line-feed character.';
    case '\\r':
      return 'Escape `\\r` matches a carriage-return character.';
    default:
      return undefined;
  }
}

function describeCharacterClass(content: string) {
  const negated = content.startsWith('^');
  const raw = negated ? content.slice(1) : content;
  const posixClasses = [...raw.matchAll(/\[:([a-z]+):\]/g)].map((match) => match[1]);

  if (posixClasses.length > 0) {
    const names = posixClasses.map((name) => `POSIX class "${name}"`).join(', ');
    return `${negated ? 'Negated' : 'Character'} class uses ${names}.`;
  }

  if (raw.includes('-')) {
    return `${negated ? 'Negated' : 'Character'} class defines one or more explicit ranges.`;
  }

  return `${negated ? 'Negated' : 'Character'} class matches one character from the listed set.`;
}

function describeQuantifier(fragment: string, modifier: string | null) {
  const base =
    fragment === '*'
      ? 'Zero or more repetitions are allowed.'
      : fragment === '+'
        ? 'One or more repetitions are required.'
        : fragment === '?'
          ? 'The preceding token is optional.'
          : `Bounded repetition ${fragment} limits how many times the preceding token can repeat.`;

  if (modifier === '?') {
    return `${base} The trailing \`?\` makes the quantifier reluctant.`;
  }

  if (modifier === '+') {
    return `${base} The trailing \`+\` makes the quantifier possessive.`;
  }

  return base;
}

function summarizePattern(flavor: RegexFlavor, counts: TokenizationCounts) {
  const parts = [
    pluralize(counts.groups, 'group'),
    pluralize(counts.quantifiers, 'quantifier'),
    pluralize(counts.characterClasses, 'character class', 'character classes'),
    pluralize(counts.anchors, 'anchor')
  ];

  if (counts.alternations > 0) {
    parts.push(pluralize(counts.alternations, 'alternation'));
  }

  if (counts.lookarounds > 0) {
    parts.push(pluralize(counts.lookarounds, 'lookaround'));
  }

  return `${flavor === 'java' ? 'Java' : 'PL/SQL'} pattern with ${parts.join(', ')}.`;
}

function tokenizePattern(flavor: RegexFlavor, expression: string): TokenizationResult {
  const explanation: string[] = [];
  const warnings: string[] = [];
  const executionBlockers: string[] = [];
  const inlineFlags: string[] = [];
  const counts: TokenizationCounts = {
    alternations: 0,
    anchors: 0,
    characterClasses: 0,
    escapes: 0,
    groups: 0,
    lookarounds: 0,
    quantifiers: 0
  };
  let groupDepth = 0;

  for (let index = 0; index < expression.length; index += 1) {
    const character = expression[index];

    if (character === '\\') {
      const nextCharacter = expression[index + 1];

      if (!nextCharacter) {
        throw new SyntaxError('Regex expression cannot end with an incomplete escape sequence.');
      }

      if ((nextCharacter === 'p' || nextCharacter === 'P') && expression[index + 2] === '{') {
        const closingBraceIndex = expression.indexOf('}', index + 3);

        if (closingBraceIndex === -1) {
          throw new SyntaxError('Unicode property escapes must close with `}`.');
        }

        counts.escapes += 1;
        pushUnique(explanation, `Unicode property escape \`${expression.slice(index, closingBraceIndex + 1)}\` targets a named character category.`);
        pushUnique(
          warnings,
          `${flavor === 'java' ? 'Java' : 'PL/SQL'} Unicode property escapes are explained, but exact browser execution is not guaranteed for this release.`
        );
        pushUnique(
          executionBlockers,
          `${flavor === 'java' ? 'Java' : 'PL/SQL'} Unicode property escapes are outside the supported browser execution subset for this release.`
        );
        index = closingBraceIndex;
        continue;
      }

      counts.escapes += 1;

      if (/\d/.test(nextCharacter)) {
        pushUnique(explanation, `Backreference \`\\${nextCharacter}\` reuses the text captured by an earlier group.`);
      } else {
        const description = describeEscape(`\\${nextCharacter}`);

        if (description) {
          pushUnique(explanation, description);
        } else {
          pushUnique(explanation, `Escaped token \`\\${nextCharacter}\` treats the following character as a literal or engine-specific shorthand.`);
        }
      }

      index += 1;
      continue;
    }

    if (character === '[') {
      let closingIndex = -1;

      for (let cursor = index + 1; cursor < expression.length; cursor += 1) {
        if (expression[cursor] === '\\') {
          cursor += 1;
          continue;
        }

        if (expression[cursor] === ']') {
          closingIndex = cursor;
          break;
        }
      }

      if (closingIndex === -1) {
        throw new SyntaxError('Character classes must close with `]`.');
      }

      const content = expression.slice(index + 1, closingIndex);
      counts.characterClasses += 1;
      pushUnique(explanation, describeCharacterClass(content));

      if (flavor === 'java' && content.includes('&&')) {
        pushUnique(warnings, 'Java character-class intersections are explained, but exact browser execution is not available for this release.');
      }

      index = closingIndex;
      continue;
    }

    if (character === '(') {
      const rest = expression.slice(index);

      if (rest.startsWith('(?<=') || rest.startsWith('(?<!')) {
        counts.groups += 1;
        counts.lookarounds += 1;
        groupDepth += 1;
        pushUnique(explanation, `${rest.startsWith('(?<=') ? 'Positive' : 'Negative'} lookbehind asserts context before the current match position.`);
        pushUnique(warnings, 'Lookbehind assertions are explained, but exact browser execution is blocked to avoid flavor drift.');
        pushUnique(executionBlockers, 'Lookbehind assertions are explained, but exact browser execution is blocked to avoid flavor drift.');
        index += 3;
        continue;
      }

      if (rest.startsWith('(?=') || rest.startsWith('(?!')) {
        counts.groups += 1;
        counts.lookarounds += 1;
        groupDepth += 1;
        pushUnique(explanation, `${rest.startsWith('(?=') ? 'Positive' : 'Negative'} lookahead checks upcoming text without consuming it.`);
        if (flavor === 'plsql') {
          pushUnique(warnings, 'PL/SQL lookahead handling is explained only; exact browser execution is not available for this release.');
          pushUnique(executionBlockers, 'PL/SQL lookahead handling is explained only; exact browser execution is not available for this release.');
        }
        index += 2;
        continue;
      }

      if (rest.startsWith('(?:')) {
        counts.groups += 1;
        groupDepth += 1;
        pushUnique(explanation, 'Non-capturing group groups tokens together without storing a numbered capture.');
        if (flavor === 'plsql') {
          pushUnique(warnings, 'PL/SQL non-capturing groups are outside the supported browser execution subset.');
          pushUnique(executionBlockers, 'PL/SQL non-capturing groups are outside the supported browser execution subset.');
        }
        index += 2;
        continue;
      }

      if (rest.startsWith('(?>')) {
        counts.groups += 1;
        groupDepth += 1;
        pushUnique(explanation, 'Atomic group locks in a match once chosen and prevents backtracking inside the group.');
        pushUnique(warnings, 'Atomic groups are explained, but exact browser execution is not available for this release.');
        pushUnique(executionBlockers, 'Atomic groups are explained, but exact browser execution is not available for this release.');
        index += 2;
        continue;
      }

      if (rest.startsWith('(?<')) {
        const closingNameIndex = expression.indexOf('>', index + 3);

        if (closingNameIndex === -1) {
          throw new SyntaxError('Named groups must close the capture name with `>`.');
        }

        const groupName = expression.slice(index + 3, closingNameIndex);
        counts.groups += 1;
        groupDepth += 1;
        pushUnique(explanation, `Named capturing group "${groupName}" stores a labeled match for later reuse.`);

        if (flavor === 'plsql') {
          pushUnique(warnings, 'Named capturing groups are outside the supported PL/SQL execution subset.');
          pushUnique(executionBlockers, 'Named capturing groups are outside the supported PL/SQL execution subset.');
        }

        index = closingNameIndex;
        continue;
      }

      const inlineFlagMatch = /^\(\?([a-z-]+)(:)?/.exec(rest);

      if (inlineFlagMatch) {
        const [, rawFlags, scopedSuffix] = inlineFlagMatch;

        if (scopedSuffix === ':') {
          counts.groups += 1;
          groupDepth += 1;
          pushUnique(explanation, `Inline flag group \`(?${rawFlags}:...)\` changes matching rules for the enclosed tokens.`);
          pushUnique(warnings, 'Scoped inline flag groups are explained, but exact browser execution is not available for this release.');
          pushUnique(executionBlockers, 'Scoped inline flag groups are explained, but exact browser execution is not available for this release.');
          index += rawFlags.length + 2;
          continue;
        }

        if (!/^[ims]+$/.test(rawFlags)) {
          throw new SyntaxError(`Inline flag group \`(?${rawFlags})\` is not supported by this tool.`);
        }

        if (index !== 0) {
          pushUnique(warnings, 'Inline flag toggles are only executed when they appear at the beginning of the pattern.');
          pushUnique(executionBlockers, 'Inline flag toggles are only executed when they appear at the beginning of the pattern.');
        } else {
          inlineFlags.push(...rawFlags.split(''));
        }

        pushUnique(explanation, `Inline flag group \`(?${rawFlags})\` enables ${rawFlags.split('').join(', ')} matching mode${rawFlags.length > 1 ? 's' : ''}.`);
        index += rawFlags.length + 2;
        continue;
      }

      counts.groups += 1;
      groupDepth += 1;
      pushUnique(explanation, 'Capturing group stores a matched fragment for later inspection or backreferences.');
      continue;
    }

    if (character === ')') {
      groupDepth -= 1;

      if (groupDepth < 0) {
        throw new SyntaxError('Closing parenthesis `)` does not have a matching opening group.');
      }

      continue;
    }

    if (character === '{') {
      const quantified = expression.slice(index).match(/^\{(\d+)(,(\d*)?)?\}([?+])?/);

      if (quantified) {
        counts.quantifiers += 1;
        pushUnique(explanation, describeQuantifier(quantified[0].replace(/[?+]$/, ''), quantified[4] ?? null));

        if (quantified[4] === '+') {
          pushUnique(warnings, 'Possessive quantifiers are explained, but exact browser execution is not available for this release.');
          pushUnique(executionBlockers, 'Possessive quantifiers are explained, but exact browser execution is not available for this release.');
        }

        index += quantified[0].length - 1;
      }

      continue;
    }

    if (character === '*' || character === '+' || character === '?') {
      const modifier = expression[index + 1] === '?' || expression[index + 1] === '+' ? expression[index + 1] : null;
      counts.quantifiers += 1;
      pushUnique(explanation, describeQuantifier(character, modifier));

      if (modifier === '+') {
        pushUnique(warnings, 'Possessive quantifiers are explained, but exact browser execution is not available for this release.');
        pushUnique(executionBlockers, 'Possessive quantifiers are explained, but exact browser execution is not available for this release.');
      }

      if (modifier) {
        index += 1;
      }

      continue;
    }

    if (character === '^' || character === '$') {
      counts.anchors += 1;
      pushUnique(
        explanation,
        character === '^'
          ? 'Anchor `^` asserts the start of the sample text or line, depending on flags.'
          : 'Anchor `$` asserts the end of the sample text or line, depending on flags.'
      );
      continue;
    }

    if (character === '|') {
      counts.alternations += 1;
      pushUnique(explanation, 'Alternation `|` offers multiple branches and stops at the first successful branch.');
      continue;
    }

    if (character === '.') {
      pushUnique(explanation, 'Wildcard `.` matches any character except line breaks unless dot-all mode is enabled.');
      continue;
    }
  }

  if (groupDepth !== 0) {
    throw new SyntaxError('One or more groups are missing a closing parenthesis.');
  }

  return {
    counts,
    executionBlockers,
    explanation,
    inlineFlags,
    warnings
  };
}

function normalizeJavaPattern(expression: string, inlineFlags: string[]) {
  let source = expression;
  const flags = new Set<string>(inlineFlags.filter((flag) => ['i', 'm', 's'].includes(flag)));

  while (true) {
    const match = source.match(inlineJavaFlagPattern);

    if (!match) {
      break;
    }

    source = source.slice(match[0].length);
    for (const flag of match[1]) {
      if (['i', 'm', 's'].includes(flag)) {
        flags.add(flag);
      }
    }
  }

  return {
    flags: [...flags].sort().join(''),
    source
  };
}

function translatePlsqlPattern(expression: string) {
  return expression.replace(/\[\[:([a-z]+):\]\]/g, (match, className: string) => {
    const translated = posixClassTranslations[className];
    return translated ? `[${translated}]` : match;
  });
}

function translateForExecution(
  flavor: RegexFlavor,
  expression: string,
  tokenization: TokenizationResult
): TranslationResult {
  if (tokenization.executionBlockers.length > 0) {
    return {
      supported: false,
      reason: tokenization.executionBlockers[0]
    };
  }

  const { source, flags } =
    flavor === 'java'
      ? normalizeJavaPattern(expression, tokenization.inlineFlags)
      : { source: translatePlsqlPattern(expression), flags: '' };

  try {
    new RegExp(source, flags);
  } catch {
    return {
      supported: false,
      reason: `The ${flavor === 'java' ? 'Java' : 'PL/SQL'} pattern uses syntax that cannot be executed safely in the browser-local engine.`
    };
  }

  return {
    supported: true,
    translatedSource: source,
    flags
  };
}

function executeMatches(translatedSource: string, flags: string, sampleText: string): RegexExecutionDetails {
  const globalFlags = flags.includes('g') ? flags : `${flags}g`;
  const matcher = new RegExp(translatedSource, globalFlags);
  const matches: RegexMatchRow[] = [];
  let matchLimitReached = false;
  let currentMatch: RegExpExecArray | null;

  while ((currentMatch = matcher.exec(sampleText)) !== null) {
    matches.push({
      index: matches.length + 1,
      start: currentMatch.index,
      end: currentMatch.index + currentMatch[0].length,
      value: currentMatch[0],
      groups: currentMatch.slice(1).map((value, index) => ({
        index: index + 1,
        value: value ?? ''
      }))
    });

    if (matches.length >= EXECUTED_MATCH_LIMIT) {
      matchLimitReached = matcher.exec(sampleText) !== null;
      break;
    }

    if (currentMatch[0].length === 0) {
      matcher.lastIndex += 1;
    }
  }

  const fullMatch = new RegExp(`^(?:${translatedSource})$`, flags).test(sampleText);

  return {
    supported: true,
    translatedPattern: translatedSource,
    flags,
    anyMatch: matches.length > 0,
    fullMatch,
    matches,
    matchLimitReached
  };
}

export function analyzeRegex(input: RegexDraft): RegexProcessorResult {
  const parsed = regexSchema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors = getRegexFieldErrors(parsed.error);
    return {
      state: 'invalid',
      message: 'Fix the highlighted regex inputs before analyzing the pattern.',
      fieldErrors,
      errors: buildErrorList(fieldErrors, parsed.error.issues.map((issue) => issue.message))
    };
  }

  try {
    const tokenization = tokenizePattern(parsed.data.flavor, parsed.data.expression);
    const translation = translateForExecution(parsed.data.flavor, parsed.data.expression, tokenization);
    const summary = summarizePattern(parsed.data.flavor, tokenization.counts);
    const execution = translation.supported
      ? executeMatches(translation.translatedSource, translation.flags, parsed.data.sampleText)
      : {
          supported: false as const,
          unsupportedReason: translation.reason
        };

    return {
      state: 'valid',
      message:
        execution.supported
          ? execution.anyMatch
            ? `Pattern explained and matched against the sample text for ${parsed.data.flavor === 'java' ? 'Java' : 'PL/SQL'}.`
            : `Pattern explained and executed for ${parsed.data.flavor === 'java' ? 'Java' : 'PL/SQL'}, but no sample match was found.`
          : `Pattern explained for ${parsed.data.flavor === 'java' ? 'Java' : 'PL/SQL'}, but exact browser execution is not available.`,
      details: {
        flavor: parsed.data.flavor,
        summary,
        explanation:
          tokenization.explanation.length > 0
            ? tokenization.explanation
            : ['No special tokens were detected, so the pattern behaves like a plain literal match.'],
        warnings: tokenization.warnings,
        execution
      }
    };
  } catch (error) {
    const message =
      error instanceof SyntaxError ? error.message : 'The regex expression could not be analyzed. Check the pattern and try again.';

    return {
      state: 'invalid',
      message: 'Fix the highlighted regex expression before analyzing it.',
      fieldErrors: {
        expression: [message]
      },
      errors: [message]
    };
  }
}
