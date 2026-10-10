"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getProductSubtypes, type ProductSubtype } from "@/data/productSubtypes";
import type { ProductTypeValue } from "@/data/productTypes";
import type { Locale } from "@/types/content";

export default function ProductSubtypePicker({
  type,
  locale,
  value,
  onChange,
  label,
}: {
  type: ProductTypeValue;
  locale: Locale;
  value?: string;
  onChange: (value: string | undefined) => void;
  label: string;
}) {
  const subtypes = useMemo(() => getProductSubtypes(type), [type]);
  const [preview, setPreview] = useState<ProductSubtype | null>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    const selected = subtypes.find((subtype) => subtype.id === value);
    setPreview(selected ?? subtypes[0] ?? null);
  }, [subtypes, value]);

  const focusItem = (index: number) => {
    itemRefs.current[index]?.focus();
  };

  return (
    <div className="relative">
      <p className="mb-2 block text-sm font-semibold text-brand-dark">{label}</p>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_160px]">
        <div role="listbox" aria-label={label} className="grid gap-2">
          {subtypes.map((subtype, index) => {
            const name = subtype.name[locale];
            const selected = subtype.id === value;
            return (
              <button
                key={subtype.id}
                ref={(node) => {
                  itemRefs.current[index] = node;
                }}
                type="button"
                role="option"
                aria-selected={selected}
                tabIndex={selected || (!value && index === 0) ? 0 : -1}
                onMouseEnter={() => setPreview(subtype)}
                onFocus={() => setPreview(subtype)}
                onClick={() => onChange(selected ? undefined : subtype.id)}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown" || event.key === "ArrowRight") {
                    event.preventDefault();
                    focusItem((index + 1) % subtypes.length);
                  } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
                    event.preventDefault();
                    focusItem((index - 1 + subtypes.length) % subtypes.length);
                  } else if (event.key === "Home") {
                    event.preventDefault();
                    focusItem(0);
                  } else if (event.key === "End") {
                    event.preventDefault();
                    focusItem(subtypes.length - 1);
                  }
                }}
                className={`rounded-lg border px-3 py-2 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-brand-orange/30 ${
                  selected
                    ? "border-brand-orange bg-brand-orange/10 font-semibold text-brand-dark"
                    : "border-brand-dark/15 bg-white text-text-muted hover:border-brand-orange/60 hover:bg-brand-orange/5"
                }`}
              >
                {name}
              </button>
            );
          })}
        </div>
        {preview && (
          <div className="overflow-hidden rounded-xl border border-brand-orange/20 bg-brand-light shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview.image} alt="" className="h-24 w-full object-cover sm:h-28" />
            <p className="px-2 py-2 text-xs font-semibold text-brand-dark">{preview.name[locale]}</p>
          </div>
        )}
      </div>
    </div>
  );
}
