import CRC32 from 'crc-32';


export function generateFileName(name, user_id, date) {
    return getHash(user_id + date + name) + "-" + getHash(user_id + date) + "-" + getHash(name + date) + "." + getFileExtension(name);
}
export function getHash(message) {
    // return CRC32.str(message);
    const crc = CRC32.str(message);
    const formattedCRC = ("00000000" + crc.toString(16)).substr(-8).toUpperCase();
    return formattedCRC;
}

function getFileExtension(filename) {
    return filename.split('.').pop();
}