// CodeMirror 6 wrapper — loads from esm.sh CDN as a single dependency.
// Provides setup, language switching, and starter-code generation per language.
//
// Every package pins ?deps=@codemirror/state@6.4.1 so they all share the same
// state-module instance. Without this, lang-rust/lang-go pull their own copy
// and Compartment instanceof checks fail at runtime.

import { EditorView, basicSetup } from "https://esm.sh/codemirror@6.0.1?deps=@codemirror/state@6.4.1";
import { EditorState, Compartment } from "https://esm.sh/@codemirror/state@6.4.1";
import { javascript } from "https://esm.sh/@codemirror/lang-javascript@6.2.2?deps=@codemirror/state@6.4.1";
import { rust } from "https://esm.sh/@codemirror/lang-rust@6.0.1?deps=@codemirror/state@6.4.1";
import { go } from "https://esm.sh/@codemirror/lang-go@6.0.1?deps=@codemirror/state@6.4.1";
import { oneDark } from "https://esm.sh/@codemirror/theme-one-dark@6.1.2?deps=@codemirror/state@6.4.1";

const langSupport = {
  javascript: javascript(),
  rust: rust(),
  go: go(),
};

export class CodeEditor {
  constructor(parent, { lang = "javascript", code = "", onChange } = {}) {
    this.parent = parent;
    this.langCompartment = new Compartment();
    this.onChange = onChange;
    this._suppressOnChange = false;

    this.view = new EditorView({
      doc: code,
      parent,
      extensions: [
        basicSetup,
        oneDark,
        this.langCompartment.of(langSupport[lang]),
        EditorView.updateListener.of((u) => {
          if (u.docChanged && this.onChange && !this._suppressOnChange) {
            this.onChange(u.state.doc.toString());
          }
        }),
        EditorView.theme({
          "&": { fontSize: "13px", height: "100%" },
          ".cm-scroller": { fontFamily: "ui-monospace, 'SF Mono', Consolas, Menlo, monospace" },
        }),
      ],
    });

    // Expose the CodeMirror view for E2E testing — tests need to set the
    // editor contents programmatically. Harmless in normal use.
    if (typeof window !== "undefined") {
      window.__algotutor_cm_view = this.view;
      window.__algotutor_editor = this;
    }
  }

  setLanguage(lang) {
    this.view.dispatch({
      effects: this.langCompartment.reconfigure(langSupport[lang] || javascript()),
    });
  }

  setCode(code) {
    this._suppressOnChange = true;
    try {
      this.view.dispatch({
        changes: { from: 0, to: this.view.state.doc.length, insert: code },
      });
    } finally {
      this._suppressOnChange = false;
    }
  }

  getCode() {
    return this.view.state.doc.toString();
  }
}

// ---- Starter code generator ----

function paramListJs(params) { return params.map((p) => p.name).join(", "); }

function paramListRust(codeTypes) {
  return (codeTypes?.params || []).map((p) => `${p.name}: ${p.type}`).join(", ");
}

function paramListGo(codeTypes) {
  return (codeTypes?.params || []).map((p) => `${p.name} ${p.type}`).join(", ");
}

function rustReturnSuffix(returns) {
  if (!returns || returns === "()" || returns === "") return "";
  return ` -> ${returns}`;
}

function goReturnSuffix(returns) {
  if (!returns || returns === "") return "";
  return ` ${returns}`;
}

function rustReturnBody(returns) {
  if (!returns || returns === "()" || returns === "") return "";
  return "    todo!()\n";
}

function goReturnBody(returns) {
  if (!returns || returns === "") return "";
  // Default zero literal
  if (returns === "int" || returns === "int64" || returns === "int32") return "    return 0\n";
  if (returns === "float64" || returns === "float32") return "    return 0.0\n";
  if (returns === "string") return `    return ""\n`;
  if (returns === "bool") return "    return false\n";
  if (returns === "byte" || returns === "rune") return "    return 0\n";
  if (returns.startsWith("[]") || returns.startsWith("*") || returns.startsWith("map[")) return "    return nil\n";
  return `    var zero ${returns}\n    return zero\n`;
}

