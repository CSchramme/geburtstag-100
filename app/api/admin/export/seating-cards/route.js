import { PassThrough, Readable } from 'stream';
import PDFDocument from 'pdfkit';
import { get } from '@/lib/store';
import { resolveRef } from '@/lib/seating';

export const runtime = 'nodejs';

const CARD_WIDTH = 400;
const CARD_HEIGHT = 260;

export async function GET() {
  const state = get();

  const cards = [];
  state.seating.tables.forEach((table) => {
    (table.guestRefs || []).forEach((ref) => {
      const resolved = resolveRef(state.guests, state.rsvps, ref);
      if (!resolved) return;
      cards.push({ name: resolved.name, extra: Math.max(0, resolved.count - 1), tableName: table.name });
    });
  });

  const doc = new PDFDocument({ size: [CARD_WIDTH, CARD_HEIGHT], margin: 0 });
  const stream = new PassThrough();
  doc.pipe(stream);

  if (!cards.length) {
    doc.fontSize(13).font('Helvetica').fillColor('#333')
      .text('Noch keine Gäste an Tischen zugeordnet.', 30, CARD_HEIGHT / 2 - 10, { width: CARD_WIDTH - 60, align: 'center' });
  }

  cards.forEach((card, i) => {
    if (i > 0) doc.addPage({ size: [CARD_WIDTH, CARD_HEIGHT], margin: 0 });
    drawCard(doc, card, state.party);
  });

  doc.end();

  return new Response(Readable.toWeb(stream), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="tischkarten.pdf"'
    }
  });
}

function drawCard(doc, card, party) {
  const margin = 16;
  const inner = margin + 6;

  doc.save();
  doc.rect(margin, margin, CARD_WIDTH - margin * 2, CARD_HEIGHT - margin * 2).lineWidth(1.5).stroke('#8a6a1f');
  doc.rect(inner, inner, CARD_WIDTH - inner * 2, CARD_HEIGHT - inner * 2).lineWidth(0.75).stroke('#8a6a1f');

  doc.fontSize(10).font('Helvetica').fillColor('#6e1c26')
    .text((party.eventTitle || '').toUpperCase(), margin, margin + 22, { width: CARD_WIDTH - margin * 2, align: 'center' });

  doc.fontSize(26).font('Times-Bold').fillColor('#2b1a0e')
    .text(card.name, margin, CARD_HEIGHT / 2 - 32, { width: CARD_WIDTH - margin * 2, align: 'center' });

  if (card.extra > 0) {
    doc.fontSize(12).font('Times-Italic').fillColor('#6e1c26')
      .text(`+ ${card.extra} Begleitung${card.extra === 1 ? '' : 'en'}`, margin, CARD_HEIGHT / 2 + 6, {
        width: CARD_WIDTH - margin * 2,
        align: 'center'
      });
  }

  doc.fontSize(12).font('Helvetica-Bold').fillColor('#8a6a1f')
    .text(card.tableName, margin, CARD_HEIGHT - margin - 36, { width: CARD_WIDTH - margin * 2, align: 'center' });

  doc.fontSize(9).font('Helvetica').fillColor('#666')
    .text(party.coupleNames || '', margin, CARD_HEIGHT - margin - 18, { width: CARD_WIDTH - margin * 2, align: 'center' });

  doc.restore();
}
