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




const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
