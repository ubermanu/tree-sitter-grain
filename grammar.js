module.exports = grammar({
  name: 'grain',

  extras: $ => [
    /\s|\n|\r/,
    $.comment,
  ],

  inline: $ => [ $._statement ],

  word: $ => $.identifier,

  rules: {
    source_file: $ => seq(
      repeat($._statement)
    ),

    _statement: $ => choice(
      $.assert,
      $.assign_statement,
      $.import_statement,
      $.call_expression,
      $.fail,
      $.while_statement,
      $._definition,
    ),

    _definition: $ => choice(
      seq(optional('export'), $.let_statement),
      commaSep1(seq(
        optional('export'),
        choice(
          $.enum_definition,
          $.record_definition,
          $.type_definition,
        )
      ))
    ),

    // statements

    // TODO: Handle deconstructed imports
    import_statement: $ => seq(
        'import',
        field('name', $.identifier),
        'from',
        field('path', $.string_literal),
    ),

    if_statement: $ => seq(
        'if',
        '(',
        $._expression,
        ')',
        $._expression,
        optional(seq(
            'else',
            $._expression
        ))
    ),

    assert: $ => seq('assert', $._expression),
    fail: $ => seq('fail', $._expression),

    assign_statement: $ => prec(2, seq(
      $.variable,
      optional($.operator),
      '=',
      $._expression,
    )),

    let_statement: $ => seq(
      'let',
      optional(choice('mut', 'rec')),
      commaSep1($.binding),
    ),

    binding: $ => seq(
      field('var', $.identifier),
      '=',
      field('expr', $._expression)
    ),

    while_statement: $ => seq('while', '(', $._expression, ')', $._expression),

    // types

    enum_definition: $ => seq(
      'enum',
      field('name', $.identifier),
      '{', commaSep($.enum_variant), '}',
    ),

    enum_variant: $ => seq(
      field('name', $.identifier),
      optional(seq('(', commaSep($.type), ')',))
      // TODO record-like enum variants
    ),

    function_type: $ => seq(
      seq('(', commaSep($.type), ')'),
      '->',
      $.type,
    ),

    record_definition: $ => seq(
      'record',
      field('name', $.identifier),
      '{', commaSep($.record_member), '}',
    ),

    record_member: $ => seq(
      optional('mut'),
      field('name', $.identifier),
      ':',
      $.type,
    ),

    type_definition: $ => seq('type', field('type', $.identifier), '=', $.type),

    type: $ => choice(
      $.function_type,
      seq(
        dotSep1($.identifier),
        optional(seq(
          '<', commaSep($.type), '>',
        ))
      )
    ),

    _expression: $ => prec.left(1, choice(
      $.function,
      $.list,
      $.binary_expression,
      $.call_expression,
      $.true,
      $.false,
      $.void,
      $.number_literal,
      $.string_literal,
      $.match_expression,
      $.block,
      $.variable,
    )),

    binary_expression: $ => prec.left(seq(
      $._expression,
      $.operator,
      $._expression,
    )),

    operator: $ => choice(
      '&&','||',
      '&','|','^', '<<', '>>',
      '==', '!=', '<', '<=', '>', '>=',
      '+', '-', '*', '/', '++', '%',
    ),

    block: $ => seq(
      '{',
      repeat($._statement),
      optional($._expression),
      '}',
    ),

    function: $ => prec.left(seq(
      seq('(', commaSep($.identifier), ')'),
      '=>',
      $._expression,
    )),

    list: $ => seq(
      '[',
      commaSep($._expression),
      optional(seq('...', $._expression)),
      ']',
    ),

    call_expression: $ => seq($.variable, $.argument_list),
    argument_list: $ => seq('(', commaSep($._expression), ')'),
    attribute: $ => $.identifier,
    variable: $ => seq($.identifier, repeat(seq(".", $.attribute))),
    identifier: $ => /[a-zA-Z_]\w*/,

    match_expression: $ => seq(
      'match', '(', $._expression, ')',
      '{', repeat($.match_case), '}',
    ),

    match_case: $ => seq(
      $._expression, // TODO pattern matching
      '=>',
      $._expression,
    ),

    // literals
    true: $ => 'true',
    false: $ => 'false',
    void: $ => 'void',

    number_literal: $ => /[0-9]+/,

    string_literal: $ => seq(
      '"',
      repeat(choice(
        token.immediate(prec(1, /[^\\"\n]+/)),
        $.escape_sequence,
      )),
      '"',
    ),

    escape_sequence: $ => token.immediate(seq(
      '\\',
      choice(
        /[^xu]/,
        /u[0-9a-fA-F]{4}/,
        /u{[0-9a-fA-F]+}/,
        /x[0-9a-fA-F]{2}/,
      )
    )),

    // comments
    comment: $ => token(choice(
      seq('//', /(\\(.|\r?\n)|[^\\\n])*/),
      seq(
        '/*',
        /[^*]*\*+([^/*][^*]*\*+)*/,
        '/'
      )
    )),
  }
});

function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)))
}

function commaSep(rule) {
  return optional(commaSep1(rule))
}

function dotSep1(rule) {
  return seq(rule, repeat(seq('.', rule)))
}

function dotSep(rule) {
  return optional(dotSep1(rule))
}
