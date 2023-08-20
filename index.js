const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose=require('mongoose');
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }).catch(error => console.error(error));;

const peopleSchema=new mongoose.Schema({
  username:{type:String},

})
const User=mongoose.model("User",peopleSchema);
const exerciseSchema=new mongoose.Schema({
  userId:{type:String,required:true},
  username:{type:String,required:true},
  description:String,
  duration:Number,
  date:Date
})
const Exercise=mongoose.model("Exercise",exerciseSchema);
app.use(cors())
app.use(express.json())
app.use(express.static('public'))
app.use(express.urlencoded({extended:true}))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
app.get('/api/users',async(req,res)=>{
  const user=await User.find({}).select("_id username");
  if(!user){
    res.send('No Users');
  }
  else{
    res.json(user);
  }
})
app.post('/api/users', async (req, res) => {
  const useObj=new User({
    username:req.body.username
  })
  try{
    const user=await useObj.save();
    console.log(user)
    res.json(user)
  }
  catch(err){
    console.log(err)
  }
});

app.post('/api/users/:_id/exercises', async (req, res) => {
  const id=req.params._id;
  try{
  const  user=await User.findById(id)
  if(!user){
    res.send('Could not find the user')
  }
  else{
    const exObj=new Exercise({
      userId:user._id,
      username:user.username,
      description:req.body.description,
      duration:req.body.duration,
      date:req.body.date? new Date(req.body.date):new Date()
    })
    const exercise=await exObj.save();
    console.log(exercise)
    res.json({
      username:exercise.username,
      description:exercise.description,
      duration:exercise.duration,
      date:exercise.date.toDateString(),
      _id:exercise.userId

    })
  }
}catch(error){
  console.log(error);
  res.send('Error with saving the exercise')
}
});
app.get('/api/users/:_id/logs',async (req,res)=>{
  const {from,to,limit}=req.query;
  const id=req.params._id;
  const logs=await Exercise.find({userId:id});
  if(!logs){
    console.log(logs)
    res.send('Log is not available');
  }
  else{
    let dateObj={};
    if(from){
      dateObj['$gte']=new Date(from)
    }
    if(to){
      dateObj['$lte']=new Date(to)
    }
    let filter={
      userId:id
    }
    if(from||to){
      filter.date=dateObj
    }
    const exercise=await Exercise.find(filter).limit(+limit??500);
    const log=exercise.map(e=>({
      description:e.description,
      duration:e.duration,
      date:e.date.toDateString(),

    }))
    res.json({
      username:exercise.username,
      count:exercise.length,
      _id:exercise.userId,
      log
    })
  }

})
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
