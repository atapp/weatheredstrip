/* Add a timestamp to all logs. */
const logger = (log) => {
  const timestamp = new Date();
  console.log(`${timestamp.toUTCString()}\t${log}`)
}

module.exports.logger = logger
