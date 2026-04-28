/**
 * Catálogo precargado de aseguradoras autorizadas en Colombia
 * (Fuente: Fasecolda · Superfinanciera de Colombia · sitios oficiales).
 *
 * Se usa desde `ImportColombiaInsurersModal` para sembrar el catálogo de la
 * agencia de un solo click. La mutación `insurers.bulkCreate` deduplica por
 * nombre, así que correr el import varias veces es seguro.
 */

export interface ColombiaInsurerSeed {
  name: string;
  taxId?: string;
  website?: string;
  email?: string;
  phone?: string;
  notes?: string;
}

export const COLOMBIA_INSURERS: ColombiaInsurerSeed[] = [
  {
    name: "Allianz Seguros",
    taxId: "860.003.127-6",
    website: "https://www.allianz.co",
    phone: "(601) 594 11 33 · 018000 513 500 · *265",
    notes: "Generales y Vida (Allianz Seguros de Vida S.A.).",
  },
  {
    name: "Andina Compañía de Seguros de Vida",
    website: "https://andinavidaseguros.com.co",
  },
  {
    name: "Aseguradora Solidaria de Colombia",
    taxId: "860.007.738-9",
    website: "https://www.solidaria.com.co",
    email: "servicioalcliente@solidaria.com.co",
    phone: "(601) 320 35 88 · 018000 910 080",
    notes: "Entidad cooperativa.",
  },
  {
    name: "Asulado Seguros de Vida",
    website: "https://www.asulado.com",
  },
  {
    name: "AXA Colpatria Seguros",
    taxId: "860.009.578-4",
    website: "https://www.axacolpatria.co",
    phone: "(601) 423 57 57 · 018000 515 750 · #247",
    notes: "Generales y Vida (AXA Colpatria Seguros de Vida S.A.).",
  },
  {
    name: "BBVA Seguros Colombia",
    taxId: "830.017.571-7",
    website: "https://www.bbvaseguros.com.co",
    phone: "(601) 219 11 00",
  },
  {
    name: "Berkley Internacional Seguros Colombia",
    taxId: "900.123.338-1",
    website: "https://www.berkley.com.co",
  },
  {
    name: "Cardif Colombia Seguros Generales",
    taxId: "900.252.570-3",
    website: "https://www.cardif.com.co",
    phone: "018000 112 230",
  },
  {
    name: "Cesce Colombia Compañía de Seguros",
    taxId: "800.088.826-2",
    website: "https://www.cesce.co",
    email: "info@cesce.co",
    phone: "(601) 326 07 00",
    notes: "Antes Segurexpo.",
  },
  {
    name: "CHUBB Seguros Colombia",
    taxId: "860.502.501-6",
    website: "https://www.chubb.com.co",
    phone: "(601) 319 04 02 · 018000 917 500",
  },
  {
    name: "Colmena Seguros",
    taxId: "800.255.769-7",
    website: "https://www.colmenaseguros.com",
    phone: "018000 510 012",
    notes: "Riesgos Laborales y Vida.",
  },
  {
    name: "Compañía Aseguradora de Fianzas Confianza",
    taxId: "830.001.062-6",
    website: "https://www.confianza.com.co",
    email: "info@confianza.com.co",
    phone: "(601) 325 06 00",
  },
  {
    name: "Compañía de Seguros Bolívar (Vida)",
    taxId: "860.002.503-2",
    website: "https://www.segurosbolivar.com",
    phone: "018000 123 322 · #322",
  },
  {
    name: "Global Seguros de Vida",
    website: "https://www.globalseguroscolombia.com",
  },
  {
    name: "HDI Seguros Colombia",
    taxId: "860.002.586-5",
    website: "https://www.hdiseguros.com.co",
    phone: "018000 113 390 · #224",
    notes: "Antes Generali Colombia.",
  },
  {
    name: "La Equidad Seguros Generales",
    taxId: "800.149.453-5",
    website: "https://www.laequidadseguros.coop",
    phone: "018000 919 538 · #324",
    notes: "Organismo cooperativo.",
  },
  {
    name: "La Previsora Compañía de Seguros",
    taxId: "890.906.476-5",
    website: "https://previsora.gov.co",
    email: "servicioalcliente@previsora.gov.co",
    phone: "(601) 348 57 57 · 018000 910 136",
  },
  {
    name: "Liberty Colombia Compañía de Seguros",
    taxId: "860.002.535-0",
    website: "https://www.libertyseguros.com.co",
    phone: "(601) 307 70 50 · 018000 113 390",
  },
  {
    name: "Mapfre Seguros Generales de Colombia",
    taxId: "891.700.037-9",
    website: "https://www.mapfre.com.co",
    phone: "018000 519 991 · #624",
    notes: "Generales y Vida (Mapfre Colombia Vida Seguros S.A.).",
  },
  {
    name: "MetLife Colombia Seguros de Vida",
    taxId: "800.176.466-3",
    website: "https://www.metlife.com.co",
    phone: "(601) 307 70 24 · 018000 110 052",
  },
  {
    name: "Nacional de Seguros",
    taxId: "860.035.374-9",
    website: "https://nacionaldeseguros.com.co",
    email: "informacion@nacionaldeseguros.com.co",
    phone: "(601) 746 32 19",
  },
  {
    name: "Positiva Compañía de Seguros",
    taxId: "900.196.788-7",
    website: "https://www.positiva.gov.co",
    email: "servicioalcliente@positiva.com.co",
    phone: "018000 111 170",
  },
  {
    name: "Qualitas Compañía de Seguros",
    website: "https://www.qualitascolombia.com.co",
    phone: "018000 189 873 · #963",
  },
  {
    name: "SBS Seguros Colombia",
    taxId: "860.002.799-3",
    website: "https://www.sbseguros.co",
    phone: "(601) 313 87 00",
    notes: "Antes AIG Colombia.",
  },
  {
    name: "Seguros Alfa",
    taxId: "860.031.979-8",
    website: "https://www.segurosalfa.com.co",
    phone: "(601) 307 70 32 · 018000 122 532",
    notes: "Generales y Vida (Seguros de Vida Alfa S.A. — NIT 860.503.617-3).",
  },
  {
    name: "Seguros Bolívar (Comerciales)",
    taxId: "860.002.180-7",
    website: "https://www.segurosbolivar.com",
    phone: "018000 123 322 · #322",
  },
  {
    name: "Seguros Colsanitas",
    taxId: "830.006.597-5",
    website: "https://www.seguroscolsanitas.com",
    phone: "(601) 742 10 10 · 018000 912 111",
  },
  {
    name: "Seguros del Estado",
    taxId: "890.300.518-9",
    website: "https://www.segurosdelestado.com",
    phone: "(601) 218 69 77",
    notes: "Generales y Vida (Seguros de Vida del Estado S.A.).",
  },
  {
    name: "Seguros Generales Suramericana (Sura)",
    taxId: "800.131.884-3",
    website: "https://www.sura.co",
    email: "contactenos@suramericana.com.co",
    phone: "018000 518 888 · #888",
    notes: "Generales y Vida (Seguros de Vida Suramericana S.A.).",
  },
  {
    name: "Seguros Mundial",
    taxId: "860.007.760-5",
    website: "https://www.segurosmundial.com.co",
    phone: "018000 111 935 · #935",
  },
  {
    name: "Solunion Colombia Seguros de Crédito",
    taxId: "900.422.922-3",
    website: "https://www.solunion.co",
    email: "info@solunion.co",
    phone: "(601) 321 27 00",
  },
  {
    name: "Vidalfa Compañía de Seguros de Vida",
  },
  {
    name: "Zurich Colombia Seguros",
    taxId: "860.002.806-2",
    website: "https://www.zurichseguros.com.co",
    phone: "(601) 518 84 82",
  },
  {
    name: "BMI Colombia Seguros de Vida",
    website: "https://www.bmicolombia.com",
  },
  {
    name: "Pan American Life de Colombia Seguros",
    website: "https://www.palig.com/es/colombia",
    phone: "(601) 744 14 00",
  },
];
