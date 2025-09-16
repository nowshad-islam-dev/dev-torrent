'use strict';

import fs from 'node:fs';
import bencode from 'bencode';
import crypto from 'node:crypto';

// Omit encoding in readFileSync to get buffer as response
// It returns tracker url as string
export const open = () =>
  bencode.decode(fs.readFileSync('puppy.torrent'), ['utf-8']);

export const size = (torrent) => {
  // Map for multiple file OR info.length for single file
  const size = torrent.info.files
    ? torrent.info.files
        .map((file) => BigInt(file.length))
        .reduce((a, b) => a + b)
    : BigInt(torrent.info.length);

  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(size);
  return buf;
};

export const infoHash = (torrent) => {
  const info = bencode.encode(torrent.info);
  return crypto.createHash('sha1').update(info).digest();
};
