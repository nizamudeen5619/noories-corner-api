const express= require('express');
const app=express();
const api=require('./api');
const morgan=require('morgan');
const bodyParser=require('body-parser');
const cors=require('cors');

app.set('port',(process.env.PORT || 8083));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(cors());
app.use('/api',api)
app.use(express.static('static'))
app.use(morgan('dev'))

const mongoose= require('mongoose');

mongoose.connect('mongodb+srv://jobsApp:luffy@cluster0.fspj8.mongodb.net/JobsApp?retryWrites=true&w=majority',{useNewUrlParser:true});

const db=mongoose.connection;
db.on('error',console.error.bind(console,'connection error'));
db.once('open',function(){
    console.log('Connected to MongoDB');
    app.listen(app.get('port'),function(){
        console.log('API Server Listening on port' + app.get('port') + '!');
    });
});