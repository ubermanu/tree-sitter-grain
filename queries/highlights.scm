[
  "."
  ","
  "="
  "("
  ")"
  "<"
  ">"
  "{"
  "}"
  "["
  "]"
  "=>"
  "->"
] @delimiter

[
  "assert"
  "else"
  "enum"
  "export"
  "fail"
  "from"
  "if"
  "import"
  "let"
  "match"
  "mut"
  "rec"
  "record"
  "type"
  "while"
] @keyword

[
  (true)
  (false)
  (void)
] @constant.builtin

"..." @operator

(ERROR) @error
(number_literal) @number
(string_literal) @string
(escape_sequence) @escape
(comment) @comment
(attribute) @attribute
(variable) @variable
(type) @type
(operator) @operator

(binding var: (identifier) @variable)
(function (identifier) @variable)

(import_statement name: (identifier) @variable)
(enum_definition name: (identifier) @type)
(enum_variant name: (identifier) @constant)
(record_definition name: (identifier) @type)
(record_member name: (identifier) @variable.other.member)
