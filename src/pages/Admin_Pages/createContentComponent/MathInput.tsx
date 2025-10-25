import React, { useEffect, useRef, useState } from "react";
import { MathfieldElement } from "mathlive";
import { extractLatexFromText, TimingPoint } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Clock } from "lucide-react";

interface MathInputProps {
  value: string;
  onChange: (value: string) => void;
  onSave?: () => void;
  onCancel?: () => void;
  editing: boolean;
  placeholder?: string;
  className?: string;
  // NEW: Timing functionality
  enableTiming?: boolean;
  timings?: TimingPoint[];
  onTimingsChange?: (timings: TimingPoint[]) => void;
}

const MathInput: React.FC<MathInputProps> = ({
  value,
  onChange,
  onSave,
  onCancel,
  editing,
  placeholder = "",
  className = "",
  enableTiming = false,
  timings = [],
  onTimingsChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mathfieldRef = useRef<MathfieldElement | null>(null);
  const ignoreNextChange = useRef(false);
  const [showTimingInput, setShowTimingInput] = useState(false);

  // Create the mathfield once; destroy on unmount
  useEffect(() => {
    if (!containerRef.current || mathfieldRef.current) return;

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
    mf.tabIndex = 0; // ensure it can take focus
    containerRef.current.appendChild(mf);

    // Upstream change propagation (wrap with \( ... \))
    const onInput = (evt: Event) => {
      if (!editing) return;
      ignoreNextChange.current = true;
      onChange(`\\(${(evt.target as MathfieldElement).value}\\)`);
    };
    mf.addEventListener("input", onInput);

    return () => {
      mf.removeEventListener("input", onInput);
      mf.remove();
      mathfieldRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep value in sync
  useEffect(() => {
    const mf = mathfieldRef.current;
    if (!mf) return;
    if (ignoreNextChange.current) {
      ignoreNextChange.current = false;
      return;
    }
    const unwrappedValue = extractLatexFromText(value || "");
    if (mf.value !== unwrappedValue) mf.value = unwrappedValue;
  }, [value]);

  // Attach/detach space & paste interceptors ONLY while editing
  useEffect(() => {
    const mf = mathfieldRef.current;
    if (!mf) return;

    // Visual + readonly state
    mf.setOptions({ readOnly: !editing });
    mf.style.pointerEvents = editing ? "auto" : "none";
    mf.style.backgroundColor = editing ? "#fff" : "transparent";
    mf.style.minHeight = editing ? "60px" : "auto";
    mf.style.padding = editing ? "8px" : "0";
    mf.style.border = editing ? "1px solid #d1d5db" : "none";
    mf.style.borderRadius = editing ? "6px" : "0";
    mf.style.cursor = editing ? "text" : "default";

    if (!editing) {
      // ensure no interceptors are active when not editing
      return;
    }

    // Focus when entering edit mode
    setTimeout(() => mf.focus(), 0);

    // === Choose how "one space" should render ===
    // const SPACE_TOKEN = "\\hspace{0.5em}"; // approx normal space
    // const SPACE_TOKEN = "\\;";             // thick space
    const SPACE_TOKEN = "\\,";                // thin space (default)

    // Helper to insert LaTeX across MathLive versions
    const insertLatex = (latex: string) => {
      const anyMf = mf as any;
      if (typeof anyMf.executeCommand === "function") {
        anyMf.executeCommand(["insert", latex]);
      } else if (typeof anyMf.insert === "function") {
        anyMf.insert(latex);
      } else {
        mf.value = (mf.value || "") + latex;
      }
    };

    // Keydown: turn EACH Space press into a LaTeX spacing atom
    const onKeyDown = (e: KeyboardEvent) => {
      const isSpace =
        e.key === " " || e.code === "Space" || (e as any).key === "Spacebar";
      if (isSpace) {
        e.preventDefault();
        insertLatex(SPACE_TOKEN);
      }
    };

    // beforeinput: convert space characters from IME/text insertion
    const onBeforeInput = (e: InputEvent) => {
      if (e.inputType === "insertText" && typeof e.data === "string" && e.data.includes(" ")) {
        e.preventDefault();
        insertLatex(e.data.replace(/ /g, SPACE_TOKEN));
      }
    };

    // paste: convert all spaces in pasted text
    const onPaste = (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData("text") ?? "";
      if (text && text.includes(" ")) {
        e.preventDefault();
        insertLatex(text.replace(/ /g, SPACE_TOKEN));
      }
    };

    mf.addEventListener("keydown", onKeyDown);
    mf.addEventListener("beforeinput", onBeforeInput as any);
    mf.addEventListener("paste", onPaste);

    // Cleanup when editing turns off (or on unmount)
    return () => {
      mf.removeEventListener("keydown", onKeyDown);
      mf.removeEventListener("beforeinput", onBeforeInput as any);
      mf.removeEventListener("paste", onPaste);
    };
  }, [editing]);

  // Split text by lines for timing UI (your delimiter scheme)
  const lines = value ? value.split("//") : [""];

  const handleTimingChange = (index: number, secondsInput: number) => {
    const seconds = Number.isFinite(secondsInput) ? secondsInput : 0;
    const newTimings = [...timings];
    newTimings[index] = { text: lines[index], seconds };
    onTimingsChange?.(newTimings);
  };

  return (
    <div className={`relative ${className}`}>
      <div
        ref={containerRef}
        onClick={() => {
          // clicking the wrapper should focus the mathfield while editing
          if (editing) mathfieldRef.current?.focus();
        }}
      />

      {/* Timing Input Section */}
      {enableTiming && editing && lines.length > 1 && (
        <div className="mt-4 border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-700">
              Set timing for each line:
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setShowTimingInput(!showTimingInput)}
              className="inline-flex items-center gap-1"
            >
              <Clock className="h-3.5 w-3.5" />
              {showTimingInput ? "Hide Timing" : "Show Timing"}
            </Button>
          </div>

          {showTimingInput && (
            <div className="space-y-3 bg-gray-50 p-3 rounded-lg">
              {lines.map((line, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-2 bg-white rounded border"
                >
                  <div className="flex-1 text-sm text-gray-600 min-w-0">
                    <div className="font-medium">Line {index + 1}:</div>
                    <div className="truncate" title={line}>
                      {line || <em className="text-gray-400">Empty line</em>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Seconds"
                      value={timings[index]?.seconds ?? ""}
                      onChange={(e) =>
                        handleTimingChange(index, Number(e.target.value))
                      }
                      className="w-24 h-8 text-sm"
                      min="0"
                      step="0.1"
                    />
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      sec
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {editing && (onSave || onCancel) && (
        <div className="flex justify-end gap-2 mt-2">
          {onCancel && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onCancel}
              className="h-8 px-3"
            >
              Cancel
            </Button>
          )}
          {onSave && (
            <Button
              type="button"
              size="sm"
              onClick={onSave}
              className="h-8 px-3 bg-green-500 hover:bg-green-600 text-white inline-flex items-center"
            >
              <Check className="mr-1 h-3.5 w-3.5" />
              Save
            </Button>
          )}
        </div>
      )}
      {!value && !editing && (
        <div className="text-gray-400 italic text-sm">{placeholder}</div>
      )}
    </div>
  );
};

export default MathInput;
