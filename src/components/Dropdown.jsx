import { useEffect, useId, useRef, useState } from "react";

/* Custom listbox: replaces the browser's native <select> so it matches the rest of the form. */
export default function Dropdown({ id, label, value, options, onChange, placeholder = "Select", hideLabel = false }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrap = useRef(null);
  const listRef = useRef(null);
  const listId = useId();
  const selectedIndex = options.findIndex((o) => o.value === value);
  const selected = options[selectedIndex];

  const openMenu = () => {
    setActive(Math.max(selectedIndex, 0));
    setOpen(true);
  };
  const choose = (i) => {
    onChange(options[i].value);
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (e) => {
      if (wrap.current && !wrap.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  useEffect(() => {
    if (open) listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const onKeyDown = (e) => {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openMenu();
      }
      return;
    }
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, options.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Home") { e.preventDefault(); setActive(0); }
    else if (e.key === "End") { e.preventDefault(); setActive(options.length - 1); }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); choose(active); }
    else if (e.key === "Escape") { e.preventDefault(); setOpen(false); }
    else if (e.key === "Tab") setOpen(false);
    else if (e.key.length === 1) {
      const next = options.findIndex((o) => o.label.toLowerCase().startsWith(e.key.toLowerCase()));
      if (next >= 0) setActive(next);
    }
  };

  const Icon = selected?.icon;

  return (
    <div className="dd" ref={wrap}>
      <span id={`${id}-label`} className={hideLabel ? "sr-only" : "dd-label"}>{label}</span>
      <button
        type="button"
        id={id}
        className="dd-button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-labelledby={`${id}-label ${id}`}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onKeyDown}
      >
        {Icon && <Icon size={20} strokeWidth={1.8} aria-hidden="true" />}
        <span className={selected ? "" : "dd-placeholder"}>{selected ? selected.label : placeholder}</span>
        <svg className="dd-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <ul id={listId} ref={listRef} className="dd-list" role="listbox" aria-labelledby={`${id}-label`} aria-activedescendant={`${listId}-${active}`}>
          {options.map((o, i) => {
            const OptIcon = o.icon;
            return (
              <li
                key={o.value}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={o.value === value}
                className={`dd-option${i === active ? " is-active" : ""}${o.value === value ? " is-selected" : ""}`}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(i)}
              >
                {OptIcon && <OptIcon size={20} strokeWidth={1.8} aria-hidden="true" />}
                <span>{o.label}</span>
                {o.value === value && <span className="dd-tick" aria-hidden="true">✓</span>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
