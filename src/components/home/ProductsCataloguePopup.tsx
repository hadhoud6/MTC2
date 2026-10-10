"use client";

import { memo, useCallback, useEffect, useState } from "react";
import { AnimatePresence, LayoutGroup, MotionConfig, motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/routing";
import { products } from "@/data/products";
import type { Locale, Product } from "@/types/content";
import { localized } from "@/types/content";
import ModalPortal from "@/components/common/ModalPortal";
import CatalogueImageCarousel from "./CatalogueImageCarousel";
import { CATALOGUE_CONTENT_TRANSITION, CATALOGUE_CONTENT_VARIANTS, CATALOGUE_FADE_TRANSITION, CATALOGUE_FADE_VARIANTS, CATALOGUE_SPRING } from "@/lib/motion";

function useProductCopy(product: Product) {
  const locale = useLocale() as Locale;

  return {
    name: localized(product.name, locale),
    category: localized(product.category, locale),
    description: localized(product.description, locale),
    finish: localized(product.finish, locale),
    tag: localized(product.tag, locale),
  };
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ChevronUpIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}

const CatalogueCard = memo(function CatalogueCard({
  product,
  expanded,
  onToggle,
  onClose,
}: {
  product: Product;
  expanded: boolean;
  onToggle: (id: string) => void;
  onClose: () => void;
}) {
  const t = useTranslations("products");
  const copy = useProductCopy(product);
  const handleToggle = useCallback(() => onToggle(product.id), [onToggle, product.id]);

  return (
    <motion.article
      layout
      transition={CATALOGUE_SPRING}
      style={{ borderRadius: 16 }}
      className={`relative overflow-hidden bg-white ${expanded ? "z-10 md:col-span-2 lg:col-span-2" : "cursor-pointer"}`}
      onClick={() => { if (!expanded) handleToggle(); }}
    >
      <CatalogueImageCarousel images={product.images} alt={copy.name} expanded={expanded} onToggle={handleToggle} />
      <motion.div layout="position" className={`p-4 ${expanded ? "md:p-6" : ""}`}>
        <div className="mb-2 inline-block rounded-full bg-brand-orange px-3 py-0.5 font-serif text-xs text-white">{copy.category}</div>
        <motion.h3 layout="position" className={`font-display font-bold text-brand-dark ${expanded ? "mb-3 text-xl md:text-2xl" : "mb-1 text-base md:text-lg"}`}>{copy.name}</motion.h3>
        {!expanded ? <p className="line-clamp-2 font-serif text-sm text-text-muted">{copy.tag}</p> : null}
        <AnimatePresence initial={false}>
          {expanded ? (
            <motion.div key="expanded-product" layout="position" variants={CATALOGUE_CONTENT_VARIANTS} initial="hidden" animate="visible" exit="exit" transition={CATALOGUE_CONTENT_TRANSITION}>
              <p className="mb-4 font-serif text-sm leading-relaxed text-text-muted md:text-base">{copy.description}</p>
              <Link href={`/devis?type=${product.productType}&product=${encodeURIComponent(product.slug)}`} onClick={(e) => { e.stopPropagation(); document.body.style.overflow = ""; onClose(); }} className="mb-4 inline-flex rounded-full bg-brand-orange px-3 py-1.5 font-sans text-xs font-semibold text-white transition-colors hover:bg-brand-dark">{t("addToQuote")}</Link>
              <p className="font-serif text-sm text-text-muted"><span className="font-semibold text-brand-dark">{t("finishLabel")}</span>{" "}{copy.finish}</p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
      {expanded ? <button type="button" onClick={(e) => { e.stopPropagation(); handleToggle(); }} className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full border border-white/70 bg-white/90 text-brand-dark shadow-sm transition-colors hover:bg-brand-orange hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-orange/60" aria-label="Collapse"><ChevronUpIcon /></button> : null}
    </motion.article>
  );
});

export default function ProductsCataloguePopup({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("products");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpanded = useCallback((id: string) => {
    setExpandedId((previous) => (previous === id ? null : id));
  }, []);

  const handleClose = useCallback(() => {
    setExpandedId(null);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) {
      setExpandedId(null);
      return;
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };

    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, handleClose]);

  return (
    <ModalPortal>
      <MotionConfig reducedMotion="user">
      <AnimatePresence initial={false}>
        {open ? (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="catalogue-popup-title"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-3 sm:p-4 md:p-6"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={CATALOGUE_FADE_VARIANTS}
          transition={CATALOGUE_FADE_TRANSITION}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <motion.div
            className="flex max-h-[92vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl bg-brand-light shadow-xl md:rounded-3xl"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={CATALOGUE_FADE_VARIANTS}
            transition={CATALOGUE_FADE_TRANSITION}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="relative shrink-0 border-b border-black/5 px-5 py-5 text-center md:px-8 md:py-6">
              <button
                type="button"
                onClick={handleClose}
                className="absolute right-4 top-4 flex size-11 items-center justify-center rounded-full border border-brand-dark/10 bg-white/90 text-brand-dark shadow-sm transition-colors hover:bg-brand-orange hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-orange/50 md:right-6 md:top-6"
                aria-label="Close"
              >
                <CloseIcon />
              </button>
              <h2
                id="catalogue-popup-title"
                className="font-display text-2xl font-bold text-brand-dark md:text-4xl"
              >
                {t("modalTitle")}
              </h2>
              <p className="mt-2 font-serif text-sm text-text-muted md:text-base">
                {t("modalSubtitle")}
              </p>
            </header>

            <motion.div layoutScroll
              className="flex-1 overflow-y-auto px-4 py-5 md:px-8 md:py-6">
              <LayoutGroup>
                <div className="grid auto-rows-auto grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-4 lg:gap-6">
                  {products.map((product) => (
                    <CatalogueCard
                      key={product.id}
                      product={product}
                      expanded={expandedId === product.id}
                      onClose={handleClose}
                      onToggle={toggleExpanded}
                    />
                  ))}
                </div>
              </LayoutGroup>
            </motion.div>
          </motion.div>
        </motion.div>
        ) : null}
      </AnimatePresence>
      </MotionConfig>
    </ModalPortal>
  );
}
