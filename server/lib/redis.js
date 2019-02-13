const redis = require('redis'),
      client = redis.createClient()
const { promisify } = require('util');
const get = promisify(client.get).bind(client);
const set = promisify(client.set).bind(client);

module.exports = { get, set }
