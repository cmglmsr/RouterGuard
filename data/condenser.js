import fs from "fs";

// Enter absolute path to payload file
const path = 'C:\\Users\\cemg\\Desktop\\RouterGuard\\data\\XSS\\genericXSS.txt'

let st = new Set()
fs.readFile(path, {encoding: "ascii"}, (err, data) => {
    data = data.split("\r\n")
    for(let i in data) {
        let elt = data[i].trim().substring(0, 7)
        st.add(elt)
    }

    const filePath = 'genericXSS.txt'
    const fileContents = Array.from(st).join('\r\n');

    try {
        fs.writeFileSync(filePath, fileContents, { encoding: 'utf8' });
        console.log('File written successfully.');
    } catch (err) {
        console.error('Error writing file:', err);
    }
})
