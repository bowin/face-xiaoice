let req = require('request-promise')
const cheerio = require('cheerio')
req =  req.defaults({jar: true})
const request = require('request')
const fs = require('fs')

async function upload(img) {
    const tid = await req({
        uri: 'http://kan.msxiaobing.com/V3/Portal?task=yanzhi&tid=',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.73 Safari/537.36',
        },
        transform: function(body) {
            const $ = cheerio.load(body)
            return $("input[name='tid']").val()
        }
    })
    const data = fs.readFileSync(img)
    const option = {
        method: 'POST',
        url: 'http://kan.msxiaobing.com/Api/Image/UploadBase64',
        body: data.toString('base64'),
    }
    let uploadResult = await req(option)
    uploadResult = JSON.parse(uploadResult)
    const time = Date.now()
    const seconds = Math.floor(time / 1000)
    const body = `MsgId=${time}&CreateTime=${seconds}&${encodeURIComponent('Content[imageUrl]')}=${encodeURIComponent(uploadResult.Host + uploadResult.Url)}`
    const analyse = {
        method: 'POST',
        uri: `http://kan.msxiaobing.com/Api/ImageAnalyze/Process?service=yanzhi&tid=${tid}`,
        form: {
            MsgId: time,
            CreateTime: seconds,
            'Content[imageUrl]': uploadResult.Host + uploadResult.Url
        },
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Accept': '*/*',
            'Accept-Language': 'zh-CN,zh;q=0.8',
            Referer: 'https://kan.msxiaobing.com/ImageGame/Portal?task=yanzhi&feid=4b40cb73cb47046d20585604105bc4fd',
            'x-ms-request-id': 'PO1y9',
            'x-ms-request-root-id' : 'PVkKU',
            'X-Requested-With': 'XMLHttpRequest'
        }
    }
    return await req(analyse)
}
upload('face.jpg')
.then( d => {
    console.log(d)
    process.exit(0)
})
.catch(e => {
    console.error(e)
    console.error(e.stack)
    process.exit(-1)
})