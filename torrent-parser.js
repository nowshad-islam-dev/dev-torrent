'use strict';

import fs from 'node:fs';
import bencode from 'bencode';
import crypto from 'node:crypto';
import bignum from 'bignum';

// Omit encoding in readFileSync to get buffer as response
// It returns tracker url as string
export const open = () =>
  bencode.decode(fs.readFileSync('puppy.torrent'), ['utf-8']);

export const size = (torrent) => {
  // Map for multiple file OR info.length for single file
  const size = torrent.info.files
    ? torrent.info.files.map((file) => file.length).reduce((a, b) => a + b)
    : torrent.info.length;

  return bignum.toBuffer(size, { size: 8 });
};

export const infoHash = (torrent) => {
  const info = bencode.encode(torrent.info);
  return crypto.createHash('sha1').update(info).digest();
};
