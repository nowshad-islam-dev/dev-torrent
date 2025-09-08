'use strict';

import dgram from 'node:dgram';
import { Buffer } from 'node:buffer';
import url from 'node:url';

export default function getPeers(torrent, callback) {
  const socket = dgram.createSocket('udp4');
  const tracker_url = url.parse(torrent.announce);
  // Send the connect request
  udpSend(socket, buildConnReq(), tracker_url);

  socket.on('message', (res) => {
    if (resType(res) === 'connect') {
      //  Receive and parse connect response
      const connResp = parseConnResp(res);
      // Send announce request
      const announceReq = buildAnnounceReq(connResp.connectionId);
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

function resType(resp) {}

function buildConnReq() {}

function parseConnResp(resp) {}

function buildAnnounceReq() {}

function parseAnnounceResp(resp) {}
