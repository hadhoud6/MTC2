"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Link } from "@/lib/i18n/routing";
import { siteConfig } from "@/data/siteConfig";
import BrandLogo from "@/components/common/BrandLogo";

const footerLinks = [
  { key: "usine", href: "/#usine", panelId: "usine" },
  { key: "produits", href: "/#produits", panelId: "produits" },
  { key: "configurateur", href: "/#configurateur", panelId: "configurateur" },
  { key: "projets", href: "/#projets", panelId: "projets" },
  { key: "devis", href: "/devis", panelId: undefined },
  { key: "contact", href: "/contact", panelId: undefined },
  { key: "catalogue", href: "/catalogue", panelId: undefined },
] as const;

const socialItems = [
  { key: "facebook", href: siteConfig.social.facebook },
  { key: "instagram", href: siteConfig.social.instagram },
  { key: "youtube", href: siteConfig.social.youtube },
  { key: "linkedin", href: siteConfig.social.linkedin },
] as const;

export default function Footer({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const locale = useLocale();
  const tNav = useTranslations("nav");
  const tFooter = useTranslations("footer");
  const tSocial = useTranslations("social");
  const isHomePage = Boolean(
    pathname &&
      (pathname === "/" || pathname === "/fr" || pathname === "/en" ||
        pathname === "/fr/" || pathname === "/en/"),
  );

  return (
    <footer className={`border-t border-stone-200 bg-white text-black ${className}`}>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-2 lg:grid-cols-3 lg:px-8">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <Image
              src={siteConfig.assets.logo}
              alt={siteConfig.name}
              width={56}
              height={56}
              className="h-14 w-auto shrink-0"
            />
            <BrandLogo size="md" className="items-start text-left" />
          </div>
        </div>

        <div>
          <h3 className="mb-4 font-display text-lg font-bold text-black">
            {tFooter("usefulLinks")}
          </h3>
          <ul className="space-y-2">
            {footerLinks.map((link) => (
              <li key={link.key}>
                {link.panelId ? (
                  <a
                    href={isHomePage ? `#${link.panelId}` : `/${locale}#${link.panelId}`}
                    onClick={(event) => {
                      if (isHomePage) {
                        event.preventDefault();
                        window.dispatchEvent(
                          new CustomEvent("mtc-goto-panel", {
                            detail: { id: link.panelId },
                          }),
                        );
                      }
                    }}
                    className="text-sm text-stone-600 transition hover:text-black"
                  >
                    {tNav(link.key)}
                  </a>
                ) : (
                  <Link
                    href={link.href}
                    className="text-sm text-stone-600 transition hover:text-black"
                  >
                    {tNav(link.key)}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-display text-lg font-bold text-black">
            {tFooter("contactUs")}
          </h3>
          <ul className="space-y-2 text-sm text-stone-600">
            <li>
              <a
                href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}
                className="transition hover:text-black"
              >
                {siteConfig.phone}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${siteConfig.email}`}
                className="transition hover:text-black"
              >
                {siteConfig.email}
              </a>
            </li>
            <li>{siteConfig.address}</li>
          </ul>
          <div className="mt-4 overflow-hidden rounded-lg border border-stone-200">
            {/* SWAP: Replace embed URL with precise factory location */}
            <iframe
              src={siteConfig.assets.googleMapsEmbedUrl}
              title="Google Maps"
              className="h-48 w-full border-0 md:h-64"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-stone-200">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 md:flex-row lg:px-8">
          <div className="flex gap-4">
            {socialItems.map(({ key, href }) => (
              <a
                key={key}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={tSocial(key)}
                className="text-sm text-stone-600 transition hover:text-black"
              >
                {tSocial(key)}
              </a>
            ))}
          </div>
          <p className="text-center text-xs text-stone-500">
            {tFooter("copyright", { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  );
}
