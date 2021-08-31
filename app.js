const express = require('express')
const app = express()
const path = require('path')
const bodyParser = require('body-parser')
const multer = require('multer')
const dotenv = require('dotenv/config')
const nodemailer = require('nodemailer')
const favicon = require('serve-favicon')

app.use(favicon(path.join(__dirname, 'static', 'favicon.ico')))

async function mail(userEmail, subject, text) {

  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.E_MAIL, 
      pass: process.env.E_PASSWORD,
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: process.env.E_MAIL,
    to: userEmail, 
    subject: subject,
    html: text,
  });

  console.log("Message sent: %s", info.messageId);
}


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

//pseudo email conformation
app.get('/confirmEmail', (req, res)=>{
    console.log('confirmed')
    res.send('nice')
})


//Database operations
MongoClient.connect(url, {useUnifiedTopology:true})
    .then((client)=>{
    console.log('connected to database')
    const db = client.db('users')
    const usersCollection = db.collection('users')
    
//Send login info
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
            usersCollection.updateOne({'_id': new ObjectID(req.params.id)}, {$set: {image: process.env.URL+'/userImages/'+req.file.filename}})
             res.end()          
})

//Email recovery
app.put('/recovery', urlencodedParser, (req, res)=>{
    console.log(req.body.email)
    usersCollection.findOne({email: req.body.email}).then(result => {
        console.log(result._id)
        var mailText ='<p>follow <a href='+process.env.URL+'/newPassword/'+result._id+'>this link</a> to change the password</p>'
        mail(req.body.email, "password recovery", mailText).catch(console.error);
        res.send(result)})
        .catch(error => {console.log(error)})
})

//Link to new password form
app.get('/newPassword/:id',(req, res)=>{
    console.log(req.params.id)
    res.sendFile(path.join(__dirname,'/static', 'newPasswordForm.html'))
})
    
//Change password
app.put('/changePassword', urlencodedParser, (req, res)=>{
    console.log(req.body)
    usersCollection.findOneAndUpdate({'_id': new ObjectID(req.body.id)}, {$set: {password: req.body.password}}).then(result =>{res.send('updated')})
    
})
    
//Delete a user 
app.delete('/deleteUser/:id', urlencodedParser, (req,res)=>{
    console.log('delete user')
    console.log(req.params.id)
    let details = {'_id': new ObjectID(req.params.id)}
    usersCollection.remove(details).then(result=>{res.end()}).catch(error=>res.end())
    res.send('update')
})

//Create new user
app.post('/', urlencodedParser, (req, res)=>{
    console.log(req.body)
    usersCollection.findOne({name: req.body.name})
    .then(item => {
        if(item){
            console.log(item)
            res.send('')
       }else{
            console.log('no such item')
           var mailText = "<p>this is a conformation mail, if u registered please confirm ur address by clicking - </p><a href='"+process.env.URL+"/confirmEmail'>this link</a>"
            mail(req.body.email, "confirm email", mailText).catch(console.error);
            usersCollection.insertOne({name: req.body.name, password: req.body.password, tasks: [], image: defaultUserImage, email: req.body.email}).then(result=>{res.send(result)}).catch(error=>{console.log(error)})
           }
    })
    .catch(error => {console.log(error)})
})

    
//Change image to one of default images
app.put('/updateImage/:id', urlencodedParser, (req, res)=>{
    usersCollection.updateOne({'_id': new ObjectID(req.params.id)}, {$set: {image: req.body.image}})
})

    
//Update a task
app.put('/update/:id', urlencodedParser, (req, res)=>{
    console.log(req.body)
    usersCollection.updateOne({'_id': new ObjectID(req.params.id), "tasks.id": req.body.id}, {$set: {"tasks.$.name": req.body.name, "tasks.$.description": req.body.description}})
    usersCollection.findOne({'_id': new ObjectID(req.params.id)}).then(result => {
        console.log('task updated')
        console.log(result)
        res.send(result)})
})
    
//Update counter task
app.put('/updateCount/:id', urlencodedParser, (req, res)=>{
    console.log(req.body.count)
    usersCollection.findOneAndUpdate({'_id': new ObjectID(req.params.id), "tasks.id": req.body.id}, {$set: {"tasks.$.typeInfo": req.body.count}}, {returnOriginal: false}).then(result => {
        console.log(result.value)
        res.send(result.value)
    })
})
//Update checklist task
app.put('/updateChecklist/:id', urlencodedParser, (req, res)=>{
    console.log('update ckeclikst')
    usersCollection.findOneAndUpdate({'_id': new ObjectID(req.params.id), "tasks.id": req.body.id}, {$set: {"tasks.$.typeInfo": req.body.typeInfo}}, {returnOriginal: false}).then(result => {
        console.log(result.value)
        res.send(result.value)
    })
    //usersCollection.findOne({'_id': new ObjectID(req.params.id)}).then(result =>{res.send(result)})

})

    
//Delete a task
app.delete('/users/:id',urlencodedParser, (req, res)=>{
    console.log('delete id '+ req.body.id)
    const details = {'_id': new ObjectID(req.params.id)}
    usersCollection.findOneAndUpdate(details, {$pull:{tasks: {id: req.body.id}}}, {returnOriginal: false}).then(result => {
        res.send(result.value)
    })
    
})

    
//Add new task
app.put('/newTask/:id', urlencodedParser, (req,res)=>{
    let id = req.params.id
    let details = {'_id': new ObjectID(id)}
    
    let newTask = {id: req.body.id, name: req.body.name, description: req.body.description, date: new Date().toLocaleDateString(), type: req.body.type, typeInfo: req.body.typeInfo}
    let updatable = {$push: {tasks: newTask}}
    let options = {returnOriginal: false}
    
    usersCollection.findOneAndUpdate(details, updatable, options).then(result=>{
        console.log(result.value)
        res.send(result.value)}).catch(error=>{console.log(error)})
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

app.listen(process.env.PORT || 3000, ()=>{console.log('server is working on port 3000')})