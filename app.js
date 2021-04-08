const express = require('express')
const app = express()
const path = require('path')
const bodyParser = require('body-parser')
const multer = require('multer')
const dotenv = require('dotenv/config')

const jsonParser = bodyParser.json()
const urlencodedParser = bodyParser.urlencoded({extended: false})

const MongoClient = require('mongodb').MongoClient
const url = process.env.MONGO_KEY


//serving static files
app.use(express.static(__dirname + '/static'));

const ObjectID = require('mongodb').ObjectID
const defaultUserImage = './userImages/userimagetest.jpg'


const storage = multer.diskStorage({
    destination: './static/userImages/',
    filename: function(req, file, cb){
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({
    storage: storage
    
}).single('image')


//database operations
MongoClient.connect(url, {useUnifiedTopology:true})
    .then((client)=>{
    console.log('connected to database')
    const db = client.db('users')
    const usersCollection = db.collection('users')
    
    //send login info

app.post('/users', urlencodedParser, (req, res)=>{
    console.log(req.body)
    usersCollection.findOne({name: req.body.name, password: req.body.password})
    .then(result =>{
        res.send(result)
    })
    .catch(error =>{
        res.end()
    })
   
})

    //upload image
app.post('/upload/:id', upload, (req,res)=>{
            usersCollection.updateOne({'_id': new ObjectID(req.params.id)}, {$set: {image: 'http://localhost:3000/userImages/'+req.file.filename}})
             res.end()          
})
    
    
app.delete('/deleteUser/:id', urlencodedParser, (req,res)=>{
    console.log('delete user')
    console.log(req.params.id)
    let details = {'_id': new ObjectID(req.params.id)}
    usersCollection.remove(details).then(result=>{res.end()}).catch(error=>res.end())
    
})
 
app.post('/', urlencodedParser, (req, res)=>{
    console.log(req.body)
    usersCollection.findOne({name: req.body.name})
    .then(item => {
        if(item){
            console.log(item)
            res.send('')
       }else{
            console.log('no such item')
            usersCollection.insertOne({name: req.body.name, password: req.body.password, tasks: [], image: defaultUserImage}).then(result=>{res.send(result)}).catch(error=>{console.log(error)})
           }
    })
    .catch(error => {console.log(error)})
})
    
app.put('/updateImage/:id', urlencodedParser, (req, res)=>{
    console.log('got it')
    usersCollection.updateOne({'_id': new ObjectID(req.params.id)}, {$set: {image: req.body.image}})
})

app.put('/update/:id', urlencodedParser, (req, res)=>{
    console.log(req.body)
    usersCollection.updateOne({'_id': new ObjectID(req.params.id), "tasks.id": req.body.id}, {$set: {"tasks.$.name": req.body.name, "tasks.$.description": req.body.description}})
})
    
app.delete('/users/:id',urlencodedParser, (req, res)=>{
    console.log('delete id '+ req.body.id)
    const details = {'_id': new ObjectID(req.params.id)}
    usersCollection.findOneAndUpdate(details, {$pull:{tasks: {id: req.body.id}}})
})
    
app.put('/newTask/:id', urlencodedParser, (req,res)=>{
    console.log('updateing')
    let id = req.params.id
    let details = {'_id': new ObjectID(id)}
    
    let newTask = {id: req.body.id, name: req.body.name, description: req.body.description, date: new Date().toLocaleDateString()}
    let updatable = {$push: {tasks: newTask}}
    let options = {upsert: true}
    
    usersCollection.updateOne(details, updatable, options)
    usersCollection.findOne(details).then(result=>{res.send(result)}).catch(error=>{console.log(error)})
    
    })

//if successful send the dashboard
app.get('/users', (req,res)=>{
    const cursor = usersCollection.find().toArray()
    .then(result =>{
        res.send(result)
        console.log(result)
    })
    .catch(error=>console.log(error))
})
//send main login page

app.get('/', (req, res)=>{
    res.sendFile(path.join(__dirname,'/static', 'index.html'))
})

})
    .catch(console.error)


app.listen(3000)