function starterFunctionJs(signature) {
  const fn = signature.fn;
  const params = signature.params || [];
  return `function ${fn}(${paramListJs(params)}) {\n  // Your code here\n  \n}\n`;
}

function starterFunctionRust(signature) {
  const fn = signature.fn;
  const ct = signature.codeTypes?.rust;
  if (!ct) return `// Rust signature unavailable for this problem.\nfn ${fn}() { todo!() }\n`;
  return `fn ${fn}(${paramListRust(ct)})${rustReturnSuffix(ct.returns)} {\n    // Your code here\n${rustReturnBody(ct.returns)}}\n`;
}

function starterFunctionGo(signature) {
  const fn = signature.fn;
  const ct = signature.codeTypes?.go;
  if (!ct) return `// Go signature unavailable for this problem.\nfunc ${fn}() {}\n`;
  return `func ${fn}(${paramListGo(ct)})${goReturnSuffix(ct.returns)} {\n    // Your code here\n${goReturnBody(ct.returns)}}\n`;
}

function starterDesignJs(signature) {
  const d = signature.design;
  const className = d.className;
  const ctorParams = (d.ctor?.params || []).map((p) => p.name).join(", ");
  const methods = (d.methods || []).map((m) => {
    const ps = m.params.map((p) => p.name).join(", ");
    return `  ${m.name}(${ps}) {\n    // Your code here\n  }`;
  }).join("\n\n");
  return `class ${className} {\n  constructor(${ctorParams}) {\n    // Initialize\n  }\n\n${methods}\n}\n`;
}

function starterDesignRust(signature) {
  const d = signature.design;
  const className = d.className;
  const ctorParams = (d.ctor?.params || []).map((p) => `${p.name}: ${p.type.rust}`).join(", ");
  const methods = (d.methods || []).map((m) => {
    const ps = m.params.map((p) => `${p.name}: ${p.type.rust}`).join(", ");
    const ret = m.returns?.rust;
    const retSuffix = rustReturnSuffix(ret);
    const retBody = rustReturnBody(ret);
    const psPrefix = ps ? `, ${ps}` : "";
    return `    pub fn ${m.name}(&mut self${psPrefix})${retSuffix} {\n        // Your code here\n${retBody}    }`;
  }).join("\n\n");
  return `pub struct ${className} {\n    // Fields\n}\n\nimpl ${className} {\n    pub fn new(${ctorParams}) -> Self {\n        ${className} {}\n    }\n\n${methods}\n}\n`;
}

function starterDesignGo(signature) {
  const d = signature.design;
  const className = d.className;
  const ctorParams = (d.ctor?.params || []).map((p) => `${p.name} ${p.type.go}`).join(", ");
  const methods = (d.methods || []).map((m) => {
    const ps = m.params.map((p) => `${p.name} ${p.type.go}`).join(", ");
    const ret = m.returns?.go || "";
    const retSuffix = goReturnSuffix(ret);
    const retBody = goReturnBody(ret);
    return `func (this *${className}) ${m.name}(${ps})${retSuffix} {\n    // Your code here\n${retBody}}`;
  }).join("\n\n");
  return `type ${className} struct {\n    // Fields\n}\n\nfunc Constructor(${ctorParams}) ${className} {\n    return ${className}{}\n}\n\n${methods}\n`;
}

export function starterCode(signature, lang) {
  const kind = signature.kind || "function";
  if (kind === "design" || kind === "codec-roundtrip") {
    if (lang === "javascript") return starterDesignJs(signature);
    if (lang === "rust") return starterDesignRust(signature);
    if (lang === "go") return starterDesignGo(signature);
    return "";
  }
  if (lang === "javascript") return starterFunctionJs(signature);
  if (lang === "rust") return starterFunctionRust(signature);
  if (lang === "go") return starterFunctionGo(signature);
  return "";
}
