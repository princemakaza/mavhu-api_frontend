// editContentComponents/MathInput.tsx
import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { MathfieldElement } from "mathlive";

/**
 * Encode literal spaces so LaTeX preserves them.
 * We convert every " " to "~" (non-breaking space). This keeps the exact count.
 */
const encodeSpacesForLatex = (s: string) => s.replace(/ /g, "~");

/**
 * Decode LaTeX non-breaking spaces back to literal spaces for editing/view.
 * We preserve runs (~~~ -> "   ").
 */
const decodeSpacesFromLatex = (s: string) => s.replace(/~+/g, (m) => " ".repeat(m.length));

export const extractLatexFromText = (text: string): string => {
  if (!text) return "";
  if (text.startsWith("\\(") && text.endsWith("\\)")) {
    return text.substring(2, text.length - 2);
  }
  return text;
};

export const getDisplayLines = (raw: string): string[] => {
  // Do NOT trim here — we want to keep leading/trailing spaces intact.
  const unwrapped = extractLatexFromText(raw || "");

  // Decode "~" back to spaces so downstream display logic sees the real spacing.
  const decoded = decodeSpacesFromLatex(unwrapped);

  const m = decoded.match(/\\displaylines\s*\{([\s\S]*?)\}$/);
  const body = m ? m[1] : decoded;

  let lines = body.split(/\\\\/g);

  if (lines.length <= 1) {
    lines = body.split(/\r?\n/g);
  }

  const cleaned = lines
    // no trim — preserve leading/trailing spaces on each line
    .map((s) => {
      // If the whole line is \text{...}, show just the body, preserving spaces.
      const textMatch = s.match(/^\\text\{([\s\S]*?)\}$/);
      return textMatch ? textMatch[1] : s;
    })
    // Remove a single leading { or trailing } if they wrap the line, but don't trim away spaces
    .map((s) => s.replace(/^\{/, "").replace(/\}$/, ""))
    // Keep non-empty lines; if you also want to keep blank lines, remove this filter.
    .filter((s) => s.length > 0);

  return cleaned;
};

interface MathInputProps {
  value: string;
  onChange: (value: string) => void;
  onSave?: () => void;
  onCancel?: () => void;
  editing: boolean;
  placeholder?: string;
  className?: string;
}

export const MathInput: React.FC<MathInputProps> = ({
  value,
  onChange,
  onSave,
  onCancel,
  editing,
  placeholder = "",
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mathfieldRef = useRef<MathfieldElement | null>(null);
  const ignoreNextChange = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!mathfieldRef.current) {
      const mf = new MathfieldElement();
      mathfieldRef.current = mf;

      mf.setOptions({
        defaultMode: "math",
        smartMode: true,
        virtualKeyboardMode: "onfocus",
        virtualKeyboards: "all",
        inlineShortcuts: { "++": "\\plus", "->": "\\rightarrow" },
        readOnly: !editing,
        // If your MathLive version supports this option, it helps allow typing literal spaces:
        // @ts-expect-error - tolerate unknown option in some type defs
        ignoreSpacebarInMathMode: false,
      });

      mf.style.width = "100%";
      mf.style.minHeight = !editing ? "auto" : "60px";
      mf.style.padding = !editing ? "0" : "8px";
      mf.style.border = !editing ? "none" : "1px solid #d1d5db";
      mf.style.borderRadius = "6px";
      mf.style.backgroundColor = !editing ? "transparent" : "#fff";

      if (!editing) {
        mf.style.pointerEvents = "none";
        mf.style.cursor = "default";
      }

      mf.addEventListener("input", (evt) => {
        if (!editing) return;
        ignoreNextChange.current = true;

        const raw = (evt.target as MathfieldElement).value;

        // Preserve exact number of spaces by encoding them to "~"
        const preserved = encodeSpacesForLatex(raw);

        onChange(`\\(${preserved}\\)`);
      });

      containerRef.current.appendChild(mf);
    }

    // Push prop value into the mathfield (decode "~" -> spaces for the editor)
    const unwrappedValue = extractLatexFromText(value || "");
    const forEditor = decodeSpacesFromLatex(unwrappedValue);

    if (mathfieldRef.current.value !== forEditor) {
      mathfieldRef.current.value = forEditor;
    }

    // Keep the editor's interactivity styles in sync with `editing`
    mathfieldRef.current.setOptions({ readOnly: !editing });
    mathfieldRef.current.style.pointerEvents = editing ? "auto" : "none";
    mathfieldRef.current.style.backgroundColor = editing ? "#fff" : "transparent";
    mathfieldRef.current.style.minHeight = editing ? "60px" : "auto";
    mathfieldRef.current.style.padding = editing ? "8px" : "0";
    mathfieldRef.current.style.border = editing ? "1px solid #d1d5db" : "none";

    return () => {
      if (mathfieldRef.current) {
        mathfieldRef.current.remove();
        mathfieldRef.current = null;
      }
    };
  }, [editing]); // re-run when editing toggles

  useEffect(() => {
    if (!mathfieldRef.current || ignoreNextChange.current) {
      ignoreNextChange.current = false;
      return;
    }
    // When `value` changes from the outside, decode "~" before showing in the editor
    const unwrappedValue = extractLatexFromText(value || "");
    const forEditor = decodeSpacesFromLatex(unwrappedValue);

    if (mathfieldRef.current.value !== forEditor) {
      mathfieldRef.current.value = forEditor;
    }
  }, [value]);

  return (
    <div className={`relative ${className}`}>
      <div ref={containerRef} />
      {editing && (
        <div className="flex justify-end gap-2 mt-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onCancel}
            className="h-8 px-3"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onSave}
            className="h-8 px-3 bg-green-500 hover:bg-green-600 text-white"
          >
            <Check size={14} className="mr-1" /> Save
          </Button>
        </div>
      )}
      {!value && !editing && (
        <div className="text-gray-400 italic text-sm">{placeholder}</div>
      )}
    </div>
  );
};
