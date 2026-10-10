"use client";

import { useCallback, useEffect, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { defaultCountries, type CountryIso2 } from "react-international-phone";
import GhostButton from "@/components/common/GhostButton";
import InternationalPhoneField, { type PhoneCountryValue } from "@/components/devis/InternationalPhoneField";
import ProductSubtypePicker from "@/components/devis/ProductSubtypePicker";
import { PRODUCT_TYPES, PRODUCT_TYPE_VALUES, type ProductTypeValue } from "@/data/productTypes";
import { products } from "@/data/products";
import { siteConfig, getWhatsAppUrl } from "@/data/siteConfig";
import { localized, type Locale } from "@/types/content";
import {
  devisFormSchema,
  validateDevisFile,
  type DevisFormValues,
  type DevisFormInput,
  ACCEPTED_FILE_EXTENSIONS,
} from "@/lib/validations/devisSchema";
import { submitDevisFromClient, type SubmitDevisState } from "@/app/actions/submitDevis";

type DevisFormProps = { locale: string; initialCountry?: string };

const defaultCountry = (locale: Locale, initialCountry = "tn"): PhoneCountryValue => ({
  iso2: initialCountry as CountryIso2,
  name:
    new Intl.DisplayNames([locale], { type: "region" }).of(initialCountry.toUpperCase()) ??
    initialCountry.toUpperCase(),
});

export default function DevisForm({ locale, initialCountry }: DevisFormProps) {
  const t = useTranslations("devis");
  const currentLocale = useLocale() as Locale;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const phoneInteractionRef = useRef(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileErrorKey, setFileErrorKey] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<SubmitDevisState>({ status: "idle" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const visitorCountry = initialCountry?.toLowerCase() || "tn";
  const initialPhoneCountry = defaultCountry(currentLocale, visitorCountry);
  const initialDialCode = defaultCountries.find((country) => country[1] === visitorCountry)?.[2] ?? "216";
  const initialPhone = `+${initialDialCode}`;
  const [phone, setPhone] = useState(initialPhone);
  const [phoneCountry, setPhoneCountry] = useState<PhoneCountryValue>(initialPhoneCountry);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<DevisFormInput, unknown, DevisFormValues>({
    resolver: zodResolver(devisFormSchema),
    defaultValues: {
      nom: "",
      prenom: "",
      email: "",
      telephone: initialPhone,
      telephoneCountry: visitorCountry,
      telephoneCountryName: initialPhoneCountry.name,
      productType: undefined,
      productSubtype: undefined,
      dimensions: "",
      quantite: "",
      commentaire: "",
      honeypot: "",
    },
  });

  const selectedType = watch("productType") as ProductTypeValue | undefined;
  const selectedSubtype = watch("productSubtype");
  const comment = watch("commentaire") ?? "";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedType = params.get("type");
    const productSlug = params.get("product");
    const product = productSlug ? products.find((item) => item.slug === productSlug) : undefined;
    const validType = PRODUCT_TYPE_VALUES.includes(requestedType as ProductTypeValue)
      ? (requestedType as ProductTypeValue)
      : product?.productType;

    if (validType) {
      setValue("productType", validType, { shouldDirty: false });
      if (product && product.productType === validType) {
        setValue("productSubtype", product.slug, { shouldDirty: false });
      }
    }
    setSelectedProduct(product ? localized(product.name, currentLocale) : null);
  }, [currentLocale, setValue]);

  useEffect(() => {
    setValue("telephone", phone, { shouldDirty: false });
    setValue("telephoneCountry", phoneCountry.iso2, { shouldDirty: false });
    setValue("telephoneCountryName", phoneCountry.name, { shouldDirty: false });
  }, [phone, phoneCountry, setValue]);

  useEffect(() => {
    if (initialCountry || phoneInteractionRef.current) return;

    const controller = new AbortController();
    const detectVisitorCountry = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/", {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });
        if (!response.ok || phoneInteractionRef.current) return;

        const data = (await response.json()) as { country_code?: string };
        const countryCode = data.country_code?.toLowerCase();
        const country = defaultCountries.find((entry) => entry[1] === countryCode);
        if (!country || phoneInteractionRef.current) return;

        setPhone(`+${country[2]}`);
        setPhoneCountry(defaultCountry(currentLocale, country[1]));
      } catch {
        // Keep the safe Tunisia fallback when the IP lookup is unavailable.
      }
    };

    void detectVisitorCountry();
    return () => controller.abort();
  }, [currentLocale, initialCountry]);

  const validationMessage = useCallback(
    (key: string | undefined) => (key ? t(`validation.${key}`) : undefined),
    [t],
  );

  const clearFile = () => {
    setSelectedFile(null);
    setFileErrorKey(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      clearFile();
      return;
    }
    const result = await validateDevisFile(file);
    if (!result.ok) {
      setFileErrorKey(result.message);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setFileErrorKey(null);
    setSelectedFile(file);
  };

  const onSubmit = async (values: DevisFormValues) => {
    if (values.honeypot?.trim()) {
      setSubmitState({ status: "success" });
      return;
    }
    const fileCheck = await validateDevisFile(selectedFile);
    if (!fileCheck.ok) {
      setFileErrorKey(fileCheck.message);
      return;
    }

    setIsSubmitting(true);
    setSubmitState({ status: "idle" });
    const formData = new FormData();
    formData.set("locale", locale);
    formData.set("nom", values.nom);
    formData.set("prenom", values.prenom);
    formData.set("email", values.email);
    formData.set("telephone", values.telephone);
    formData.set("telephoneCountry", values.telephoneCountry);
    formData.set("telephoneCountryName", values.telephoneCountryName);
    formData.set("productType", values.productType);
    if (values.productSubtype) formData.set("productSubtype", values.productSubtype);
    formData.set("dimensions", values.dimensions);
    formData.set("quantite", String(values.quantite));
    formData.set("commentaire", values.commentaire ?? "");
    formData.set("website", values.honeypot ?? "");
    if (selectedFile) formData.set("fichier", selectedFile);

    try {
      const result = await submitDevisFromClient(formData);
      setSubmitState(result);
      if (result.status === "success") {
        reset();
        setPhone(initialPhone);
        setPhoneCountry(initialPhoneCountry);
        clearFile();
      }
    } catch {
      setSubmitState({ status: "error", code: "email" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const retry = () => setSubmitState({ status: "idle" });

  if (submitState.status === "success") {
    return (
      <div className="rounded-2xl border border-brand-orange/20 bg-white p-8 text-center shadow-sm md:p-12" role="status">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand-orange/15">
          <svg className="h-8 w-8 text-brand-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="font-display text-2xl font-bold text-brand-dark md:text-3xl">{t("success.title")}</h2>
        <p className="mt-4 text-lg text-text-muted">{t("success.message")}</p>
        <p className="mt-2 text-base text-text-muted">{t("success.confirmationNote")}</p>
      </div>
    );
  }

  const showError = submitState.status === "error";
  const whatsappUrl = getWhatsAppUrl();
  const phoneHandler = (nextPhone: string, nextCountry: PhoneCountryValue) => {
    phoneInteractionRef.current = true;
    setPhone(nextPhone);
    setPhoneCountry(nextCountry);
  };
  const productTypeRegister = register("productType", {
    onChange: () => setValue("productSubtype", undefined, { shouldDirty: true }),
  });

  return (
    <div className="rounded-2xl border border-brand-dark/10 bg-white p-6 shadow-sm md:p-10">
      {showError && (
        <div className="mb-8 rounded-xl border border-red-200 bg-red-50 p-4 text-left" role="alert">
          <p className="font-semibold text-red-800">{t("error.title")}</p>
          <p className="mt-1 text-sm text-red-700">{submitState.code === "file" && submitState.fileError ? t(`validation.${submitState.fileError}`) : t(`error.codes.${submitState.code}`)}</p>
          <div className="mt-4"><GhostButton type="button" variant="black" size="sm" onClick={retry}>{t("error.retry")}</GhostButton></div>
          <p className="mt-4 text-sm text-text-muted">{t("error.fallback")} <a href={`tel:${siteConfig.phone.replace(/\s/g, "")}`} className="font-semibold text-brand-orange hover:underline">{siteConfig.phone}</a>{" · "}<a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-orange hover:underline">WhatsApp</a></p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {selectedProduct && <div className="rounded-xl border border-brand-orange/20 bg-brand-orange/5 px-4 py-3 text-sm text-brand-dark">{t("selectedProduct")} <span className="font-semibold">{selectedProduct}</span></div>}
        <div className="hidden" aria-hidden="true"><label htmlFor="website">{t("honeypotLabel")}</label><input id="website" type="text" tabIndex={-1} autoComplete="off" {...register("honeypot")} /></div>

        <div className="grid gap-6 md:grid-cols-2">
          <Field label={t("fields.nom")} required error={validationMessage(errors.nom?.message)}><input type="text" autoComplete="family-name" className={inputClass(!!errors.nom)} {...register("nom")} /></Field>
          <Field label={t("fields.prenom")} required error={validationMessage(errors.prenom?.message)}><input type="text" autoComplete="given-name" className={inputClass(!!errors.prenom)} {...register("prenom")} /></Field>
        </div>

        <Field label={t("fields.telephone")} required error={validationMessage(errors.telephone?.message) || validationMessage(errors.telephoneCountry?.message)}>
          <InternationalPhoneField locale={currentLocale} value={phone} country={phoneCountry} onChange={phoneHandler} error={!!errors.telephone || !!errors.telephoneCountry} placeholder={t("placeholders.telephone")} />
        </Field>

        <div className="grid gap-6 md:grid-cols-2">
          <Field label={t("fields.email")} required error={validationMessage(errors.email?.message)}><input type="email" autoComplete="email" className={inputClass(!!errors.email)} {...register("email")} /></Field>
          <Field label={t("fields.productType")} required error={validationMessage(errors.productType?.message)}>
            <select defaultValue="" className={inputClass(!!errors.productType)} {...productTypeRegister}>
              <option value="" disabled hidden>{t("placeholders.productType")}</option>
              {PRODUCT_TYPES.map(({ value, labelKey }) => <option key={value} value={value}>{t(`productTypes.${labelKey}`)}</option>)}
            </select>
          </Field>
        </div>

        {selectedType && <><input type="hidden" {...register("productSubtype")} /><ProductSubtypePicker type={selectedType} locale={currentLocale} value={selectedSubtype} onChange={(value) => setValue("productSubtype", value, { shouldDirty: true, shouldValidate: true })} label={`${t("fields.productSubtype")} (${t("subtypeOptional")})`} /></>}

        <div className="grid gap-6 md:grid-cols-2">
          <Field label={t("fields.dimensions")} required error={validationMessage(errors.dimensions?.message)}><input type="text" placeholder={t("placeholders.dimensions")} className={inputClass(!!errors.dimensions)} {...register("dimensions")} /></Field>
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(105px,0.6fr)] gap-3">
            <Field label={t("fields.quantite")} required error={validationMessage(errors.quantite?.message)}><input type="number" min="0.01" step="any" placeholder={t("placeholders.quantite")} className={inputClass(!!errors.quantite)} {...register("quantite")} /></Field>
          </div>
        </div>

        <Field label={t("fields.commentaire")} error={validationMessage(errors.commentaire?.message)} hint={`${comment.length}/1000`}>
          <textarea maxLength={1000} rows={5} placeholder={t("placeholders.commentaire")} className={inputClass(!!errors.commentaire)} {...register("commentaire")} />
        </Field>

        <Field label={t("fields.file")} hint={t("fields.fileHint")} error={fileErrorKey ? t(`validation.${fileErrorKey}`) : undefined}>
          <input ref={fileInputRef} type="file" accept={ACCEPTED_FILE_EXTENSIONS.join(",")} onChange={onFileChange} className="block w-full text-sm text-brand-dark file:mr-4 file:rounded-full file:border-0 file:bg-brand-orange/15 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-dark hover:file:bg-brand-orange/25" />
          {selectedFile && <div className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-brand-light px-4 py-2"><span className="truncate text-sm text-brand-dark">{selectedFile.name}</span><button type="button" onClick={clearFile} className="shrink-0 text-sm font-semibold text-brand-orange hover:underline">{t("fileRemove")}</button></div>}
        </Field>

        <GhostButton type="submit" variant="black" size="md" isLoading={isSubmitting} disabled={isSubmitting} className="w-full md:w-auto md:min-w-[200px]">{isSubmitting ? t("submitting") : t("submit")}</GhostButton>
      </form>
    </div>
  );
}

function inputClass(hasError: boolean): string {
  return ["w-full rounded-lg border bg-white px-4 py-3 text-brand-dark outline-none transition", "focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20", hasError ? "border-red-400" : "border-brand-dark/15"].join(" ");
}

function Field({ label, required = false, hint, error, children }: { label: string; required?: boolean; hint?: string; error?: string; children: ReactNode }) {
  return <div><label className="mb-2 block text-sm font-semibold text-brand-dark">{label}{required && <span className="ml-1 text-brand-orange" aria-hidden="true">*</span>}</label>{hint && <p className="mb-2 text-xs text-text-muted">{hint}</p>}{children}{error && <p className="mt-1.5 text-sm text-red-600" role="alert">{error}</p>}</div>;
}
