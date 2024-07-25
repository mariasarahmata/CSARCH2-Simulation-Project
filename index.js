document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('convert-button').addEventListener('click', convert);
    document.getElementById('clear-button').addEventListener('click', clearFields);
});

function convert() {
    const number = document.getElementById("number").value.trim();
    const base = document.getElementById("base").value;
    const exponentInput = parseInt(document.getElementById("exponent").value.trim() || "0", 10);

    if (!number || isNaN(exponentInput)) {
        alert("Please ensure all fields are filled in correctly.");
        return;
    }

    let result = (base === '2') ? convertBase2(number, exponentInput) : convertDecimalToBase2(number, exponentInput);
    document.getElementById('binaryOutput').textContent = result.binary;
    document.getElementById('hexOutput').textContent = result.hex;
}

function convertBase2(binaryString, exponent) {
    let sign = binaryString.startsWith('-') ? '1' : '0';
    let mantissa = binaryString.replace(/^-/, '');
    let normalized = normalizeBinary(mantissa);
    let ePrime = normalized.exponent + 127 + exponent;
    let binary = `${sign}${ePrime.toString(2).padStart(8, '0')}${normalized.mantissa}`;
    let hex = binaryToHex(binary);
    return { binary, hex };
}

function convertDecimalToBase2(decimalString, exponent) {
    let number = parseFloat(decimalString);
    let sign = number < 0 ? '1' : '0';
    number = Math.abs(number);

    let binaryString = number.toString(2);
    let normalized = normalizeBinary(binaryString);
    let ePrime = normalized.exponent + 127 + exponent;
    let binary = `${sign}${ePrime.toString(2).padStart(8, '0')}${normalized.mantissa}`;
    let hex = binaryToHex(binary);
    return { binary, hex };
}

function normalizeBinary(binaryString) {
    let parts = binaryString.split('.');
    let integerPart = parts[0];
    let fractionalPart = parts.length > 1 ? parts[1] : '';
    let shift, normalizedMantissa;

    // Handle numbers less than 1 where integer part is '0'
    if (integerPart === '0' || integerPart === '') {
        // Find the first '1' in the fractional part to determine the shift
        let firstOneIndex = fractionalPart.indexOf('1');
        if (firstOneIndex === -1) {
            // The number is actually zero
            return { mantissa: '0'.repeat(23), exponent: -127 }; // Exponent for zero in IEEE-754
        }
        // Adjust the fractional part to start after the first '1'
        normalizedMantissa = fractionalPart.substring(firstOneIndex + 1);
        shift = -firstOneIndex - 1; // Negative because we are shifting to the right
    } else {
        // For numbers with a non-zero integer part, normalize based on the location of the first '1'
        shift = integerPart.length - 1;
        normalizedMantissa = (integerPart.substring(1) + fractionalPart); // Skip the leading '1'
    }

    // Ensure the mantissa is exactly 23 bits long
    normalizedMantissa = (normalizedMantissa + '0'.repeat(23)).substring(0, 23);

    return {
        mantissa: normalizedMantissa,
        exponent: shift
    };
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
