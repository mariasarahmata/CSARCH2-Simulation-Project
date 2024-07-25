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
    let binary = decimalToBinary(normalizedMantissa, adjustedExponent);
    let hex = binaryToHex(binary);
    return {binary, hex};
}

function convertBase10(mantissa, exponent) {
    let decimalValue = parseFloat(mantissa) * Math.pow(10, exponent);
    let {normalizedMantissa, adjustedExponent} = normalizeMantissa(decimalValue.toString(), 0);
    let binary = decimalToBinary(normalizedMantissa, adjustedExponent);
    let hex = binaryToHex(binary);
    return {binary, hex};
}

function normalizeMantissa(mantissa, exponent) {
    let sign = mantissa[0] === '-' ? 1 : 0;
    mantissa = Math.abs(parseFloat(mantissa));
    let binary = mantissa.toString(2);
    let index = binary.indexOf('.') - 1;
    let adjustedExponent = 127 + index + exponent; // Adjust for the exponent field
    let normalizedMantissa = binary.replace('.', '').substring(1); // Remove the decimal point and the leading 1
    return {normalizedMantissa: sign + normalizedMantissa.padEnd(23, '0'), adjustedExponent};
}

function decimalToBinary(mantissa, exponent) {
    let exponentBinary = exponent.toString(2).padStart(8, '0');
    return mantissa + exponentBinary;
}

function binaryToHex(binary) {
    let hex = parseInt(binary, 2).toString(16).toUpperCase().padStart(8, '0');
    return hex;
}

function clearFields() {
    document.getElementById("number").value = '';
    document.getElementById("exponent").value = '';
    document.getElementById("binaryOutput").textContent = '';
    document.getElementById("hexOutput").textContent = '';
}
