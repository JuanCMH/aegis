import pdfMake from "pdfmake/build/pdfmake";
import { ContractDataType } from "../types";
import { formatCop } from "@/lib/format-cop";
import { fullDate } from "@/lib/date-formats";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { differenceInCalendarDays } from "date-fns";
import { BondDataType } from "@/packages/bonds/types";
import { getQuoteTotals } from "@/lib/get-quote-totals";
import { TDocumentDefinitions } from "pdfmake/interfaces";

pdfMake.vfs = pdfFonts.vfs || pdfFonts;

interface GenerateQuotePDFParams {
  contractData: ContractDataType;
  bondsData: Array<BondDataType>;
  expenses?: number;
  calculateExpensesTaxes?: boolean;
  quoteType: "bidBond" | "performanceBonds";
}

export const generateQuotePDF = async ({
  contractData,
  bondsData,
  expenses = 0,
  calculateExpensesTaxes = false,
  quoteType,
}: GenerateQuotePDFParams) => {
  const totals = getQuoteTotals(
    bondsData.map((bond) => ({
      insuredValue: bond.insuredValue,
      rate: bond.rate,
      days:
        quoteType === "bidBond"
          ? 365
          : differenceInCalendarDays(bond.endDate, bond.startDate),
    })),
  );

  const expensesVat = calculateExpensesTaxes ? expenses * 0.19 : 0;
  const totalWithExpenses = totals.total + expenses + expensesVat;

  const documentDefinition: TDocumentDefinitions = {
    pageOrientation: "landscape",
    content: [
      {
        text: `Cotización ${quoteType === "bidBond" ? "de Seriedad de la oferta" : "de Cumplimiento"}`,
        style: "header",
      },
      { text: "\n" },
      {
        columns: [
          {
            width: "auto",
            text: [
              { text: "Contratante: ", bold: true },
              contractData.contractor,
              "\n",
              { text: "NIT/CC: ", bold: true },
              contractData.contractorId,
              "\n",
              { text: "Beneficiario: ", bold: true },
              contractData.contractee,
              "\n",
              { text: "NIT/CC: ", bold: true },
              contractData.contracteeId,
            ],
          },
          {
            width: "*",
            text: [
              { text: "Tipo de Contrato: ", bold: true },
              contractData.contractType,
              "\n",
              { text: "Valor del Contrato: ", bold: true },
              formatCop(contractData.contractValue),
              "\n",
              { text: "Vigencia: ", bold: true },
              `${fullDate(contractData.contractStart)} - ${fullDate(contractData.contractEnd)}`,
            ],
            alignment: "right",
          },
        ],
      },
      { text: "\n\n" },
      { text: "Amparos", style: "subheader" },
      { text: "\n" },
      {
        table: {
          headerRows: 1,
          widths: ["*", "auto", "auto", "auto", "auto", "auto", "auto"],
          body: [
            [
              { text: "Amparo", style: "tableHeader" },
              { text: "Desde", style: "tableHeader" },
              { text: "Hasta", style: "tableHeader" },
              { text: "Días", style: "tableHeader" },
              { text: "%", style: "tableHeader" },
              { text: "Valor Asegurado", style: "tableHeader" },
              { text: "Tasa", style: "tableHeader" },
            ],
            ...bondsData.map((bond) => [
              bond.name,
              fullDate(bond.startDate),
              fullDate(bond.endDate),
              differenceInCalendarDays(bond.endDate, bond.startDate).toString(),
              `${bond.percentage}%`,
              formatCop(bond.insuredValue),
              `${bond.rate}%`,
            ]),
          ],
        },
      },
      { text: "\n\n" },
      {
        table: {
          headerRows: 1,
          widths: ["auto", "auto", "auto", "auto", "auto"],
          body: [
            [
              { text: "Gastos", style: "tableHeader" },
              { text: "IVA/Gastos", style: "tableHeader" },
              { text: "IVA", style: "tableHeader" },
              { text: "Prima", style: "tableHeader" },
              { text: "Total", style: "tableHeader" },
            ],
            [
              formatCop(expenses),
              formatCop(expensesVat),
              formatCop(totals.vat),
              formatCop(totals.premium),
              formatCop(totalWithExpenses),
            ],
          ],
        },
      },
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        alignment: "center",
        margin: [0, 0, 0, 10],
      },
      subheader: {
        fontSize: 14,
        bold: true,
        margin: [0, 10, 0, 5],
      },
      tableHeader: {
        bold: true,
        fontSize: 12,
        color: "black",
        fillColor: "#eeeeee",
      },
    },
  };

  pdfMake
    .createPdf(documentDefinition)
    .download(`cotizacion-${contractData.contractor}.pdf`);
};
