// Длительность mp3 — общая для scripts/media-dnya.mjs (Р232) и замка страницы дня src/lib/den-obshchee.mjs (r602).
// Длительность mp3, с: заголовок первого кадра + Xing/Info/VBRI (VBR) или размер / битрейт (CBR). null — не mp3.
const BR = { 1: [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320],
  2: [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160] }; // Layer III; MPEG-2/2.5 — вторая строка
const SR = { 3: [44100, 48000, 32000], 2: [22050, 24000, 16000], 0: [11025, 12000, 8000] };
export function mp3Sek(buf) {
  let p = 0;
  if (buf.length > 10 && buf.toString('latin1', 0, 3) === 'ID3') {
    p = 10 + ((buf[6] & 0x7f) << 21 | (buf[7] & 0x7f) << 14 | (buf[8] & 0x7f) << 7 | (buf[9] & 0x7f));
  }
  for (; p + 4 < buf.length && p < 1 << 20; p++) {
    if (buf[p] !== 0xff || (buf[p + 1] & 0xe0) !== 0xe0) continue;
    const ver = (buf[p + 1] >> 3) & 3, layer = (buf[p + 1] >> 1) & 3;
    const bi = buf[p + 2] >> 4, si = (buf[p + 2] >> 2) & 3, mono = (buf[p + 3] >> 6) === 3;
    if (ver === 1 || layer !== 1 || bi === 0 || bi === 15 || si === 3) continue; // только Layer III
    const kbps = BR[ver === 3 ? 1 : 2][bi], sr = SR[ver][si], spf = ver === 3 ? 1152 : 576;
    const side = ver === 3 ? (mono ? 17 : 32) : (mono ? 9 : 17);
    const x = p + 4 + side, tag = buf.toString('latin1', x, x + 4);
    if ((tag === 'Xing' || tag === 'Info') && buf.readUInt32BE(x + 4) & 1) return buf.readUInt32BE(x + 8) * spf / sr;
    const v = p + 36;
    if (buf.toString('latin1', v, v + 4) === 'VBRI') return buf.readUInt32BE(v + 14) * spf / sr;
    const id3v1 = buf.length >= 128 && buf.toString('latin1', buf.length - 128, buf.length - 125) === 'TAG' ? 128 : 0;
    return (buf.length - p - id3v1) * 8 / (kbps * 1000);
  }
  return null;
}
