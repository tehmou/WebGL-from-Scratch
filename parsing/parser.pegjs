grammar
  = __ initializer:initializer? rules:rule+ {
      return initializer + rules.join("\n\n");
    }

initializer
  = code:action semicolon:semicolon? {
      return code + semicolon;
    }

rule
  = name:identifier displayName:string? equals expression:expression semicolon:semicolon? {
      return name + " " + displayName + "\n  = " + expression + semicolon;
    }

expression
  = choice

choice
  = head:sequence tail:(slashSequence)* {
      return head + (tail ? "  " : "") + tail.join("  ");
    }

slashSequence
  = slash sequence:sequence {
      return "\n  / " + sequence;
    }

sequence
  = elements:labeled* code:action {
      return elements.join(" ") + " " + code;
    }
  / elements:labeled* {
      return elements.join(" ");
    }

labeled
  = label:identifier colon expression:prefixed {
      return label + ":" + expression;
    }
  / prefixed

prefixed
  = and code:action {
      return "& " + code;
    }
  / and expression:suffixed {
      return "& " + expression;
    }
  / not code:action {
      return "! " + code;
    }
  / not expression:suffixed {
      return "! " + expression;
    }
  / suffixed

suffixed
  = expression:primary question {
      return expression + "?";
    }
  / expression:primary star {
      return expression + "*";
    }
  / expression:primary plus {
      return expression + "+";
    }
  / primary

primary
  = name:identifier !(string? equals) {
      return name;
    }
  / literal
  / dot
  / class
  / lparen expression:expression rparen { return "( " + expression + " )"; }

/* "Lexical" elements */

action "action"
  = braced:braced __ { return braced; }

braced
  = "{" parts:(braced / nonBraceCharacter)* "}" {
      return "{" + parts.join("") + "}";
    }

nonBraceCharacters
  = chars:nonBraceCharacter+ { return chars.join(""); }

nonBraceCharacter
  = [^{}]

equals = "=" __ { return "="; }
colon = ":" __ { return ":"; }
semicolon = ";" __ { return ";"; }
slash = "/" __ { return "/"; }
and = "&" __ { return "&"; }
not = "!" __ { return "!"; }
question = "?" __ { return "?"; }
star = "*" __ { return "*"; }
plus = "+" __ { return "+"; }
lparen = "(" __ { return "("; }
rparen = ")" __ { return ")"; }
dot = "." __ { return "."; }

/*
 * Modelled after ECMA-262, 5th ed., 7.6, but much simplified:
 *
 * * no Unicode escape sequences
 *
 * * "Unicode combining marks" and "Unicode connection punctuation" can't be
 * part of the identifier
 *
 * * only [a-zA-Z] is considered a "Unicode letter"
 *
 * * only [0-9] is considered a "Unicode digit"
 *
 * The simplifications were made just to make the implementation little bit
 * easier, there is no "philosophical" reason behind them.
 */
identifier "identifier"
  = head:(letter / "_" / "$") tail:(letter / digit / "_" / "$")* __ {
      return head + tail.join("");
    }

/*
 * Modelled after ECMA-262, 5th ed., 7.8.4. (syntax & semantics, rules only
 * vaguely).
 */
literal "literal"
  = value:(doubleQuotedString / singleQuotedString) flags:"i"? __ {
      return value + flags;
    }

string "string"
  = string:(doubleQuotedString / singleQuotedString) __ { return string; }

doubleQuotedString
  = '"' chars:doubleQuotedCharacter* '"' { return "\"" + chars.join("") + "\""; }

doubleQuotedCharacter
  = simpleDoubleQuotedCharacter
  / simpleEscapeSequence
  / zeroEscapeSequence
  / hexEscapeSequence
  / unicodeEscapeSequence
  / eolEscapeSequence

simpleDoubleQuotedCharacter
  = !('"' / "\\" / eolChar) char_:. { return char_; }

singleQuotedString
  = "'" chars:singleQuotedCharacter* "'" { return "'" + chars.join("") + "'"; }

singleQuotedCharacter
  = simpleSingleQuotedCharacter
  / simpleEscapeSequence
  / zeroEscapeSequence
  / hexEscapeSequence
  / unicodeEscapeSequence
  / eolEscapeSequence

simpleSingleQuotedCharacter
  = !("'" / "\\" / eolChar) char_:. { return char_; }

class "character class"
  = "[" inverted:"^"? parts:(classCharacterRange / classCharacter)* "]" flags:"i"? __ {
      return "[" + inverted + map(parts, function(part) { return part.rawText; }).join("") + "]" + flags;
    }

classCharacterRange
  = begin:classCharacter "-" end:classCharacter {
      return begin + "-" + end;
    }

classCharacter
  = char_:bracketDelimitedCharacter

bracketDelimitedCharacter
  = simpleBracketDelimitedCharacter
  / simpleEscapeSequence
  / zeroEscapeSequence
  / hexEscapeSequence
  / unicodeEscapeSequence
  / eolEscapeSequence

simpleBracketDelimitedCharacter
  = !("]" / "\\" / eolChar) char_:. { return char_; }

simpleEscapeSequence
  = "\\" !(digit / "x" / "u" / eolChar) char_:. {
      return "\\" + char_
    }

zeroEscapeSequence
  = "\\0" !digit { return "\\0"; }

hexEscapeSequence
  = "\\x" h1:hexDigit h2:hexDigit {
      return "\\x" + h1 + h2;
    }

unicodeEscapeSequence
  = "\\u" h1:hexDigit h2:hexDigit h3:hexDigit h4:hexDigit {
      return "\\u" + h1 + h2 + h3 + h4;
    }

eolEscapeSequence
  = "\\" eol:eol { return "\\" + eol; }

digit
  = [0-9]

hexDigit
  = [0-9a-fA-F]

letter
  = lowerCaseLetter
  / upperCaseLetter

lowerCaseLetter
  = [a-z]

upperCaseLetter
  = [A-Z]

__ = (whitespace / eol / comment)*

/* Modelled after ECMA-262, 5th ed., 7.4. */
comment "comment"
  = singleLineComment
  / multiLineComment

singleLineComment
  = "//" comment:(!eolChar .)*

multiLineComment
  = "/*" (!"*/" .)* "*/"

/* Modelled after ECMA-262, 5th ed., 7.3. */
eol "end of line"
  = "\n"
  / "\r\n"
  / "\r"
  / "\u2028"
  / "\u2029"

eolChar
  = [\n\r\u2028\u2029]

/* Modelled after ECMA-262, 5th ed., 7.2. */
whitespace "whitespace"
  = [ \t\v\f\u00A0\uFEFF\u1680\u180E\u2000-\u200A\u202F\u205F\u3000]