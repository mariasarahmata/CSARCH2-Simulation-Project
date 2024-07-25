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
    let fractionalPart = parts[1] || '';

    if (integerPart === '0' && fractionalPart) {
        let firstOneIndex = fractionalPart.indexOf('1');
        return {
            mantissa: fractionalPart.substring(firstOneIndex + 1).padEnd(23, '0').slice(0, 23),
            exponent: -firstOneIndex - 1
        };
    } else {
        let shift = integerPart.length - 1;
        return {
            mantissa: (integerPart.substring(1) + fractionalPart).padEnd(23, '0').slice(0, 23),
            exponent: shift
        };
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
