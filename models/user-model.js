const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    firstname :{type:String},
    lastname:{type:String},
    email:{type:String},
    contactNumber:{type:String},
    password:{type:String},
    address:{type:String},
    skills:{type:String},
    resume:{type:Buffer},
    currentEmployer:{type:String},
    currentDestination:{type:String},
    currentJobDescription:{type:String},
    currentExperience:{type:Number},
    previousEmployer:{type:String},
    previousDestination:{type:String},
    previousJobDescription:{type:String},
    previousExperience :{type:Number},
    collegeUniversity:{type:String},
    collegePassedOutYear:{type:String},
    school:{type:String},
    schoolPassedOutYear:{type:String},
    skillsQualifications:{type:String},
    certifications:{type:String}})
module.exports = mongoose.model('User',userSchema)