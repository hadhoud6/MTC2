import type { ProductTypeValue } from "@/data/productTypes";
import type { LocalizedText } from "@/types/content";

export type ProductSubtype = {
  type: ProductTypeValue;
  id: string;
  name: LocalizedText;
  image: string;
};

export const productSubtypes: ProductSubtype[] = [
  { type: "marbre", id: "marbre-blanc-carrare", name: { fr: "Marbre Blanc Carrare", en: "Carrara White Marble" }, image: "/1.jpg" },
  { type: "marbre", id: "marbre-noir-marquina", name: { fr: "Marbre Noir Marquina", en: "Marquina Black Marble" }, image: "/2.jpg" },
  { type: "marbre", id: "marbre-emeraude", name: { fr: "Marbre Émeraude", en: "Emerald Marble" }, image: "https://placehold.co/320x220/2e4a3e/ffffff?text=Marbre+Vert" },
  { type: "marbre", id: "marbre-rose-portugal", name: { fr: "Marbre Rose Portugal", en: "Rosa Portugal Marble" }, image: "/4.jpg" },
  { type: "marbre", id: "marbre-calacatta-oro", name: { fr: "Marbre Calacatta Oro", en: "Calacatta Oro Marble" }, image: "/00.jpg" },
  { type: "granit", id: "granit-rouge-imperial", name: { fr: "Granit Rouge Impérial", en: "Imperial Red Granite" }, image: "https://placehold.co/320x220/8b0000/ffffff?text=Granit+Rouge" },
  { type: "granit", id: "granit-noir-absolu", name: { fr: "Granit Noir Absolu", en: "Absolute Black Granite" }, image: "/0.jpg" },
  { type: "granit", id: "granit-kashmir-white", name: { fr: "Granit Kashmir White", en: "Kashmir White Granite" }, image: "https://placehold.co/320x220/f0f0f0/666666?text=Kashmir+White" },
  { type: "travertin", id: "travertin-beige", name: { fr: "Travertin Beige", en: "Beige Travertine" }, image: "/3.jpg" },
  { type: "travertin", id: "travertin-silver", name: { fr: "Travertin Silver", en: "Silver Travertine" }, image: "https://placehold.co/320x220/c8c8c8/333333?text=Travertin+Silver" },
  { type: "onyx", id: "onyx-honey", name: { fr: "Onyx Honey", en: "Honey Onyx" }, image: "https://placehold.co/320x220/c4956a/ffffff?text=Onyx+Honey" },
  { type: "onyx", id: "onyx-verde", name: { fr: "Onyx Vert", en: "Green Onyx" }, image: "https://placehold.co/320x220/4a6741/ffffff?text=Onyx+Vert" },
  // SWAP: Replace with the final quartzite visual when the client supplies it.
  { type: "autre", id: "quartzite-taj-mahal", name: { fr: "Quartzite Taj Mahal", en: "Taj Mahal Quartzite" }, image: "https://placehold.co/320x220/f5f0e8/333333?text=Quartzite" },
  // SWAP: Replace with the final Tunisian stone visual when the client supplies it.
  { type: "autre", id: "pierre-de-tunisie", name: { fr: "Pierre de Tunisie", en: "Tunisian Stone" }, image: "/1.jpg" },
];

export function getProductSubtypes(type: ProductTypeValue): ProductSubtype[] {
  return productSubtypes.filter((subtype) => subtype.type === type);
}
