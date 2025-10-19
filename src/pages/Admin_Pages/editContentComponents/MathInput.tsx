// editContentComponents/MathInput.tsx
import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Check, Edit } from "lucide-react";
import { MathfieldElement } from "mathlive";

export const extractLatexFromText = (text: string): string => {
  if (!text) return "";
  if (text.startsWith("\\(") && text.endsWith("\\)")) {
    return text.substring(2, text.length - 2);
  }
  return text;
};

export const getDisplayLines = (raw: string): string[] => {
  const unwrapped = extractLatexFromText(raw || "").trim();

  const m = unwrapped.match(/\\displaylines\s*\{([\s\S]*?)\}$/);
  const body = m ? m[1] : unwrapped;

  let lines = body.split(/\\\\/g);

  if (lines.length <= 1) {
    lines = body.split(/\r?\n/g);
  }

  const cleaned = lines
    .map((s) => s.trim())
    .map((s) => {
      const textMatch = s.match(/^\\text\{([\s\S]*?)\}$/);
      return textMatch ? textMatch[1] : s;
    })
    .map((s) => s.replace(/^\{|\}$/g, "").trim())
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
  value, onChange, onSave, onCancel, editing, placeholder = "", className = "",
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
        onChange(`\\(${(evt.target as MathfieldElement).value}\\)`);
      });

      containerRef.current.appendChild(mf);
    }

    const unwrappedValue = extractLatexFromText(value || "");
    if (mathfieldRef.current.value !== unwrappedValue) {
      mathfieldRef.current.value = unwrappedValue;
    }
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
  }, [editing]);

  useEffect(() => {
    if (!mathfieldRef.current || ignoreNextChange.current) {
      ignoreNextChange.current = false;
      return;
    }
    const unwrappedValue = extractLatexFromText(value || "");
    if (mathfieldRef.current.value !== unwrappedValue) {
      mathfieldRef.current.value = unwrappedValue;
    }
  }, [value]);

  return (
    <div className={`relative ${className}`}>
      <div ref={containerRef} />
      {editing && (
        <div className="flex justify-end gap-2 mt-2">
          <Button type="button" size="sm" variant="outline" onClick={onCancel} className="h-8 px-3">Cancel</Button>
          <Button type="button" size="sm" onClick={onSave} className="h-8 px-3 bg-green-500 hover:bg-green-600 text-white">
            <Check size={14} className="mr-1" /> Save
          </Button>
        </div>
      )}
      {!value && !editing && <div className="text-gray-400 italic text-sm">{placeholder}</div>}
    </div>
  );
};