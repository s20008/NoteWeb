const express = require('express');
const { use } = require('express/lib/application');
const router = express.Router();

const mongoose = require('mongoose');//引入mongoose模块
//连接数据库
mongoose.connect('mongodb://localhost:27017/Noteweb_DB', function (err) {
    if (!err) {
        console.log("Database connection was successful");
    } else {
        console.log("Database connection failed");
    }
});


//用户-数据结构
const userSchema = new mongoose.Schema({
    userID: String,
    username: String,
    password: String,

});

//便签类型-数据结构
const noteTypeSchema = new mongoose.Schema({
    Note_Type: String,
    type: String,
});
//便签-数据结构
const noteListSchema = new mongoose.Schema({
    Note_Type: String,
    type: String,
    userID: String,
    username: String,
    title: String,
    content: String,
    time: Number
});

//便签投稿-数据结构
const contributionListSchema = new mongoose.Schema({
    Note_id: String,
    userID: String,
    username: String,
    note_title: String,
    content: String,
    time: Number
});

const userModel = mongoose.model('user', userSchema);
const noteTypeModel = mongoose.model('Note_Type', noteTypeSchema);
const noteListModel = mongoose.model('Note_List', noteListSchema);
const contributionListModel = mongoose.model('contribution_List', contributionListSchema);


//添加便签类型
function createType() {
    noteTypeModel.find(function (err, data) {
        console.log(!err, data.length < 5, data.length);
        if (!err && data.length < 5) {
            const type_list = [
                { Note_Type: "ニュース", type: '1' },
                { Note_Type: "学問", type: '2' },
                { Note_Type: "食べ物", type: '3' },
                { Note_Type: "趣味", type: '4' },
                { Note_Type: "その他雑談", type: '5' },
            ]
            type_list.forEach(item => {
                const noteType = new noteTypeModel()
                noteType.Note_Type = item.Note_Type
                noteType.type = item.type
                noteType.save()
            });
        }
    })
}

createType()



//登录路由
router.post('/user_login.html', function (req, res) {
    const userID = req.body.userID;
    const password = req.body.password;
    userModel.find({ userID, password }, function (error, data) {
        if (data.length) {
            if (data[0].password != password) {
                res.send('1') //密码错误
            } else {
                res.cookie(
                    { 'userID': userID, '_id': data[0]._id, 'username': data[0].username }
                );
                res.send({ 'userID': userID, '_id': data[0]._id, 'username': data[0].username })
            }
        } else {
            res.send('0') //用户名错误
        }
    })
});


//注册接口
router.post('/user_add.html', function (req, res) {
    const userID = req.body.userID;
    const username = req.body.username;
    const password = req.body.password;
    // console.log(userID, username, password)
    userModel.find({ userID, username }, function (error, data) {
        console.log(error, data)
        if (data.length) {
            res.send('0')
        }
        else {
            const user = new userModel();
            user.userID = userID
            user.username = username
            user.password = password
            user.save(function (err) {
                if (!err) {
                    res.send('1')
                }
            })
        }
    })
})

//获取便签类型列表
router.get('/getNoteTypeList.html', function (req, res) {
    noteTypeModel.find(function (err, data) {
        if (!err) {
            res.send(data)
        } else {
            res.send('取得失敗')
        }
    })
})

//获取指定便签列表数据
router.get('/getNoteList.html', function (req, res) {
    const type = req.query.type;
    noteListModel.find({ type }, function (err, data) {
        if (!err) {
            res.send(data.reverse())
        } else {
            res.send('取得失敗')
        }
    })
})
//新建对应便签的内容
router.post('/createNote.html', function (req, res) {
    const title = req.body.title;
    const content = req.body.content;
    const userID = req.body.userID;
    const username = req.body.username;
    const Note_Type = req.body.Note_Type;
    const type = req.body.type;
    const time = new Date().getTime();
    const note = new noteListModel();
    note.title = title
    note.content = content
    note.userID = userID
    note.username = username
    note.Note_Type = Note_Type
    note.type = type
    note.time = time
    console.log(note)
    note.save(function (err) {
        if (!err) {
            res.send('1')
        }
    })
})

//获取对应便签的内容
router.get('/getNnoteList.html', function (req, res) {
    const _id = req.query.note_id;
    noteListModel.findOne({ _id }, function (err, data) {
        if (!err) {
            res.send({ 'title': data.title })
        } else {
            res.send('取得失敗')
        }
    })
})

//获取对应便签的投稿内容
router.get('/getContributionList.html', function (req, res) {
    const Note_id = req.query.note_id;
    contributionListModel.find({ Note_id }, function (err, data) {
        if (!err) {
            if (data.length) {
                data.sort(function (a, b) { return a - b });//排序从旧到新
                //data.splice(49);//裁剪前50个
                res.send(data)
            } else {
                noteListModel.find({ "_id": Note_id }, function (err, data) {
                    res.send({ 'title': data.title })
                })
            }
        } else {
            res.send('取得失敗')
        }
    })
})



//获取最新50条
router.get('/getContribution_Fivety.html', function (req, res) {
    const Note_id = req.query.note_id;
    contributionListModel.find({ Note_id }, function (err, data) {
        if (!err) {
            if (data.length) {
                data.reverse();
                data.splice(49);//裁剪前50个
                res.send(data)
            } else {
                noteListModel.find({ "_id": Note_id }, function (err, data) {
                    res.send({ 'title': data.title })
                })
            }
        } else {
            res.send('取得失敗')
        }
    })
})


//新建对应便签的投稿内容
router.post('/createNoteContribution.html', function (req, res) {
    const note_title = req.body.title;
    const content = req.body.content;
    const userID = req.body.userID;
    const username = req.body.username;
    const Note_id = req.body.Note_id;
    const time = new Date().getTime();

    const noteContribution = new contributionListModel();
    noteContribution.note_title = note_title
    noteContribution.content = content
    noteContribution.userID = userID
    noteContribution.username = username
    noteContribution.Note_id = Note_id
    noteContribution.time = time
    noteContribution.save(function (err) {
        if (!err) {
            res.send('1')
        } else {
            res.send('0')
        }
    })
})


//删除对应便签的投稿内容
router.post('/noteContribution_delete.html', function (req, res) {
    const _id = req.body._id;//得到用，分隔的字符串
    contributionListModel.find({ _id }, function (err, data) {
        if (!err) {
            console.log(data);
            data.forEach(item => {
                item.remove()
            });
            res.send('1');
        }
    })
});






router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express1' });
});
module.exports = router;
