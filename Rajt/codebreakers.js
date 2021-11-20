
export function firstBreaker(original) {
    var mixedvalue = original.split('');
    for (var i = 0; i < mixedvalue.length / 2; i++) {
        if (i % 2 == 0) {
            var tmp = mixedvalue[i];
            mixedvalue[i] = mixedvalue[mixedvalue.length - 1 - i];
            mixedvalue[mixedvalue.length - 1 - i] = tmp;
        }
    }
    return mixedvalue.join('');
}

export function secondBreaker(encrypted, salt) {
    var mixedvalue = [];
    for (var i = 0; i < encrypted.length; i++)
        mixedvalue.push(encrypted.charCodeAt(i));
    for (var i = 0; i < mixedvalue.length - 2; i += 3) {
        var tmp = mixedvalue[i + 2];
        mixedvalue[i + 2] = mixedvalue[i + 1];
        mixedvalue[i + 1] = mixedvalue[i];
        mixedvalue[i] = tmp;
    }
    for (var i = 0; i < mixedvalue.length; i++) {
        mixedvalue[i] = (0 - mixedvalue[i]) + 158;
    }
    var result = "";
    for (var i = 0; i < mixedvalue.length; i++) {
        result += String.fromCharCode(mixedvalue[i]);
    }
    return result.substring(0, encrypted.length - salt.length);
}

const maskBases =
    [
        [213, 43, 65, 123, 76, 43, 134, 76, 23],
        [43, 42, 65, 76, 41, 7, 98, 23, 65],
        [76, 201, 3, 165],
        [45, 65, 3, 65, 78, 105],
        [7, 9, 3, 235, 76, 176, 127, 189, 167],
        [54, 76, 123, 153, 213, 123, 254],
        [32, 12, 65, 55, 55, 67, 86],
    ];

export function thirdBreaker(encrypted) {
    const passwordOptions = maskBases.map(maskbase => {
        var mixedvalue = [];
        for (let i = 0; i < encrypted.length; i += 2) {
            const hexText = encrypted.substring(i, i + 2);
            const hex = parseInt(hexText, 16);
            mixedvalue.push(hex);
        }

        var tmp = [0, 0, 0, 0];
        for (var ti = 0; ti < 4; ti++) {
            tmp[ti] = mixedvalue[(mixedvalue.length - 4) + ti];
        }
        for (var i = (mixedvalue.length - 4); i > 0; i -= 4) {
            for (var ti = 0; ti < 4; ti++) {
                mixedvalue[i + ti] = mixedvalue[i - 4 + ti];
            }
        }
        for (var ti = 0; ti < 4; ti++) {
            mixedvalue[ti] = tmp[ti];
        }

        var realmask = [];
        var maskindex = 0;
        while (realmask.length < mixedvalue.length) {
            realmask.push(maskbase[maskindex]);
            maskindex++;
            if (maskindex >= maskbase.length) maskindex = 0;
        }

        for (var i = 0; i < mixedvalue.length; i++)
            mixedvalue[i] = mixedvalue[i] ^ realmask[i];

        mixedvalue = mixedvalue.filter(v => v != 0);
        console.log({ mixedvalue });

        var result = "";
        for (var i = 0; i < mixedvalue.length; i++) {
            result += String.fromCharCode(mixedvalue[i]);
        }
        return result;
    })
    return passwordOptions.filter(p => ![...p].some(ch => ch.charCodeAt(0) < 32 || ch.charCodeAt(0) > 126))[0];
}