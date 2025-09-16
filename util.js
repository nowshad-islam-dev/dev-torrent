'use strict';

import crypto from 'node:crypto';

let id = null;

export const genId = () => {
  if (!id) {
    id = crypto.randomBytes(20);
    Buffer.from('-NI0001-').copy(id, 0);
  }
  return id;
};
