import { PassThrough, Readable } from 'stream';
import PDFDocument from 'pdfkit';
import { get } from '@/lib/store';

export const runtime = 'nodejs';

export async function GET() {
  const state = get();
  const entries = state.guestbook.filter((g) => g.status === 'approved');

  const doc = new PDFDocument({ margin: 56 });
  const stream = new PassThrough();
  doc.pipe(stream);

  doc.fontSize(22).font('Helvetica-Bold').text(`Gästebuch — ${state.party.coupleNames}`, { align: 'center' });
  if (state.party.eventTitle) {
    doc.moveDown(0.3);
    doc.fontSize(12).font('Helvetica').fillColor('#666').text(state.party.eventTitle, { align: 'center' });
  }
  doc.moveDown(1.5);
  doc.fillColor('#000');

  if (!entries.length) {
    doc.fontSize(12).font('Helvetica').text('Noch keine freigegebenen Einträge.');
  }

  entries.forEach((entry, i) => {
    if (i > 0) doc.moveDown(1);
    doc.fontSize(13).font('Helvetica-Bold').text(entry.name);
    doc.fontSize(12).font('Helvetica').text(`„${entry.message}"`, { width: 480 });
  });

  doc.end();

  return new Response(Readable.toWeb(stream), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="gaestebuch.pdf"'
    }
  });
}
