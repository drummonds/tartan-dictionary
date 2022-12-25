---
title: "EBNF Extended Backus Naur Format"
date: "2022-10-07"
tags:
  - EBNF
---

EBNF is a way of describe grammars which is useful for precisely describing the formats of things.

I was introduced to it in the diagrams of Nicklaus Wirth's book on Pascal where he elegantly defines a language and its syntax.

I am going to start with the definition of EBNF in EBNF in a [go parser][]

[go parser]: https://pkg.go.dev/golang.org/x/exp/ebnf

Package ebnf is a library for EBNF grammars. The input is text ([]byte) satisfying the following grammar (represented itself in EBNF):

```ebnf
Production  = name "=" [ Expression ] "." .
Expression  = Alternative { "|" Alternative } .
Alternative = Term { Term } .
Term        = name | token [ "…" token ] | Group | Option | Repetition .
Group       = "(" Expression ")" .
Option      = "[" Expression "]" .
Repetition  = "{" Expression "}" .
```

A name is a Go identifier, a token is a Go string, and comments and white space follow the same rules as for the Go language. Production names starting with an uppercase Unicode letter denote non-terminal productions (i.e., productions which allow white-space and comments between tokens); all other production names denote lexical productions.

From [Wikipedia Wirth's 1977 extension][2] written in itself is here:

[2]: https://en.wikipedia.org/wiki/Wirth_syntax_notation

    SYNTAX     = { PRODUCTION } .
    PRODUCTION = IDENTIFIER "=" EXPRESSION "." .
    EXPRESSION = TERM { "|" TERM } .
    TERM       = FACTOR { FACTOR } .
    FACTOR     = IDENTIFIER
            | LITERAL
            | "[" EXPRESSION "]"
            | "(" EXPRESSION ")"
            | "{" EXPRESSION "}" .
    IDENTIFIER = letter { letter } .
    LITERAL    = """" character { character } """" .

The Wirth Syntax notation leaves out some of the boring detail which might be language specific. This is also the bit that gets tricky with Unicode eg delineating white space:

```wsn
 digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" .
 upper-case = "A" | "B" | … | "Y" | "Z" .
 lower-case = "a" | "b" | … | "y" | "z" .
 letter = upper-case | lower-case .
```

## Backus–Naur form

The BNF form was used by Wirth for Pascal before he revised it.

```bnf
<syntax>         ::= <rule> | <rule> <syntax>
 <rule>           ::= <opt-whitespace> "<" <rule-name> ">" <opt-whitespace> "::=" <opt-whitespace> <expression> <line-end>
 <opt-whitespace> ::= " " <opt-whitespace> | ""
 <expression>     ::= <list> | <list> <opt-whitespace> "|" <opt-whitespace> <expression>
 <line-end>       ::= <opt-whitespace> <EOL> | <line-end> <line-end>
 <list>           ::= <term> | <term> <opt-whitespace> <list>
 <term>           ::= <literal> | "<" <rule-name> ">"
 <literal>        ::= '"' <text1> '"' | "'" <text2> "'"
 <text1>          ::= "" | <character1> <text1>
 <text2>          ::= '' | <character2> <text2>
 <character>      ::= <letter> | <digit> | <symbol>
 <letter>         ::= "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M" | "N" | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "W" | "X" | "Y" | "Z" | "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l" | "m" | "n" | "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v" | "w" | "x" | "y" | "z"
 <digit>          ::= "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
 <symbol>         ::=  "|" | " " | "!" | "#" | "$" | "%" | "&" | "(" | ")" | "*" | "+" | "," | "-" | "." | "/" | ":" | ";" | ">" | "=" | "<" | "?" | "@" | "[" | "\" | "]" | "^" | "_" | "`" | "{" | "}" | "~"
 <character1>     ::= <character> | "'"
 <character2>     ::= <character> | '"'
 <rule-name>      ::= <letter> | <rule-name> <rule-char>
 <rule-char>      ::= <letter> | <digit> | "-"
```

The Wikipedia article has a great recasting of this into WSN, which greatly simplifies it and removes extraneous detail:

```wsn
 syntax         = rule [ syntax ] .
 rule           = opt-whitespace "<" rule-name ">" opt-whitespace "::="
                  opt-whitespace expression line-end .
 opt-whitespace = { " " } .
 expression     = list [ "|" expression ] .
 line-end       = opt-whitespace EOL | line-end line-end .
 list           = term [ opt-whitespace list ] .
 term           = literal | "<" rule-name ">" .
 literal        = """" text """" | "'" text "'" .

```

## [ISO standard EBNF][]

[iso standard ebnf]: https://www.iso.org/standard/26153.html

There seems controversy over the ISO standard version of EBNF. One of the nice things about the standard is
that it provides both formal (longer) and informal definitions in themselves. The informal definition is here and it does seem a mess:

```ebnf
SYNTAX = SYNTAX RULE, (: SYNTAX RULE :).
SYNTAX RULE = META IDENTIFIER, '=', DEFINITIONS LIST, '.'.
DEFINITIONS LIST = SINGLE DEFINITION, (: '/', SINGLE DEFINITION :).
SINGLE DEFINITION = TERM, (: ',' TERM :).
TERM = FACTOR, (/ '-', EXCEPTION /).
EXCEPTION = FACTOR.
FACTOR = (/ INTEGER, '*' /), PRIMARY.
PRIMARY = OPTIONAL SEQUENCE / REPEATED SEQUENCE / SPECIAL SEQUENCE / GROUPED SEQUENCE / META IDENTIFIER / TERMINAL / EMPTY.
EMPTY = .
OPTIONAL SEQUENCE = '(/', DEFINITIONS LIST, '/)'.
REPEATED SEQUENCE = '(:', DEFINITIONS LIST, ':)'.
GROUPED SEQUENCE = '(', DEFINITIONS LIST, ')'.
TERMINAL= "'" , CHARACTER - "'", (: CHARACTER - "'" :), "'" / '"' , CHARACTER - '"', (: CHARACTER - '"' :), '"' .
META IDENTIFIER = LETTER, (: LETTER / DIGIT :).
INTEGER = DIGIT, (: DIGIT :).
SPECIAL SEQUENCE = '?', (: CHARACTER - '?' :), '?'.
COMMENT = '(*', (: COMMENT SYMBOL :), '*)'.
COMMENT SYMBOL = COMMENT / TERMINAL / SPECIAL SEQUENCE / CHARACTER/
```

The extra symbols and brackets eg { to (:, using white space in tokens and changing the
default optionality | to / seems wrong. As does duplication like defining an exception as a factor. It also lacks support for Unicode.

It does also point to using succinctness that you get from a non formal system. Over specification leads to
complexity. In the go version this is done by using go definitions of white space and
tokens rather than respecifying them.

## [IETF XML][]

The XML standard reverts to BNF form for specifying rules as ::=. There is a lot of detail about using regex's for
character mapping.

Note that [IETF RFC5234][] uses a quite a different family of rules which are not considered here.

[ietf xml]: https://www.w3.org/TR/REC-xml/#sec-notation

[IETF RFC5234]https://datatracker.ietf.org/doc/html/rfc5234
This describes an ABNF, I have abbreviated here to eliminate some of the lower level tokenisation rules

Name changes

| Go         | Wirth  |
| ---------- | ------ |
|   | SYNTAX | 
| PRODUCTION | SYNTAX |
