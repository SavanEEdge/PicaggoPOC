import Realm from 'realm';

const mediaSchema = {
  name: 'media',
  properties: {
    id: {type: 'int', indexed: true},
    ctime: 'string?',
    mtime: 'string',
    name: 'string',
    path: 'string',
    size: 'int',
    timeStamp: 'int',
    uri: 'string',
    isImage: 'bool',
    isUploaded: {type: 'bool', default: false},
  },
  primaryKey: 'id',
};

export const DBInstance = new Realm({schema: [mediaSchema]});

export const getNextAutoIncrementId = () => {
  const mediaObjects = DBInstance.objects('media');
  const maxId = mediaObjects.max('id');
  return maxId ? maxId + 1 : 1;
};
