import { PassThrough, Readable } from 'stream';
import PDFDocument from 'pdfkit';
import sharp from 'sharp';
import { get } from '@/lib/store';
import { resolveRef } from '@/lib/seating';

export const runtime = 'nodejs';

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const CARD_H = PAGE_H / 2;

const CREST_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 140">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f3d878" />
      <stop offset="55%" stop-color="#d4af37" />
      <stop offset="100%" stop-color="#8a6a1f" />
    </linearGradient>
  </defs>
  <path d="M30 34 L38 16 L48 30 L60 12 L72 30 L82 16 L90 34 L86 40 L34 40 Z" fill="url(#g)" stroke="#5c4614" stroke-width="1.5" />
  <circle cx="38" cy="16" r="3.2" fill="url(#g)" stroke="#5c4614" stroke-width="1" />
  <circle cx="60" cy="12" r="3.6" fill="url(#g)" stroke="#5c4614" stroke-width="1" />
  <circle cx="82" cy="16" r="3.2" fill="url(#g)" stroke="#5c4614" stroke-width="1" />
  <path d="M22 42 H98 V78 C98 104 80 122 60 132 C40 122 22 104 22 78 Z" fill="#430f16" stroke="url(#g)" stroke-width="3" />
  <path d="M28 48 H92 V77 C92 99 77 114 60 123 C43 114 28 99 28 77 Z" fill="none" stroke="url(#g)" stroke-width="1" opacity="0.55" />
  <text x="60" y="94" text-anchor="middle" font-family="Helvetica, sans-serif" font-weight="700" font-size="40" fill="url(#g)">T&amp;R</text>
</svg>`;

export async function GET() {
  const state = get();

  const cards = [];
  state.seating.tables.forEach((table) => {
    (table.seatRefs || []).forEach((ref) => {
      if (!ref) return;
      const resolved = resolveRef(state.guests, state.rsvps, ref);
      if (resolved) cards.push({ name: resolved.name, tableName: table.name });
    });
  });

  const logoBuffer = await sharp(Buffer.from(CREST_SVG), { density: 600 }).resize(240, 280).png().toBuffer();

  const doc = new PDFDocument({ size: 'A4', margin: 0 });
  const stream = new PassThrough();
  doc.pipe(stream);

  if (!cards.length) {
    doc.fontSize(14).font('Helvetica').fillColor('#333')
      .text('Noch keine Gäste an Tischen zugeordnet.', 40, PAGE_H / 2 - 10, { width: PAGE_W - 80, align: 'center' });
  }

  for (let i = 0; i < cards.length; i += 2) {
    if (i > 0) doc.addPage({ size: 'A4', margin: 0 });
    drawCard(doc, cards[i], state.party, logoBuffer, 0);
    if (cards[i + 1]) {
      drawCutGuide(doc);
      drawCard(doc, cards[i + 1], state.party, logoBuffer, CARD_H);
    }
  }

  doc.end();

  return new Response(Readable.toWeb(stream), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="tischkarten.pdf"'
    }
  });
}

function drawCutGuide(doc) {
  doc.save();
  doc.dash(4, { space: 3 }).moveTo(0, CARD_H).lineTo(PAGE_W, CARD_H).lineWidth(0.75).stroke('#999999');
  doc.undash();
  doc.restore();
}

function drawCard(doc, card, party, logoBuffer, yOffset) {
  const margin = 26;
  const top = yOffset + margin;
  const width = PAGE_W - margin * 2;

  doc.save();
  doc.rect(margin, top, width, CARD_H - margin * 2).lineWidth(1.5).stroke('#8a6a1f');
  doc.rect(margin + 6, top + 6, width - 12, CARD_H - margin * 2 - 12).lineWidth(0.75).stroke('#8a6a1f');

  const logoW = 50;
  const logoH = logoW * (280 / 240);
  doc.image(logoBuffer, PAGE_W / 2 - logoW / 2, top + 16, { width: logoW, height: logoH });

  doc.fontSize(10).font('Helvetica').fillColor('#6e1c26')
    .text((party.eventTitle || '').toUpperCase(), margin, top + 16 + logoH + 10, { width, align: 'center' });

  doc.fontSize(28).font('Times-Bold').fillColor('#2b1a0e')
    .text(card.name, margin, yOffset + CARD_H / 2 + 6, { width, align: 'center' });

  doc.fontSize(12).font('Helvetica-Bold').fillColor('#8a6a1f')
    .text(card.tableName, margin, yOffset + CARD_H - margin - 38, { width, align: 'center' });

  doc.fontSize(9).font('Helvetica').fillColor('#666')
    .text(party.coupleNames || '', margin, yOffset + CARD_H - margin - 18, { width, align: 'center' });

  doc.restore();
}
