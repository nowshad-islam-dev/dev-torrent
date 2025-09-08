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

const socket = dgram.createSocket('udp4');
const msg = Buffer.from('hello!', 'utf-8');

socket.send(msg, 0, msg.length, my_url.port, my_url.host, () => {});

socket.on('message', (msg) => {
  console.log('message is:', msg);
});
