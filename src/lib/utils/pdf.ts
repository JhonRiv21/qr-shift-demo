import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export async function generarPDF(params: { turno: string; tipo: string; numero: number; fechaISO: string }) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([300, 200]);
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  page.drawText('Turno', { x: 20, y: 160, size: 18, font, color: rgb(0, 0, 0) });
  page.drawText(params.turno, { x: 20, y: 120, size: 36, font, color: rgb(0.1, 0.1, 0.1) });
  page.drawText(new Date(params.fechaISO).toLocaleString(), { x: 20, y: 80, size: 10 });

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${params.turno}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

