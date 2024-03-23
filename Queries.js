// Find all the topics and tasks which are thought in the month of October
db.task.aggregate([
    {
        $match: {
            deadline: {$gte: ISODate('2020-10-01') , $lte : ISODate('2020-10-31')}
        }
    },
    {
        $project: {
            _id: 0 ,
            task_id: 1,
            task_name: 1,
            deadline : 1
        }
    },
    {
        $unionWith:{
            coll: "topics",
            pipeline: [
                {
                    $match: {
                        date: {$gte: ISODate('2020-10-01') , $lte : ISODate('2020-10-31')}
                    }
                },
                {
                    $project: {
                        _id: 0 ,
                        topic_id: 1,
                        topic_name: 1,
                        date : 1
                    }
                },
            ]
        }
    }
   ]).pretty();

   //Find all the company drives which appeared between 15 oct-2020 and 31-oct-2020
   db.company.find({date: {$gte: ISODate('2020-10-15') , $lte : ISODate('2020-10-31') }}).pretty();
//Find all the company drives and students who are appeared for the placement.

db.company.aggregate([
    {
        $lookup: {
            from: "users",
            localField: "students",
            foreignField: "user_name",
            as : "Placed"
        }
    },
    {
        $unwind: {
            path: "$Placed"
        }
    },
    {
        $project: {
            _id: 0,
            company_name: 1,
            date: 1,
            "Placed.user_id" : 1,
            "Placed.user_name": 1,
            "Placed.email": 1
        }
    }
  ]).pretty();
//Find the number of problems solved by the user in codekata
db.users.aggregate([
    {
      $unwind: "$problem_id"
    },
    {
      $lookup: {
        from: "codekata",
        localField: "problem_id",
        foreignField: "problem_id",
        as: "solved_problems"
      }
    },
    {
      $group: {
        _id: "$user_id",
        user_name: { $first: "$user_name" },
        solved_problems_count: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        user_id: "$_id",
        user_name: 1,
        solved_problems_count: 1
      }
    }
  ])
//Find all the mentors with who has the mentee's count more than 15
db.mentor.find({mentees_count:{ $gt: 15}}).pretty();

//Find the number of users who are absent and task is not submitted  between 15 oct-2020 and 31-oct-2020
db.attendance.aggregate([
    {
      $match: {
        attend: false
      }
    },
    {
      $lookup: {
        from: "task",
        localField: "user_id",
        foreignField: "user_id",
        as: "user_tasks"
      }
    },
    {
      $match: {
        "user_tasks.deadline": { $gte: ISODate('2020-10-15'), $lte: ISODate('2020-10-31') },
        "user_tasks.submitted": false
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "user_id",
        foreignField: "user_id",
        as: "user_details"
      }
    },
    {
      $project: {
        _id: 0,
        user_id: "$user_id",
        user_name: "$user_details.user_name"
      }
    }
  ])