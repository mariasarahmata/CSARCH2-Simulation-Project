document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('convert-button').addEventListener('click', convert);
    document.getElementById('clear-button').addEventListener('click', clearFields);
});

function convert() {
    let number = document.getElementById("number").value.trim();
    let base = document.getElementById("base").value;
    let exponent = parseInt(document.getElementById("exponent").value.trim() || "0", 10);

    if (!number || isNaN(exponent)) {
        alert("Please ensure all fields are filled in correctly.");
        return;
    }

    let result = base === '2' ? convertBase2(number, exponent) : convertBase10(number, exponent);
    document.getElementById('binaryOutput').textContent = result.binary;
    document.getElementById('hexOutput').textContent = result.hex;
}

function convertBase2(binary, exponent) {
    let sign = binary.startsWith('-') ? 1 : 0;
    binary = binary.replace(/^-/, ''); // Remove negative sign for processing
    let normalized = normalizeBinary(binary);
    let adjustedExponent = 127 + exponent + normalized.shift; // Adjust exponent with bias and shift

    let mantissa = normalized.binary.substr(1, 23); // Skip the leading '1' and take the next 23 bits
    let binaryResult = `${sign}${adjustedExponent.toString(2).padStart(8, '0')}${mantissa.padEnd(23, '0')}`;
    let hex = binaryToHex(binaryResult);

    return {binary: binaryResult, hex};
}

function convertBase10(decimal, exponent) {
    // Convert to binary first
    let binary = parseFloat(decimal).toString(2);
    return convertBase2(binary, exponent);
}

function normalizeBinary(binary) {
    let shift = 0;
    if (binary.startsWith('1.')) {
        // Already normalized
        return {binary, shift};
    } else {
        let firstOneIndex = binary.indexOf('1');
        shift = firstOneIndex - 1;
        let normalizedBinary = '1.' + binary.substring(firstOneIndex + 1).replace('.', '');
        return {binary: normalizedBinary, shift};
    }
}

function binaryToHex(binary) {
    let hex = '';
    for (let i = 0; i < binary.length; i += 4) {
        const chunk = binary.substring(i, i + 4);
        const decimal = parseInt(chunk, 2);
        hex += decimal.toString(16).toUpperCase();
    }
    return hex.padStart(8, '0');
}

function clearFields() {
    document.getElementById("number").value = '';
    document.getElementById("exponent").value = '';
    document.getElementById("binaryOutput").textContent = '';
    document.getElementById("hexOutput").textContent = '';
}
