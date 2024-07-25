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
    let normalizedResult = normalizeMantissa(mantissa, exponent);
    let binary = formatIEEE754Binary(normalizedResult.mantissa, normalizedResult.exponent);
    let hex = binaryToHex(binary);
    return {binary, hex};
}

function convertBase10(mantissa, exponent) {
    let decimalValue = parseFloat(mantissa) * Math.pow(10, exponent);
    let normalizedResult = normalizeMantissa(decimalValue.toString(2), 0);
    let binary = formatIEEE754Binary(normalizedResult.mantissa, normalizedResult.exponent);
    let hex = binaryToHex(binary);
    return {binary, hex};
}

function normalizeMantissa(mantissa, exponent) {
    let sign = mantissa.startsWith('-') ? '1' : '0';
    mantissa = Math.abs(parseFloat(mantissa)).toString(2);

    // Normalize the binary string
    if (!mantissa.includes('.')) mantissa += '.0';
    let [integerPart, fractionalPart] = mantissa.split('.');
    let shift = integerPart === '0' ? fractionalPart.indexOf('1') + 1 : 0;
    exponent += (integerPart === '0' ? -shift : integerPart.length - 1);

    // Adjust exponent for IEEE-754 format
    exponent += 127;
    let normalizedMantissa = (integerPart === '0' ? fractionalPart.slice(shift) : fractionalPart).padEnd(23, '0').substring(0, 23);

    return {
        mantissa: sign + normalizedMantissa,
        exponent: exponent
    };
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
