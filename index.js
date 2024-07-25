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
    let sign = mantissa[0] === '-' ? '1' : '0'; // Ensure sign is correctly captured as '0' or '1'
    mantissa = Math.abs(parseFloat(mantissa)).toString(2); // Convert mantissa to binary

    // Remove the '0.' part for easier manipulation if it's in subnormal form
    if (mantissa.startsWith('0.')) {
        mantissa = mantissa.substring(2);
    } else if (mantissa.includes('.')) {
        mantissa = mantissa.replace('.', '');
    }

    let firstOneIndex = mantissa.indexOf('1');
    if (firstOneIndex === -1) {
        // If no '1' is found, the number is 0
        return { normalizedMantissa: '0'.repeat(23), adjustedExponent: -127 }; // Return a zero representation for IEEE-754
    }

    // Calculate the new exponent based on the position of the first '1'
    let shift = firstOneIndex;
    exponent = exponent - shift; // Adjust the exponent based on the shift
    exponent += 127; // Apply the IEEE-754 bias for the exponent

    // Normalize the mantissa to remove the leading '1' and ensure it's 23 bits long
    mantissa = mantissa.substring(firstOneIndex + 1); // Skip the first '1' which is implied in IEEE format
    let normalizedMantissa = (mantissa + '0'.repeat(23)).substring(0, 23); // Pad and cut to ensure exactly 23 bits

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
