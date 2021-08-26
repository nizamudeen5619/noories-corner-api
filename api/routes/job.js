const Jobs=require('../../models/job-model')

module.exports=function(router){
    router.post('/job',function(req,res){
        let job=new Jobs(req.body)
        job.save(function(err,job){
            if(err){
                return res.status(400).json(err)
            }
            res.status(200).json(job)
        })
    })

    router.get('/job',function(req,res){
        Jobs.find({},function(err,job){
            if(err){
                res.json({status:'failure',message:err})
            }
            else{
                if(!job){
                    res.json({status:'failure',message:'No Job Found'})
                }
                else{
                    res.json({status:'success',job:job})
                }
            }
        })
    })

    router.get('/job/:id',function(req,res){
        if(!req.params.id){
            res.json({status:'failure',message:'No id provided'})
        }
        else{
            Jobs.findOne({_id:req.params.id},function(err,job){
                if(err || !job){
                    res.json({status:'failure',message:'Invalid Id'})
                }
                else{
                    res.json({status:'success',job:job})
                }
            })
        }
    })

    router.put('/job',function(req,res){
        if(!req.body._id){
            res.json({status:'failure',message:'No id provided'})
        }
        else{
            Jobs.findOne({_id:req.body._id},function(err,job){
                if(err){
                    res.json({status:'failure',message:'No id provided'})
                }
                else{
                    job.jobId=req.body.jobId
                    job.jobTitle=req.body.jobTitle
                    job.jobPostedDate=req.body.jobPostedDate
                    job.role=req.body.role
                    job.responsibility=req.body.responsibility
                    job.companyName=req.body.companyName
                    job.experienceRequired=req.body.experienceRequired
                    job.salaryPackage=req.body.salaryPackage
                    job.positionsAvailable=req.body.positionsAvailable
                    job.location=req.body.location
                    job.skillsRequired=req.body.skillsRequired
                    job.degree=req.body.degree
                    job.companyInformation=req.body.companyInformation
                    job.employmentType=req.body.employmentType
                    job.industryType=req.body.industryType
                    job.searchKeyword=req.body.searchKeyword
                    job.jobDescription=req.body.jobDescription

                    job.save(function(err){
                        if(err){
                            res.json({status:'failure',message:err})
                        }
                        else{
                            res.json({status:'success',message:'Job updated'})
                        }
                    })
                }
            })
        }
    })

    router.delete('/job/:id',function(req,res){
        if(!req.params.id){
            res.json({status:'failure',message:'No id provided'})
        }
        else{
            Jobs.findOne({_id:req.params.id},function(err,job){
                if(err || !job){
                    res.json({status:'failure',message:err})
                }
                else{
                    job.remove(function(err){
                        if(err){
                            res.json({status:'failure',message:err})
                        }
                        else{
                            res.json({status:'success',message:'Job Deleted'})
                        }
                    })
                }
            })
        }
    })    
}