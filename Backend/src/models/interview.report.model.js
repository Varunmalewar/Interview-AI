const mongoose = require('mongoose')

/**
 * job description
 * resume text
 * self description 
 * 
 *  Match Score : Number
 * 
 * Technical Question : [{question,intention,answer}]
 * Behavioral Questions : [{question,intention,answer}]
 * Skill gaps : [{skill,severity{low , medium , high}}]
 * Preparation Plan : [{dayNumber,focus : String , tasks : [String]}]
 */

const technicalQuestionSchema = new mongoose.Schema({
    question:{
        type:String,
        required :[true,"question is required"]
    },
    intention:{
        type:String,
        required :[true,"intention is required"]
    },
    answer:{
        type:String,
        required :[true,"answer is required"]
    }
},{
    _id :false
})

const behavioralQuestionSchema = new mongoose.Schema({
    question:{
        type:String,
        required :[true,"question is required"]
    },
    intention:{
        type:String,
        required :[true,"intention is required"]
    },
    answer:{
        type:String,
        required :[true,"answer is required"]
    }
},{
    _id:false
})

const skillGapSchema = new mongoose.Schema({
    skill:{
        type:String,
        required :[true,"skill is required"]
    },
    severity:{
        type:String,
        enum : ["low", "medium", "high"],
        required :[true,"severity is required"]
    }
},{
    _id : false
})

const preparationPlanSchema = new mongoose.Schema({
    day:{
        type:Number,
        required :[true,"day number is required"]
    },
    focus:{
        type:String,
        required :[true,"focus is required"]
    },
    tasks:[
        {
            type:String,
            required :[true,"tasks is required"]
        }
    ]
},{
    _id : false
})


const interviewReportSchema = new mongoose.Schema({
    jobDescription :{
        type : String,
        required :[ true,"Job description is required"]
    },
    resume :{
        type : String,
    },
    selfDescription :{
        type : String,
    },
    matchScore :{
        type : Number,
        min: 0,
        max: 100,
    },
    title :{
        type : String,
    },
    technicalQuestions :[technicalQuestionSchema],
    behavioralQuestions :[behavioralQuestionSchema],
    skillGaps:[skillGapSchema],
    preparationPlan :[preparationPlanSchema],
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users",
        
    }
    

},{
    timestamps : true
})


const InterviewReportModel = mongoose.model("InterviewReport",interviewReportSchema)

module.exports = InterviewReportModel