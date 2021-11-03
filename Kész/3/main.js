const good = "00011101011100";
const bad = "011001010101000";

const longestCommonPattern = (str1, str2) => {
    let n = Math.min(str1.length, str2.length);
    for (let i = 0; i < n; i++) {
        if (str1.charAt(i) != str2.charAt(i)) {
            return splitIntoSubstrings(str1, 0, i);
        }
    }
    return splitIntoSubstrings(str1, 0, n);
}

const splitIntoSubstrings = (string, start, end) => {
    let r = "";
    for (let i = start; i < end; i++) {
        r += string[i];
    }
    return r;
}

const longestRepeatingSubstring = (string) => {
    const suffixes = [];
    for (let i = 0; i < string.length; i++) {
        suffixes.push(splitIntoSubstrings(string, i, string.length));
    }

    suffixes.sort();

    let pattern = '';
    for (let i = 0; i < string.length - 1; i++) {
        const p = longestCommonPattern(suffixes[i], suffixes[i + 1]);
        if (pattern.length < p.length) {
            pattern = p;
        }
    }
    return pattern;
}

const isCodeCorrect = (str) => {
    const result = longestRepeatingSubstring(str);
    return result.length <= 5;
}

console.assert(isCodeCorrect(good));
console.assert(!isCodeCorrect(bad));

const solve = () => {
    let bytes = document.getElementById("textInput").value;

    if (!isCodeCorrect(bytes)) {
        document.getElementById("solution").innerText = "A kód helytelen!"
    } else {
        document.getElementById("solution").innerText = "A kód helyes!"
    }
}