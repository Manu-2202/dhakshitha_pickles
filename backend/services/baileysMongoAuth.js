const mongoose = require('mongoose');
const { initAuthCreds, BufferJSON, proto } = require('@whiskeysockets/baileys');

const AuthSchema = new mongoose.Schema({
  _id: String,
  data: String
});

const AuthModel = mongoose.models.WaAuth || mongoose.model('WaAuth', AuthSchema);

const useMongoDBAuthState = async () => {
  const writeData = async (data, id) => {
    const serialized = JSON.stringify(data, BufferJSON.replacer);
    await AuthModel.updateOne({ _id: id }, { $set: { data: serialized } }, { upsert: true });
  };

  const readData = async (id) => {
    const doc = await AuthModel.findOne({ _id: id });
    if (doc && doc.data) {
      return JSON.parse(doc.data, BufferJSON.reviver);
    }
    return null;
  };

  const removeData = async (id) => {
    await AuthModel.deleteOne({ _id: id });
  };

  const creds = await readData('creds') || initAuthCreds();

  return {
    state: {
      creds,
      keys: {
        get: async (type, ids) => {
          const data = {};
          await Promise.all(ids.map(async id => {
            let value = await readData(`${type}-${id}`);
            if (type === 'app-state-sync-key' && value) {
              value = proto.Message.AppStateSyncKeyData.fromObject(value);
            }
            data[id] = value;
          }));
          return data;
        },
        set: async (data) => {
          const tasks = [];
          for (const category in data) {
            for (const id in data[category]) {
              const value = data[category][id];
              const key = `${category}-${id}`;
              tasks.push(value ? writeData(value, key) : removeData(key));
            }
          }
          await Promise.all(tasks);
        }
      }
    },
    saveCreds: () => writeData(creds, 'creds')
  };
};

module.exports = useMongoDBAuthState;
