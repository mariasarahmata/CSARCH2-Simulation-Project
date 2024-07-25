document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('convert-button').addEventListener('click', convert);
    document.getElementById('clear-button').addEventListener('click', clearFields);
    document.getElementById('download-button').addEventListener('click', downloadOutput);
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

function convertBase2(binaryString, exponent) {
    let sign = binaryString[0] === '-' ? '1' : '0';
    if (sign === '1') binaryString = binaryString.substring(1); // Remove sign for processing
    let normalized = normalizeBinary(binaryString);
    let binary = formatIEEE754(sign, normalized.exponent + exponent + 127, normalized.mantissa);
    let hex = binaryToHex(binary);
    return {binary, hex};
}

function convertBase10(decimalString, exponent) {
    let decimalValue = parseFloat(decimalString);
    let sign = decimalValue < 0 ? '1' : '0';
    decimalValue = Math.abs(decimalValue);

    let binaryConversion = toBinary(decimalValue);
    let normalized = normalizeBinary(binaryConversion);
    let binary = formatIEEE754(sign, normalized.exponent + exponent + 127, normalized.mantissa);
    let hex = binaryToHex(binary);
    return {binary, hex};
}

function toBinary(decimal) {
    let integerPart = Math.floor(decimal);
    let fractionalPart = decimal - integerPart;
    let binary = integerPart.toString(2);

    if (fractionalPart !== 0) {
        binary += '.';
        let counter = 0;
        while (fractionalPart !== 0 && counter < 52) {  // IEEE 754 uses 52 bits for double precision
            fractionalPart *= 2;
            let bit = Math.floor(fractionalPart);
            binary += bit;
            fractionalPart -= bit;
            counter++;
        }
    }
    return binary;
}

function normalizeBinary(binaryString) {
    let parts = binaryString.split('.');
    let integerPart = parts[0];
    let fractionalPart = parts.length > 1 ? parts[1] : '';
    let shift = integerPart.length - 1;

    let mantissa = (integerPart + fractionalPart).substr(1); // Remove the leading '1' for IEEE-754 mantissa
    return {
        mantissa: mantissa.padEnd(23, '0').substring(0, 23),  // Pad/truncate to 23 bits
        exponent: shift
    };
}

function formatIEEE754(sign, exponent, mantissa) {
    let exponentBinary = exponent.toString(2).padStart(8, '0');
    return `${sign} ${exponentBinary} ${mantissa}`; // Insert spaces for readability
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

function downloadOutput() {
    let binaryOutput = document.getElementById('binaryOutput').textContent;
    let hexOutput = document.getElementById('hexOutput').textContent;
    let content = `Binary Output: ${binaryOutput}\nHexadecimal: ${hexOutput}`;

    let blob = new Blob([content], { type: 'text/plain' });
    let url = window.URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    a.download = 'FloatingPointConversionOutput.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}
