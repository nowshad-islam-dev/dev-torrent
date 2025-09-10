'use strict';

import fs from 'node:fs';
import bencode from 'bencode';
import getPeers from './tracker';

// Omit encoding in readFileSync to get buffer as response
// It returns tracker url as string
const torrent = bencode.decode(fs.readFileSync('puppy.torrent'), ['utf-8']);

getPeers(torrent, (peers) => {
  console.log('list of peers', peers);
});
