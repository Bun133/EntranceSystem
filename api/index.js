const logic = require('./logic.js');

// ライブラリ読み込み
var express = require('express');
var app = express();
var bodyParser = require('body-parser');

//body-parserの設定
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var port = process.env.PORT || 3000; // port番号を指定

app.get('/api/checkin/:id/:section', function (req, res) {
    let id = req.params.id
    let section = req.params.section
    res.json(logic.checkIn(id, section))
});

app.get('/api/sections/', (req, res) => {
    res.json(logic.loader.syncSections())
})

app.get('/api/sections/:section', (req, res) => {
    let section = req.params.section
    res.json({
        'Result': logic.checkSection(section),
        'SectionName': section
    })
})

app.get('/api/list/checkin/:section', ((req, res) => {
    let section = req.params.section
   res.json(logic.getCheckedInCustomersInSection(section))
}))

//サーバ起動
app.listen(port);
console.log('listen on port ' + port);