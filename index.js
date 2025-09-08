'use strict';
const fs = require('node:fs');

// Omit encoding to get buffer as response
const torrent = fs.readFileSync('puppy.torrent');
// console.log(torrent.toString('utf-8'));
