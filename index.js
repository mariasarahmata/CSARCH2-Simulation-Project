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

function convertBase2(mantissa, exponent) {
    let {normalizedMantissa, adjustedExponent} = normalizeMantissa(mantissa, exponent);
    let binary = formatIEEE754Binary(normalizedMantissa, adjustedExponent);
    let hex = binaryToHex(binary);
    return {binary, hex};
}

function convertBase10(mantissa, exponent) {
    let decimalValue = parseFloat(mantissa) * Math.pow(10, exponent);
    let {normalizedMantissa, adjustedExponent} = normalizeMantissa(decimalValue.toString(), 0);
    let binary = formatIEEE754Binary(normalizedMantissa, adjustedExponent);
    let hex = binaryToHex(binary);
    return {binary, hex};
}

function normalizeMantissa(mantissa, exponent) {
    let sign = mantissa[0] === '-' ? '1' : '0';
    mantissa = Math.abs(parseFloat(mantissa)).toString(2);

    if (mantissa.startsWith('0.')) {
        mantissa = mantissa.substring(2);
    } else if (mantissa.includes('.')) {
        mantissa = mantissa.replace('.', '');
    }

    let firstOneIndex = mantissa.indexOf('1');
    if (firstOneIndex === -1) {
        return { normalizedMantissa: '0'.repeat(23), adjustedExponent: -127 };
    }

    let shift = firstOneIndex;
    exponent = exponent - shift + 127;
    mantissa = mantissa.substring(firstOneIndex + 1);
    let normalizedMantissa = (mantissa + '0'.repeat(23)).substring(0, 23);

    return { normalizedMantissa: sign + normalizedMantissa, adjustedExponent: exponent };
}

function formatIEEE754Binary(mantissa, exponent) {
    let exponentBinary = exponent.toString(2).padStart(8, '0');
    return mantissa + exponentBinary;
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
