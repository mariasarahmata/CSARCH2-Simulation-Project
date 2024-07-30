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

    if (handleSpecialCases(numInput)) {
      return;
    }

    convertNumber(numInput, base, expInput);
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
    const inputLower = numInput.toLowerCase();

    if (inputLower === 'snan') {
      const result = handleNaN(true, false);
      setOutput(result.binary, result.hex);
      return true;
    }

    if (inputLower === 'qnan') {
      const result = handleNaN(false, true);
      setOutput(result.binary, result.hex);
      return true;
    }

    if (inputLower === 'infinity') {
      const result = handleInfinity(false);
      setOutput(result.binary, result.hex);
      return true;
    }

    if (inputLower === '-infinity') {
      const result = handleInfinity(true);
      setOutput(result.binary, result.hex);
      return true;
    }

    if (numInput === '-0') {
      const result = handleNegativeZero();
      setOutput(result.binary, result.hex);
      return true;
    }

    if (numInput === '0') {
      const result = handlePositiveZero();
      setOutput(result.binary, result.hex);
      return true;
    }

    return false;
  }

  function convertNumber(numInput, base, expInput) {
    const signBit = determineSign(numInput);
    const splitNumber = numInput.toString().split('.');

    if (checkForErrors(numInput, base, expInput, signBit, splitNumber)) {
      let integerPart = parseFloat(splitNumber[0]);
      let decimalPart = splitNumber[1] ? parseFloat('0.' + splitNumber[1]) : 0;

      if (/^[-+]?0*\.?0*$/.test(numInput)) {
        binaryOutput.innerText = '0 00000000 00000000000000000000000';
        hexOutput.innerText = '00000000';
      } else if (base === '2') {
        const normalized = normalizeBinary(integerPart.toString(), decimalPart.toString(), parseInt(expInput));
        const binary = normalized[0].split('.');
        if (!checkSpecialCases(signBit, normalized[1], binary[0], '0.' + binary[1], 1)) {
          const binaryString = normalized[0];
          const exponent = 127 + normalized[1];
          const exponentRep = intToBinary(exponent);
          const binaryAnswer = `${signBit} ${extractExponent(exponentRep)} ${extractMantissa(binaryString.split('.')[1])}`;
          const hexAnswer = binaryToHex(binaryAnswer.split(' ').join(''));

          binaryOutput.innerText = formatBinaryParts(binaryAnswer);
          hexOutput.innerText = hexAnswer;
        }
      } else if (base === '10') {
        numInput = ((integerPart + decimalPart) * Math.pow(10.0, parseInt(expInput))).toString();
        const splitNumber = numInput.split('.');
        integerPart = parseFloat(splitNumber[0]);
        decimalPart = splitNumber[1] ? parseFloat('0.' + splitNumber[1]) : 0;

        const integerBinary = intToBinary(integerPart);
        const decimalBinary = decToBinary(decimalPart);
        const normalized = normalizeDecimal(integerBinary, decimalBinary, parseInt(expInput));
        const binary = normalized[0].split('.');
        const binaryMantissa = normalized[0].split('.')[1];

        if (!checkSpecialCases(signBit, Number(expInput), binary[0], '0.' + binary[1], 0)) {
          const exponent = 127 + normalized[1];
          const exponentRep = intToBinary(exponent);
          const binaryAnswer = `${signBit} ${extractExponent(exponentRep)} ${extractMantissa(binaryMantissa)}`;
          const hexAnswer = binaryToHex(binaryAnswer.split(' ').join(''));

          binaryOutput.innerText = formatBinaryParts(binaryAnswer);
          hexOutput.innerText = hexAnswer;
        }
      }
    }
  }

  function checkForErrors(numInput, base, expInput, signBit, splitNumber) {
    if (numInput === '' || expInput === '') {
      errorOutput.innerText = 'ERROR: Null input';
      clearOutputs();
      return false;
    }

    if (signBit === '1') {
      splitNumber[0] = splitNumber[0].substring(1);
    }

    if (splitNumber.length > 2) {
      errorOutput.innerText = 'ERROR: Not a valid input';
      clearOutputs();
      return false;
    }

    if (base === '2') {
      if (!/^[-+]?[01]+$/.test(splitNumber[0]) || (splitNumber[1] != null && !/^[01]+$/.test(splitNumber[1]))) {
        errorOutput.innerText = 'ERROR: Not a valid binary input';
        clearOutputs();
        return false;
      }
    } else if (base === '10') {
      if (!/^[-+]?[0-9]+(\.?[0-9]*)$/.test(splitNumber[0]) || (splitNumber[1] != null && !/^[0-9]*$/.test(splitNumber[1]))) {
        errorOutput.innerText = 'ERROR: Not a valid decimal input';
        clearOutputs();
        return false;
      }
    }

    return true;
  }

  function checkSpecialCases(signBit, exponent, integer, decimal, isBase2) {
    const expDenorm = isBase2 ? -126 : -38;
    const expInfi = isBase2 ? 127 : 38;

    if (exponent < expDenorm) {
      decimal = decimal.split('.')[1];
      while (exponent !== expDenorm) {
        if (integer === undefined || integer === '') {
          integer = '0';
        }
        const temp = integer.slice(-1);
        exponent++;
        decimal = temp + decimal;
        integer = integer.slice(0, -1);
      }

      const binaryAnswer = `${signBit} 00000000 ${extractMantissa(decimal)}`;
      const hexAnswer = binaryToHex(binaryAnswer.split(' ').join(''));

      binaryOutput.innerText = binaryAnswer;
      hexOutput.innerText = hexAnswer;

      return true;
    } else if (exponent > expInfi) {
      const binaryAnswer = `${signBit} 11111111 00000000000000000000000`;
      const hexAnswer = binaryToHex(binaryAnswer.split(' ').join(''));

      binaryOutput.innerText = binaryAnswer;
      hexOutput.innerText = hexAnswer;

      return true;
    }
    return false;
  }

  function saveToFile(numInput, base, expInput) {
    const binaryOut = binaryOutput.innerText;
    const hexOut = hexOutput.innerText;

    if (hexOut !== '' && binaryOut !== '') {
      const data = `INPUT\nNumber: ${numInput}\nBase: ${base}\nExponent: ${expInput}\n\nOUTPUT\nBinary Number: ${binaryOut}\nHexadecimal Number: ${hexOut}\n`;

      const blob = new Blob([data], { type: 'text/plain' });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Binary32_Converter.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else {
      errorOutput.innerText = "ERROR: Can't save to file, output is empty. Please Convert first.";
    }
  }

  function determineSign(input) {
    return input.startsWith('-') ? '1' : '0';
  }

  function intToBinary(number) {
    return (parseInt(number, 10) >>> 0).toString(2).padStart(32, '0');
  }

  function formatBinaryParts(binary) {
    return binary.replace(/(.{1})(.{8})(.{8})(.{8})(.{8})/, '$1 $2 $3 $4 $5');
  }

  function binaryToHex(binary) {
    return parseInt(binary.replace(/\s+/g, ''), 2).toString(16).toUpperCase().padStart(8, '0');
  }

  function extractExponent(binary) {
    return binary.slice(-8);
  }

  function extractMantissa(binary) {
    return binary.padEnd(23, '0').slice(0, 23);
  }

  function handleNaN(signBit, quiet) {
    const binary = `${signBit} 11111111 ${quiet ? '10000000000000000000000' : '11111111111111111111111'}`;
    return {
      binary: formatBinaryParts(binary),
      hex: binaryToHex(binary),
    };
  }

  function handleInfinity(signBit) {
    const binary = `${signBit} 11111111 00000000000000000000000`;
    return {
      binary: formatBinaryParts(binary),
      hex: binaryToHex(binary),
    };
  }

  function handleNegativeZero() {
    return {
      binary: '1 00000000 00000000000000000000000',
      hex: '80000000',
    };
  }

  function handlePositiveZero() {
    return {
      binary: '0 00000000 00000000000000000000000',
      hex: '00000000',
    };
  }

  function normalizeBinary(integer, decimal, exponent) {
    let normalizedBinary = integer + (decimal ? '.' + decimal : '');
    let actualExponent = exponent;

    while (normalizedBinary.length > 0 && normalizedBinary[0] === '0') {
      normalizedBinary = normalizedBinary.slice(1);
    }

    if (normalizedBinary.length === 0) {
      return { binary: '0', exponent: 0 };
    }

    const dotIndex = normalizedBinary.indexOf('.');
    if (dotIndex !== -1) {
      normalizedBinary = normalizedBinary.slice(0, dotIndex) + normalizedBinary.slice(dotIndex + 1);
      actualExponent -= dotIndex;
    } else {
      actualExponent -= normalizedBinary.length;
      normalizedBinary = normalizedBinary;
    }

    normalizedBinary = normalizedBinary.slice(0, 23);
    return { binary: normalizedBinary, exponent: actualExponent };
  }

  function normalizeDecimal(integer, decimal, exponent) {
    let normalizedBinary = integer + (decimal ? '.' + decimal : '');
    let actualExponent = exponent;

    while (normalizedBinary.length > 0 && normalizedBinary[0] === '0') {
      normalizedBinary = normalizedBinary.slice(1);
    }

    if (normalizedBinary.length === 0) {
      return { binary: '0', exponent: 0 };
    }

    const dotIndex = normalizedBinary.indexOf('.');
    if (dotIndex !== -1) {
      normalizedBinary = normalizedBinary.slice(0, dotIndex) + normalizedBinary.slice(dotIndex + 1);
      actualExponent -= dotIndex;
    } else {
      actualExponent -= normalizedBinary.length;
      normalizedBinary = normalizedBinary;
    }

    normalizedBinary = normalizedBinary.slice(0, 23);
    return { binary: normalizedBinary, exponent: actualExponent };
  }
});
