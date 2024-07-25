document.addEventListener('DOMContentLoaded', function () {
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

function convertBase2(binary, initialExponent) {
    let sign = binary.startsWith('-') ? '1' : '0';
    binary = binary.replace(/^-/, ''); // Remove negative sign for processing

    let { normalizedBinary, shift } = normalizeBinary(binary);
    let exponent = 127 + initialExponent - shift; // Adjust exponent based on shift and bias

    let mantissa = normalizedBinary.substring(2, 25); // Take 23 bits for mantissa after the leading '1.'
    let binaryResult = `${sign}${exponent.toString(2).padStart(8, '0')}${mantissa.padEnd(23, '0')}`;
    let hex = binaryToHex(binaryResult);

    return { binary: binaryResult, hex };
}

function convertBase10(decimal, exponent) {
    let binary = parseFloat(decimal).toString(2);
    return convertBase2(binary, exponent);
}

function normalizeBinary(binary) {
    let firstOneIndex = binary.indexOf('1');
    if (firstOneIndex === -1) {
        return { normalizedBinary: '1.' + '0'.repeat(23), shift: 0 }; // Edge case for 0
    }
    let normalizedBinary = '1.' + binary.slice(firstOneIndex + 1).replace('.', '');
    return { normalizedBinary, shift: firstOneIndex };
}

function binaryToHex(binary) {
    let hex = '';
    for (let i = 0; i < 32; i += 4) {
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
