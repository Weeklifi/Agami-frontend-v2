import { useEffect, useRef } from "react";

const COLORS = ["#111827", "#dc2626", "#059669", "#4f46e5", "#d97706"];

export default function RichTextEditor({ value, onChange, onEnter, placeholder }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && !ref.current.innerHTML) {
      ref.current.innerHTML = value || "";
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleInput = (e) => {
    onChange(e.currentTarget.innerHTML);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onEnter?.();
    }
  };

  const exec = (cmd, arg = null) => {
    ref.current.focus();
    document.execCommand(cmd, false, arg);
    onChange(ref.current.innerHTML);
  };

  return (
    <div className="rounded-lg border border-line focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100">
      <div className="flex items-center gap-1 border-b border-line px-2 py-1.5">
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("bold")}
          className="h-7 w-7 rounded text-sm font-bold hover:bg-page">B</button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("italic")}
          className="h-7 w-7 rounded text-sm italic hover:bg-page">I</button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("underline")}
          className="h-7 w-7 rounded text-sm underline hover:bg-page">U</button>
        <span className="mx-1 h-4 w-px bg-line" />
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec("foreColor", c)}
            className="h-5 w-5 rounded-full border border-line"
            style={{ backgroundColor: c }}
            title="লেখার রঙ"
          />
        ))}
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        data-placeholder={placeholder}
        className="max-h-60 min-h-[70px] overflow-y-auto whitespace-pre-wrap break-words px-3.5
          py-2.5 text-sm outline-none empty:before:text-ink-400 empty:before:content-[attr(data-placeholder)]"
      />
    </div>
  );
}
