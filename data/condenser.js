import lvs from "fast-levenshtein"
import regexgen from "regexgen"
import fs from "fs";

function condense(path) {
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
}

function lvsCondense(path) {
    const contents = fs.readFileSync(path, {encoding: "ascii"})
    let cts = contents.split('\r\n')
    let visited = {}
    let rxs = []
    for(const i in cts) {
        if(visited[i]) continue
        console.log((i/cts.length)*100 + '% Completed')
        let key = cts[i]
        let toRegexList = []
        toRegexList.push(key)
        for(let j = i; j < cts.length; j++) {
            if(visited[j]) continue
            let cur = cts[j]
            if(lvs.get(key, cur) < 20) {
                visited[j] = true
                toRegexList.push(cur)
            }
        }
        const rx = regexgen(toRegexList)
        rxs.push(rx)
    }
    console.log(rxs)
    console.log(rxs.length)
}
let inputs = ['<script\x0Atype="text/javascript">javascript:alert(1);</script>\n', '<script\x2Ftype="text/javascript">javascript:alert(1);</script>']

const path = 'C:\\Users\\cemg\\Desktop\\RouterGuard\\data\\XSS\\genericXSS.txt'

const dist = lvs.get(inputs[0], inputs[1])
const rx = regexgen(inputs)

lvsCondense(path)