import CRC32 from 'crc-32';
import moment from 'moment';

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

export function getUnixTimeSteamp(days) {
    const fiveDaysAfterCurrentTimeUTC = moment.utc().add(days, 'days').unix();
    return fiveDaysAfterCurrentTimeUTC;
}

export function encodedData(data) {
    return Object.entries(data)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');
}

console.log(encodedData);