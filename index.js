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

        if (handleSpecialCases(numInput)) {
            return;
        }

        convertNumber(numInput, base, parseInt(expInput));
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
        if (errorOutput) errorOutput.innerText = '';
    }

    function handleSpecialCases(numInput) {
        let binary, hex;
        switch (numInput.toLowerCase()) {
            case '0':
                binary = buildIEEE754('0', 0, '0'.repeat(23));
                hex = binaryToHex(binary.replace(/ /g, ''));
                break;
            case '-0':
                binary = buildIEEE754('1', 0, '0'.repeat(23));
                hex = binaryToHex(binary.replace(/ /g, ''));
                break;
            case 'infinity':
                binary = buildIEEE754('0', 255, '0'.repeat(23));
                hex = binaryToHex(binary.replace(/ /g, ''));
                break;
            case '-infinity':
                binary = buildIEEE754('1', 255, '0'.repeat(23));
                hex = binaryToHex(binary.replace(/ /g, ''));
                break;
            case 'snan':
                binary = buildIEEE754('x', 255, '01' + 'x'.repeat(21));
                hex = '7FC00001'; // Placeholder hex for signaling NaN
                break;
            case 'qnan':
                binary = buildIEEE754('x', 255, '1' + 'x'.repeat(22));
                hex = '7FE00000'; // Placeholder hex for quiet NaN
                break;
            default:
                return false;
        }
        setOutput(binary, hex);
        return true;
    }

    function convertNumber(numInput, base, expInput) {
        const signBit = determineSign(numInput);
        let [integerPart, decimalPart] = numInput.includes('.') ? numInput.split('.') : [numInput, '0'];
        decimalPart = decimalPart ? '0.' + decimalPart : '0.0';

        if (base === '2') {
            const result = convertBinaryNumber(signBit, integerPart, decimalPart, expInput);
            setOutput(result.binary, result.hex);
        } else if (base === '10') {
            const result = convertDecimalNumber(signBit, integerPart, decimalPart, expInput);
            setOutput(result.binary, result.hex);
        }
    }

    function convertBinaryNumber(signBit, integerPart, decimalPart, exponent) {
        let normalized = normalizeBinary(integerPart + decimalPart.substring(1), exponent); // Removes '0.'
        let effectiveExponent = 127 + normalized.exponent;

        if (effectiveExponent <= 0) {  // Handling for denormalized numbers
            return handleDenormalized(signBit, normalized.binary);
        } else if (effectiveExponent >= 255) {
            return handleInfinity(signBit === '1');
        } else {
            let mantissa = normalized.binary.substring(1, 24); // Get the first 23 bits after the leading '1'
            return buildIEEE754(signBit, effectiveExponent.toString(2), mantissa);
        }
    }

    function normalizeBinary(binary, exponent) {
        // Shift the binary to the right until the first '1' is at the leftmost position
        while (binary.length > 1 && binary.charAt(0) === '0') {
            binary = binary.substring(1);
            exponent--;
        }
        return { binary, exponent };
    }

    function handleDenormalized(signBit, binary) {
        let mantissa = binary.substring(1, 24).padEnd(23, '0'); // Remove leading '1' and pad to 23 bits
        return buildIEEE754(signBit, '00000000', mantissa);
    }

    function buildIEEE754(signBit, exponent, mantissa) {
        const exponentBits = exponent.toString(2).padStart(8, '0'); // Ensure the exponent has 8 bits
        const mantissaBits = mantissa.padEnd(23, '0'); // Ensure the mantissa has 23 bits
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
