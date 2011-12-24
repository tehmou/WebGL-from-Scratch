start = __ tags:Tag* __ { return tags.join("\n"); }

Tag
  = _ "<" "/"? name:Identifier attrs:(!">" .)* ">" { return attrs.map(function (o) { return o.join(""); }).join(""); }



Identifier
  = [a-zA-Z]*
  
// Separator, Space
Zs = [\u0020\u00A0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000]

LineTerminatorSequence "end of line"
  = "\n"
  / "\r\n"
  / "\r"
  / "\u2028" // line spearator
  / "\u2029" // paragraph separator

WhiteSpace "whitespace"
  = [\t\v\f \u00A0\uFEFF]
  / Zs
  / LineTerminatorSequence

Comment "comment"
  = "<!--" (!"-->" .)* "-->"
  / "<!" (!">" .)* ">"

_
  = (WhiteSpace / Comment / !"<" .)*

__
  = (WhiteSpace / Comment)*