import "https://unpkg.com/chevrotain/lib/chevrotain.min.js";
const Lexer = chevrotain.Lexer;
const createToken = chevrotain.createToken;
const Parser = chevrotain.EmbeddedActionsParser;

// ----------------- Lexer -----------------
const WhiteSpace = createToken({
  name: "WhiteSpace",
  pattern: / +/,
  label: '" "',
  group: Lexer.SKIPPED,
});
const SpecialWhiteSpace = createToken({
  name: "SpecialWhiteSpace",
  pattern: /[ \t\n]+/,
  group: Lexer.SKIPPED,
});
const LCurly = createToken({ name: "LCurly", pattern: /{/, label: "{" });
const RCurly = createToken({ name: "RCurly", pattern: /}/, label: "}" });
const LRound = createToken({ name: "LRound", pattern: /\(/, label: "(" });
const RRound = createToken({ name: "RRound", pattern: /\)/, label: ")" });
const Pipe = createToken({ name: "Pipe", pattern: /\|/, label: "|" });
const Minus = createToken({ name: "Minus", pattern: /-/, label: "-" });
const Plus = createToken({ name: "Plus", pattern: /\+/, label: "+" });
const StringLiteral = createToken({
  name: "StringLiteral",
  pattern: /"[^\"]*"/,
});
const Or = createToken({ name: "Or", pattern: /OR/ });
const Colon = createToken({ name: "Colon", pattern: /:/, label: ":" });
const Element = createToken({ name: "Element", pattern: /([a-z0-9@\.]+)/i });

let tokens = [
  WhiteSpace,
  SpecialWhiteSpace,
  LCurly,
  RCurly,
  LRound,
  RRound,
  Pipe,
  Minus,
  Plus,
  StringLiteral,
  Or,
  Colon,
  Element,
];

export const FilterLexer = new Lexer(tokens);

// ----------------- Parser -----------------

class FilterParser extends Parser {
  constructor() {
    super(tokens);

    this.RULE("value_out", () => {
      return this.OR([
        {
          ALT: () => {
            const stringLiteral = this.CONSUME(StringLiteral).image;
            return stringLiteral.substr(1, stringLiteral.length - 2);
          },
        },
        {
          ALT: () => {
            return this.SUBRULE(this.key_value);
          },
        },
        {
          ALT: () => {
            return this.CONSUME(Element).image;
          },
        },
        {
          ALT: () => {
            return this.SUBRULE(this.group_out);
          },
        },
      ]);
    });

    this.RULE("set_out", () => {
      var elements = [];
      this.CONSUME(LCurly);
      this.MANY_SEP({
        SEP: Pipe,
        DEF: () => {
          elements.push(this.SUBRULE(this.value_out));
        },
      });
      this.CONSUME(RCurly);
      return elements;
    });

    this.RULE("key_value", () => {
      const key = this.CONSUME(Element);
      this.CONSUME(Colon);
      const value = this.OR([
        {
          ALT: () => {
            return this.SUBRULE(this.value_in);
          },
        },
        {
          ALT: () => {
            return this.SUBRULE(this.set_in);
          },
        },
      ]);
      return { type: "key_value", key: key.image, value: value };
    });

    this.RULE("value_in", () => {
      return this.OR([
        {
          ALT: () => {
            const stringLiteral = this.CONSUME(StringLiteral).image;
            return stringLiteral.substr(1, stringLiteral.length - 2);
          },
        },
        {
          ALT: () => {
            return this.CONSUME(Element).image;
          },
        },
      ]);
    });

    this.RULE("set_in", () => {
      var elements = [];
      this.CONSUME(LCurly);
      this.MANY_SEP({
        SEP: Pipe,
        DEF: () => {
          elements.push(this.SUBRULE(this.value_in));
        },
      });
      this.CONSUME(RCurly);
      return elements;
    });

    this.RULE("group_out", () => {
      this.CONSUME(LRound);
      let elements = this.OR([
        {
          ALT: () => {
            return this.SUBRULE(this.set_out);
          },
        },
        {
          ALT: () => {
            return this.SUBRULE(this.value_out);
          },
        },
      ]);
      let except = this.OPTION(() => {
        this.CONSUME(Minus);
        return this.OR2([
          {
            ALT: () => {
              return this.SUBRULE2(this.set_out);
            },
          },
          {
            ALT: () => {
              return this.SUBRULE2(this.value_out);
            },
          },
        ]);
      });
      this.CONSUME(RRound);
      if (!Array.isArray(elements)) {
        elements = [elements];
      }
      if (!Array.isArray(except)) {
        except = [except];
      }
      return { type: "group_out", elements: elements, except: except };
    });

    this.performSelfAnalysis();
  }
}

export function parse(text) {
  const lexingResult = FilterLexer.tokenize(text);
  parserInstance.input = lexingResult.tokens;
  const result = parserInstance.set_out();
  return {
    parserErrors: parserInstance.errors,
    value: result,
    lexResult: lexingResult,
  };
}

export const parserInstance = new FilterParser();
