// Helper to keep number within range
// Returns min value if not a number
function fitRange(num, min, max) {
    // Check if not number
    if (isNaN(num)) {
        return min;
    }

    // Otherwise fit within range
    num = (num > max ? max : num);
    num = (num < min ? min : num);
    return num;
}
exports.fitRange = fitRange;