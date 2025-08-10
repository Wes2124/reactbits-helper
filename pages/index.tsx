import React, { useMemo, useState } from "react";
import * as RB from "reactbits";

type AnyComp = React.ComponentType<any> | undefined;

/**
 * Minimal ErrorBoundary to prevent a single broken component from crashing the whole preview.
 */
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any, info: any) {
    // could log to monitoring here
    console.error("Component preview error:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: "#94a3b8", padding: 20 }}>
          This component threw an error when rendering — preview unavailable.
        </div>
      );
    }
    return this.props.children;
  }
}

export default function Home() {
  const allNames = useMemo(() => Object.keys(RB).sort(), []);
  const [selected, setSelected] = useState<string>(allNames[0] || "");
  const [copied, setCopied] = useState(false);

  const SelectedComponent: AnyComp = (RB as any)[selected];

  const codeSnippet = (name: string) => {
    const compName = name;
    return `// Integration snippet for Next.js + TypeScript
// 1) Install:
npm install reactbits

// 2) Add to your global CSS (e.g. app/globals.css or styles/globals.css):
@import "reactbits/styles.css";

// 3) Create a component file components/${compName}.tsx:

import { ${compName} } from "reactbits";
export default function ${compName}Comp() {
  return (
    <div style={{ position: "relative", width: "100%", height: "100vh", background: "black" }}>
      <${compName} />
      <div style={{ position: "relative", zIndex: 10, color: "white", padding: 20 }}>
        <h1>${compName} preview</h1>
      </div>
    </div>
  );
}

// 4) Use it on a page:
import ${compName}Comp from "@/components/${compName}";
export default function Page() {
  return <${compName}Comp />;
}
`;
  };

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(codeSnippet(selected));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (e) {
      console.error("copy failed", e);
    }
  }

  return (
    <div className="container">
      <div className="header">
        <div className="title">ReactBits Helper — bundled</div>
        <div style={{ marginLeft: "auto", color: "var(--muted)" }}>
          Displays all exports from <code>reactbits</code>
        </div>
      </div>

      <div className="controls">
        <select
          className="select"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          {allNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        <button className="button" onClick={handleCopy}>
          {copied ? "Copied ✓" : "Copy integration snippet"}
        </button>
      </div>

      <div className="preview" aria-live="polite">
        <ErrorBoundary>
          {SelectedComponent ? (
            <div style={{ position: "relative", width: "100%", height: "100%" }}>
              <SelectedComponent />
            </div>
          ) : (
            <div style={{ color: "var(--muted)" }}>Component not available</div>
          )}
        </ErrorBoundary>
      </div>

      <div className="info">
        <strong style={{ color: "white" }}>Selected:</strong> {selected} —{" "}
        <span style={{ color: "var(--muted)" }}>{SelectedComponent ? "rendered" : "not found"}</span>
      </div>

      <textarea className="code" readOnly value={codeSnippet(selected)} />
    </div>
  );
}
