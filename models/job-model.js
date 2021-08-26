const mongoose = require('mongoose')

const jobSchema=new mongoose.Schema({
    jobId:{type:String},
    jobTitle:{type:String},
    jobPostedDate:{type:Date},
    role:{type:String},
    responsibility:{type:String},
    companyName:{type:String},
    experienceRequired:{type:Number},
    salaryPackage:{type:Number},
    positionsAvailable:{type:Number},
    location:{type:String},
    skillsRequired:{type:String},
    degree:{type:String},
    companyInformation:{type:String},
    employmentType:{type:String},
    industryType:{type:String},
    searchKeyword:{type:String},
    jobDescription:{type:String}
})

module.exports=mongoose.model('Jobs',jobSchema)