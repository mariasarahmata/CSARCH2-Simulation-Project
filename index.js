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

    if (numInput === '' || expInput === '') {
      errorOutput.innerText = 'ERROR: Please enter both a number and an exponent';
      return;
    }

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
    errorOutput.innerText = '';
  }

  function handleSpecialCases(numInput) {
    if (numInput.toLowerCase() === 'snan') {
      const result = handleNaN(true, false);
      setOutput(result.binary, result.hex);
      return true;
    }

    if (numInput.toLowerCase() === 'qnan') {
      const result = handleNaN(false, true);
      setOutput(result.binary, result.hex);
      return true;
    }

    if (numInput.toLowerCase() === 'infinity') {
      const result = handleInfinity(false);
      setOutput(result.binary, result.hex);
      return true;
    }

    if (numInput.toLowerCase() === '-infinity') {
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
          const binaryAnswer = signBit + ' ' + extractExponent(exponentRep) + ' ' + extractMantissa(binaryString.split('.')[1]);
          const hexAnswer = binaryToHex(signBit + extractExponent(exponentRep) + extractMantissa(binaryString.split('.')[1]));

          binaryOutput.innerHTML = formatBinaryParts(binaryAnswer);
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
          const binaryAnswer = signBit + ' ' + extractExponent(exponentRep) + ' ' + extractMantissa(binaryMantissa);
          const hexAnswer = binaryToHex(signBit + extractExponent(exponentRep) + extractMantissa(binaryMantissa));

          binaryOutput.innerHTML = formatBinaryParts(binaryAnswer);
          hexOutput.innerText = hexAnswer;
        }
      }
    }
  }

  function checkForErrors(numInput, base, expInput, signBit, splitNumber) {
    if (numInput === '' || expInput === '') {
      errorOutput.innerText = 'ERROR: Please enter both a number and an exponent';
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
      while (exponent != expDenorm) {
        if (integer === undefined || integer === '') {
          integer = '0';
        }
        const temp = integer.slice(-1);
        exponent++;
        decimal = temp + decimal;
        integer = integer.slice(0, -1);
      }

      const binaryAnswer = signBit + ' 00000000 ' + extractMantissa(decimal);
      const hexAnswer = binaryToHex(binaryAnswer.split(' ').join(''));

      binaryOutput.innerText = binaryAnswer;
      hexOutput.innerText = hexAnswer;

      return true;
    } else if (exponent > expInfi) {
      const binaryAnswer = signBit + ' 11111111 00000000000000000000000';
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
    return input.includes('-') ? '1' : '0';
  }

  function extractMantissa(mantissa) {
    if (mantissa.length >= 23) {
      return mantissa.slice(0, 23);
    }
    return mantissa.padEnd(23, '0').replace(/[^01]/g, '0');
  }

  function extractExponent(input) {
    return input.padStart(8, '0');
  }

  function intToBinary(integer) {
    return (integer >>> 0).toString(2);
  }

  function decToBinary(input) {
    let fractional = '';
    let temp;
    let count = 0;

    while (input % 1 !== 0) {
      input *= 2;
      temp = Math.floor(input);
      fractional += temp >= 1 ? '1' : '0';
      if (temp >= 1) input -= 1;
      count += 1;
      if (count === 23) break;
    }
    if (fractional.length >= 23) {
      return fractional.slice(0, 23);
    }
    return fractional.padEnd(23, '0').replace(/[^01]/g, '0');
  }

  function binaryToHex(binary) {
    let a = binary;
    let b = '';

    if (binary.includes('.')) {
      const arr = binary.split('.');
      a = arr[0];
      b = arr[1];
    }

    const an = a.length % 4;
    const bn = b.length % 4;

    if (an !== 0) a = '0'.repeat(4 - an) + a;
    if (bn !== 0) b = '0'.repeat(4 - bn) + b;

    let res = binaryToHexConvert(a);
    if (b.length > 0) res += '.' + binaryToHexConvert(b);

    return res;
  }

  function binaryToHexConvert(binary) {
    const hexIndex = [
      '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'
    ];

    return binary
      .match(/.{1,4}/g)
      .map(v => hexIndex[parseInt(v, 2)])
      .join('');
  }

  function formatBinaryParts(binaryStr) {
    const binaryParts = binaryStr.split(' ');
    const signBit = binaryParts[0];
    const exponentBit = binaryParts[1];
    const mantissaBit = binaryParts[2];
    return `${signBit} ${exponentBit} ${mantissaBit}`;
  }

  function normalizeBinary(integer, decimal, exponent) {
    let binary = '';
    let count = 0;

    if (integer.length === 1 && integer === '1') {
      decimal = decimal.split('.')[1] || '0';
      binary = integer + '.' + decimal;
    } else if (integer.length > 1) {
      decimal = decimal.split('.')[1] || '0';
      while (integer !== '1') {
        const temp = integer.slice(-1);
        count += 1;
        decimal = decimal.padStart(decimal.length + 1, temp);
        integer = integer.slice(0, -1);
      }
      binary = '1.' + decimal;
      exponent = count + exponent;
    } else if (integer === '0') {
      decimal = decimal.split('.')[1];
      let temp = decimal;
      while (temp.charAt(0) !== '1') {
        temp = temp.slice(1);
        count += 1;
      }
      count += 1;
      temp = temp.slice(1);
      binary = '1.' + temp;
      exponent = exponent - count;
    }

    return [binary, exponent];
  }

  function normalizeDecimal(integer, decimal, exponent) {
    let binary = '';
    let count = 0;

    if (decimal == 0) {
      exponent = 0;
    }

    if (integer.toString().length === 1 && integer === '1') {
      binary = integer + '.' + decimal;
    } else if (integer.toString().length > 1) {
      while (integer !== '1') {
        const temp = integer.slice(-1);
        count += 1;
        decimal = decimal.padStart(decimal.toString().length + 1, temp);
        integer = integer.slice(0, -1);
      }
      binary = '1.' + decimal;
      exponent = count;
    } else if (integer == 0) {
      let temp = decimal;

      while (temp.charAt(0) != '1') {
        temp = temp.toString(2).slice(1);
        count += 1;
      }
      count += 1;
      temp = temp.toString(2).slice(1);
      binary = '1.' + temp;
      exponent = 0 - count;
    }

    return [binary, exponent];
  }

  function handleNaN(isSignaling, isQuiet) {
    let sign = 'x'; // Default sign bit
    let binary, hex;

    if (isSignaling) {
      binary = `${sign} 11111111 01xxxxxxxxxxxxxxxxxxxxx`;
      hex = '7FC00000'; // Example of sNaN
    } else if (isQuiet) {
      binary = `${sign} 11111111 1xxxxxxxxxxxxxxxxxxxxxx`;
      hex = '7FA00000'; // Example of qNaN
    } else {
      binary = `${sign} 11111111 00000000000000000000000`;
      hex = '7FC00000'; // Example of general NaN
    }

    return { binary, hex };
  }

  function handleInfinity(isNegative) {
    let sign = isNegative ? '1' : '0';
    let binary = `${sign} 11111111 00000000000000000000000`;
    let hex = isNegative ? 'FF800000' : '7F800000';

    return { binary, hex };
  }

  function handleNegativeZero() {
    let binary = '1 00000000 00000000000000000000000';
    let hex = '80000000';

    return { binary, hex };
  }

  function handlePositiveZero() {
    let binary = '0 00000000 00000000000000000000000';
    let hex = '00000000';

    return { binary, hex };
  }

  function setOutput(binary, hex) {
    document.getElementById('binaryOutput').textContent = binary;
    document.getElementById('hexOutput').textContent = hex;
  }
});
