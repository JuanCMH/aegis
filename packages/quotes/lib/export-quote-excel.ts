import ExcelJS from "exceljs";
import { ContractDataType } from "../types";
import { formatCop } from "@/lib/format-cop";
import { fullDate } from "@/lib/date-formats";
import { differenceInCalendarDays } from "date-fns";
import { BondDataType } from "@/packages/bonds/types";
import { getQuoteTotals } from "@/lib/get-quote-totals";

interface GenerateQuoteExcelParams {
  expenses?: number;
  workspaceName?: string;
  contractData: ContractDataType;
  bondsData: Array<BondDataType>;
  calculateExpensesTaxes?: boolean;
  quoteType: "bidBond" | "performanceBonds";
}

export const generateQuoteExcel = async ({
  bondsData,
  quoteType,
  contractData,
  expenses = 0,
  workspaceName,
  calculateExpensesTaxes = false,
}: GenerateQuoteExcelParams) => {
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

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Cotización");

  // Styles
  const headerStyle: Partial<ExcelJS.Style> = {
    font: { bold: true, size: 14 },
    alignment: { horizontal: "center", vertical: "middle" },
  };

  const tableHeaderStyle: Partial<ExcelJS.Style> = {
    font: { bold: true },
    fill: {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFEEEEEE" },
    },
    alignment: { horizontal: "center" },
  };

  // Title
  const titleRow = worksheet.addRow([]);
  titleRow.height = 30;
  worksheet.mergeCells("A1:G1");
  const titleCell = worksheet.getCell("A1");
  
  const titleText = `Cotización ${
    quoteType === "bidBond" ? "de Seriedad de la oferta" : "de Cumplimiento"
  }`;
  
  titleCell.value = workspaceName 
    ? `${titleText} - ${workspaceName}`
    : titleText;
    
  titleCell.style = headerStyle;

  worksheet.addRow([]); // Spacer

  // Contract Info Layout
  // Using two columns for displaying info roughly like the PDF
  
  // Left side
  worksheet.getCell("A3").value = "Contratante:";
  worksheet.getCell("A3").font = { bold: true };
  worksheet.getCell("B3").value = contractData.contractor;

  worksheet.getCell("A4").value = "Identificación:";
  worksheet.getCell("A4").font = { bold: true };
  worksheet.getCell("B4").value = contractData.contractorId;

  worksheet.getCell("A5").value = "Contratista:";
  worksheet.getCell("A5").font = { bold: true };
  worksheet.getCell("B5").value = contractData.contractee;

  worksheet.getCell("A6").value = "Identificación:";
  worksheet.getCell("A6").font = { bold: true };
  worksheet.getCell("B6").value = contractData.contracteeId;

  // Right side (putting it in column D/E for spacing)
  worksheet.getCell("D3").value = "Tipo de Contrato:";
  worksheet.getCell("D3").font = { bold: true };
  worksheet.getCell("E3").value = contractData.contractType;

  worksheet.getCell("D4").value = "Valor del Contrato:";
  worksheet.getCell("D4").font = { bold: true };
  worksheet.getCell("E4").value = formatCop(contractData.contractValue);

  worksheet.getCell("D5").value = "Vigencia:";
  worksheet.getCell("D5").font = { bold: true };
  worksheet.getCell("E5").value = `${fullDate(contractData.contractStart)} - ${fullDate(contractData.contractEnd)}`;

  // Adjust column widths
  worksheet.getColumn(1).width = 15; // Labels
  worksheet.getColumn(2).width = 30; // Values Left
  worksheet.getColumn(3).width = 5;  // Spacer
  worksheet.getColumn(4).width = 20; // Labels Right
  worksheet.getColumn(5).width = 30; // Values Right
  worksheet.getColumn(6).width = 20; // Extra space
  worksheet.getColumn(7).width = 15; // Extra space


  worksheet.addRow([]); // Spacer
  worksheet.addRow(["Amparos"]);
  const amparosTitleRow = worksheet.lastRow;
  if(amparosTitleRow) { // null check
      const cell = amparosTitleRow.getCell(1);
      cell.font = { bold: true, size: 12 };
  }
  
  // Bonds Table
  const bondsHeaderRow = worksheet.addRow([
    "Amparo",
    "Desde",
    "Hasta",
    "Días",
    "%",
    "Valor Asegurado",
    "Tasa",
  ]);
  
  bondsHeaderRow.eachCell((cell) => {
    cell.style = tableHeaderStyle;
  });

  bondsData.forEach((bond) => {
    worksheet.addRow([
      bond.name,
      fullDate(bond.startDate),
      fullDate(bond.endDate),
      differenceInCalendarDays(bond.endDate, bond.startDate),
      `${bond.percentage}%`,
      formatCop(bond.insuredValue),
      `${bond.rate}%`,
    ]);
  });

  worksheet.addRow([]); // Spacer

  // Totals Table
  const totalsHeaderRow = worksheet.addRow([
    "Gastos",
    "IVA/Gastos",
    "IVA",
    "Prima",
    "Total",
  ]);
  
  totalsHeaderRow.eachCell((cell, colNumber) => {
      // Only style first 5 cells
      if(colNumber <= 5) {
          cell.style = tableHeaderStyle;
      }
  });

  worksheet.addRow([
    formatCop(expenses),
    formatCop(expensesVat),
    formatCop(totals.vat),
    formatCop(totals.premium),
    formatCop(totalWithExpenses),
  ]);

  // Generate buffer and trigger download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `cotizacion-${contractData.contractor.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.xlsx`;
  a.click();
  window.URL.revokeObjectURL(url);
};
