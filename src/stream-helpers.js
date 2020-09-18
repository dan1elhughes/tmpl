module.exports.readStream = async (s) =>
  new Promise((resolve, reject) => {
    let data = "";

    s.on("readable", () => {
      const chunk = s.read();
      if (chunk !== null) data += chunk;
    });

    s.on("end", () => resolve(data));
    s.on("error", (e) => reject(e));
  });

module.exports.writeStream = async (data, s) =>
  new Promise((resolve, reject) => {
    s.write(data);
    s.end();
    return resolve();
  });
