document.addEventListener('DOMContentLoaded', () => {
    const numberInput = document.getElementById('number');
    const baseSelect = document.getElementById('base');
    const exponentInput = document.getElementById('exponent');
    const binaryOutput = document.getElementById('binaryOutput');
    const hexOutput = document.getElementById('hexOutput');
    const errorOutput = document.getElementById('error');

    document.getElementById('convert-button').addEventListener('click', handleConversion);
    document.getElementById('clear-button').addEventListener('click', handleClear);
    document.getElementById('download-button').addEventListener('click', handleDownload);

    function handleConversion() {
        const numInput = numberInput.value.trim();
        const expInput = exponentInput.value.trim();
        const base = baseSelect.value;
        clearOutputs();

        if (!numInput || expInput === '') {
            errorOutput.innerText = 'ERROR: Null input';
            return;
        }

        const result = handleSpecialCases(numInput) || convertNumber(numInput, base, parseInt(expInput));
        if (result) {
            setOutput(result.binary, result.hex);
        }
    }

    function handleClear() {
        numberInput.value = '';
        baseSelect.value = '2';
        exponentInput.value = '';
        clearOutputs();
    }

    function handleDownload() {
        const numInput = numberInput.value.trim();
        const expInput = exponentInput.value.trim();
        const base = baseSelect.value;
        saveToFile(numInput, base, expInput);
    }

    function clearOutputs() {
        binaryOutput.innerText = '';
        hexOutput.innerText = '';
        errorOutput.innerText = '';
    }

    function handleSpecialCases(numInput) {
        switch (numInput.toLowerCase()) {
            case '0':
                return buildIEEE754('0', 0, '0'.repeat(23));
            case '-0':
                return buildIEEE754('1', 0, '0'.repeat(23));
            case 'infinity':
                return buildIEEE754('0', 255, '0'.repeat(23));
            case '-infinity':
                return buildIEEE754('1', 255, '0'.repeat(23));
            default:
                return false;
        }
    }

    function convertNumber(numInput, base, expInput) {
        const signBit = determineSign(numInput);
        let [integerPart, decimalPart] = numInput.split('.');
        decimalPart = decimalPart ? '0.' + decimalPart : '0.0';

        if (base === '2') {
            return convertBinaryNumber(signBit, integerPart, decimalPart, expInput);
        } else if (base === '10') {
            return convertDecimalNumber(signBit, integerPart, decimalPart, expInput);
        }
    }

    function convertBinaryNumber(signBit, integerPart, decimalPart, exponent) {
        let binary = integerPart + decimalPart.substring(1); // Remove the '0.'
        let normalized = normalizeBinary(binary, exponent);
        if (normalized.exponent + 127 < 1) { // Denormalization check
            return handleDenormalized(signBit, normalized.binary);
        }
        return buildIEEE754(signBit, normalized.exponent + 127, normalized.mantissa);
    }

    function normalizeBinary(binary, exponent) {
        while (binary.length > 1 && binary.charAt(0) === '0') {
            binary = binary.substring(1);
            exponent--;
        }
        let mantissa = binary.substring(1, 24); // Get the first 23 bits after the leading '1'
        return { exponent, mantissa };
    }

    function handleDenormalized(signBit, binary) {
        let exponentBits = '00000000'; // All bits zero for denormalized numbers
        let mantissa = binary.padEnd(23, '0'); // Pad or trim the mantissa as necessary
        return buildIEEE754(signBit, exponentBits, mantissa);
    }

    function buildIEEE754(signBit, exponent, mantissa) {
        let exponentBits = exponent.toString(2).padStart(8, '0');
        let mantissaBits = mantissa.padEnd(23, '0');
        let binary = `${signBit} ${exponentBits} ${mantissaBits}`;
        let hex = binaryToHex(binary.replace(/ /g, ''));
        return { binary, hex };
    }

    function binaryToHex(binary) {
        return parseInt(binary, 2).toString(16).toUpperCase().padStart(8, '0');
    }

    function determineSign(input) {
        return input[0] === '-' ? '1' : '0';
    }

    function setOutput(binary, hex) {
        binaryOutput.textContent = binary;
        hexOutput.textContent = hex;
    }

    function saveToFile(numInput, base, expInput) {
        const binary = binaryOutput.textContent;
        const hex = hexOutput.textContent;
        const data = `Input Number: ${numInput}\nBase: ${base}\nExponent: ${expInput}\n\nBinary: ${binary}\nHexadecimal: ${hex}`;
        const blob = new Blob([data], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'conversion.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }
});
