const User = require("../../models/user-model");
const multer = require("multer");

module.exports = function (router) {
  router.get("/user", function (req, res) {
    User.find({}, (err, user) => {
      if (err) {
        res.json({ status: 'failure', message: err });
      } else {
        if (!user) {
          res.json({ status: 'failure', message: "No user found" });
        } else {
          res.json({ status: 'success', user: user });
        }
      }
    });
  });

  router.post("/user", function (req, res) {
    let user = new User(req.body);
    user.save(function (err, user) {
      if (err) {
        return res.status(400).json(err);
      }
      res.status(200).json(user);
    });
  });

  router.put("/user", (req, res) => {
    if (!req.body._id) {
      res.json({ status: 'failure', message: "id not provided" });
    } else {
      User.findOne({ _id: req.body._id }, (err, user) => {
        if (err) {
          res.json({ status: 'failure', message: "id not provided" });
        } else {
          user.firstname = req.body.firstname;
          user.lastname = req.body.lastname;
          user.email = req.body.email;
          user.contactNumber = req.body.contactNumber;
          user.password = req.body.password;
          user.address = req.body.address;
          user.skills = req.body.skills;
          user.resume = req.body.resume;
          user.currentEmployer = req.body.currentEmployer;
          user.currentDestination = req.body.currentDestination;
          user.currentJobDescription = req.body.currentJobDescription;
          user.currentExperience = req.body.currentExperience;
          user.previousEmployer = req.body.previousEmployer;
          user.previousDestination = req.body.previousDestination;
          user.previousJobDescription = req.body.previousJobDescription;
          user.previousExperience = req.body.previousExperience;
          user.collegeUniversity = req.body.collegeUniversity;
          user.collegePassedOutYear = req.body.collegePassedOutYear;
          user.school = req.body.school;
          user.schoolPassedOutYear = req.body.schoolPassedOutYear;
          user.skillsQualifications = req.body.skillsQualifications;
          user.certifications = req.body.certifications;
          user.save((err) => {
            if (err) {
              res.json({ status: 'failure', message: err });
            } else {
              res.json({ status: 'success', message: "user updated successfully" });
            }
          });
        }
      });
    }
  });

  router.delete("/user/:id", (req, res) => {
    if (!req.params.id) {
      res.json({ status: 'failure', message: "id not Provided" });
    } else {
      User.findOne({ _id: req.params.id }, (err, user) => {
        if (err || !user) {
          res.json({ status: 'failure', message: "Invalid Id" });
        } else {
          user.remove((err) => {
            if (err) {
              res.json({ status: 'failure', message: err });
            } else {
              res.json({ status: 'success', message: "user detail deleted successfully" });
            }
          });
        }
      });
    }
  });
  router.get("/user/:id", (req, res) => {
    if (!req.params.id) {
      res.json({ status: 'failure', message: "id not provided" });

    } else {
      User.findOne({ _id: req.params.id }, (err, user) => {
        if (err || !user) {
          res.json({ status: 'failure', message: "Invalid id" });
        } else {
          res.json({ status: 'success', user: user });
        }
      });
    }
  });
  router.get("/login/:email", (req, res) => {
    if (!req.params.email) {
      res.json({ status: 'failure', message: "Email not provided" });
    } else {
      User.findOne({ email: req.params.email }, (err, user) => {
        if (err || !user) {
          res.json({ status: 'failure', message: "Invalid Email" });
        } else {
          res.json({ status: 'success', user: user });
        }
      })
    }
  })

  //upload resume
  const storage = multer.diskStorage ({
    destination : function (req, file, cb) {
      cb(null, "resume/");
    },
    filename: function (req, file, cb){
      cb(null, req.params.id+'.pdf');
    },
  });
  const upload = multer({ storage: storage});
  router.post("/user/:id/resume-upload", upload.single("resume"), function (req, res) {
    console.log("files", req.file);
    res.json(req.file);
  })

}