// Helper to pad string with zeroes
function pad(value, num) {
    string = String(value);
    while (string.length < num) {
        string = "0" + string;
    }
    return string;
}

// Return the current date/time as a string with format:
// DD/MM/YYYY HH:MM:SS
function getDateTimeString() {
    const date = new Date();
    var string = "";

    // DD/MM/YYYY
    string += date.getDate();
    string += "/";
    string += (date.getMonth() + 1);
    string += "/";
    string += date.getFullYear();
    string += " ";

    // HH:MM:SS
    string += pad(date.getHours(), 2);
    string += ":";
    string += pad(date.getMinutes(), 2);
    string += ":";
    string += pad(date.getSeconds(), 2);

    return string;
}
exports.getDateTimeString = getDateTimeString;