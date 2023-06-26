import Realm from 'realm';

const mediaSchema = {
    name: 'media',
    properties: {
        id: 'string',
        ctime: 'string?',
        mtime: 'string',
        name: 'string',
        path: 'string',
        size: 'int',
        timeStamp: 'int',
        uri: 'string',
        isImage: 'bool',
        isUploaded: { type: "bool", default: false },
    },
    primaryKey: 'id',
}

export const DBInstance = new Realm({ schema: [mediaSchema] });
