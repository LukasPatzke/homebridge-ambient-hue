import "ace-builds/src-noconflict/mode-text";

export class CustomHighlightRules extends window.ace.acequire(
  "ace/mode/text_highlight_rules"
).TextHighlightRules {
  constructor() {
    super();
    this.$rules = {
        start : [ {
                token : "support.function",
                regex : "{item}|{id}|{name}|{type}|{on}"
            },  {
                token : "text",
                regex : "\\s+"
            } 
        ]
    };
  }
}

export default class CustomTextMode extends window.ace.acequire("ace/mode/text")
  .Mode {
  constructor() {
    super();
    this.HighlightRules = CustomHighlightRules;
  }
}
