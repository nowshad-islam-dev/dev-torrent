'use strict';

import dgram from 'node:dgram';
import { Buffer } from 'node:buffer';
import url from 'node:url';
import crypto from 'node:crypto';
import { genId } from './util.js';
import { infoHash, size } from './torrent-parser.js';

export default function getPeers(torrent, callback) {
  const socket = dgram.createSocket('udp4');
  const tracker_url = url.parse(torrent.announce);

  const { buf, transactionId } = buildConnReq();
  // Send the connect request
  udpSend(socket, buf, tracker_url);

  socket.on('message', (res) => {
    if (resType(res) === 'connect') {
      //  Receive and parse connect response
      const connResp = parseConnResp(res, transactionId);
      // Send announce request
      const announceReq = buildAnnounceReq(connResp.connectionId, torrent);
      udpSend(socket, announceReq, tracker_url);
    } else if (resType(res) === 'announce') {
      // Parse announce response
      const announceResp = parseAnnounceResp(res);
      // Pass peers to callback
      callback(announceResp.peers);
    }
  });
}

function udpSend(socket, message, rawUrl, callback = () => {}) {
  const actualUrl = url.parse(rawUrl);
  socket.send(
    message,
    0,
    message.length,
    actualUrl.port,
    actualUrl.host,
    callback
  );
}

function resType(resp) {
  const action = resp.readUInt32BE(0);
  if (action === 0) return 'connect';
  if (action === 1) return 'announce';
}

function buildConnReq() {
  const buf = Buffer.alloc(16);

  // protocol_id (as per document)
  buf.writeUInt32BE(0x417, 0);
  buf.writeUInt32BE(0x27101980, 4);
  // action (as per docuement)
  buf.writeUInt32BE(0, 8);
  // transaction_id (random)
  const transactionId = crypto.randomBytes(4);
  transactionId.copy(buf, 12);

  return { buf, transactionId };
  // return buf;
}

function parseConnResp(resp, transaction_id) {
  // Check is packet length is 16 bytes
  // Check if transaction_id matches
  const transactionId = resp.readUInt32BE(4);
  if (resp.length === 16 && transactionId === transaction_id) {
    return {
      action: resp.readUInt32BE(0),
      transactionId: resp.readUInt32BE(4),
      connectionId: resp.slice(8), // Reading 64-bit integer is not possible so slice it as buffer
    };
  } else {
    return null;
  }
}

function buildAnnounceReq(connId, torrent, port = 6881) {
  const buf = Buffer.allocUnsafe(98);

  // connection_id
  connId.copy(buf, 0);
  // action
  buf.writeUInt32BE(1, 8);
  // transaction_id
  crypto.randomBytes(4).copy(buf, 12);
  // info hash
  infoHash(torrent).copy(buf, 16);
  //peer_id
  genId().copy(buf, 36);
  //downloaded
  Buffer.alloc(8).copy(buf, 56);
  // left
  size(torrent).copy(buf, 64);
  //uploaded
  Buffer.alloc(8).copy(buf, 64);
  //event
  buf.writeUInt32BE(0, 80);
  // ip address
  buf.writeUInt32BE(0, 80);
  //key
  crypto.randomBytes(4).copy(buf, 88);
  // num want
  buf.writeInt32BE(-1, 92);
  //port
  buf.writeUInt32BE(port, 96);

  return buf;
}

function parseAnnounceResp(resp) {
  function group(iterable, groupSize) {
    let groups = [];
    for (let i = 0; i < iterable.length; i += groupSize) {
      groups.push(iterable.slice(i, i + groupSize));
    }

    return groups;
  }

  return {
    action: resp.readUInt32BE(0),
    transactionId: resp.readUInt32BE(4),
    leechers: resp.readUInt32BE(12),
    seeders: resp.readUInt32BE(16),
    peers: group(resp.slice(20), 6).map((address) => {
      return {
        ip: address.slice(0, 4).join('.'),
        port: address.readUInt16BE(4),
      };
    }),
  };
}
