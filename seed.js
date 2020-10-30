var mongoose = require("mongoose");
var YelpCamp = require("./models/campground");
var Comment = require("./models/comments");

var camps = [
    {
        name: "Camp 1",
        img: "https://images.freeimages.com/images/small-previews/1bc/camping-1407985.jpg",
        description: "Blah blah blah"
    },
    {
        name: "Camp 2",
        img: "https://images.freeimages.com/images/small-previews/964/scout-camp-1547941.jpg",
        description: "Blah blah blah"
    },
    {
        name: "Camp 3",
        img: "https://media.gettyimages.com/photos/father-and-son-camping-together-picture-id833226490?b=1&k=6&m=833226490&s=612x612&w=0&h=DLMj5yTtYcUzxhpqDkALL6q5JMPNaulqayrgdMm-5L4=",
        description: "Blah blah blah"
    }
]
function seedDB(){
    YelpCamp.remove({}, function(err){
        if(err) {
            console.log(err);
        } 
        console.log("All data has removed");
        // camps.forEach(function(camp){
        //     YelpCamp.create(camp, function(err, newcamp){
        //         if(err) {
        //             console.log(err);
        //         } else {
        //             console.log("Campground created");
        //             Comment.create({
        //                 comment: "Nice campground",
        //                 author: "Aditya"
        //             }, function(err, new_comment){
        //                 newcamp.comments.push(new_comment);
        //                 newcamp.save();
        //                 console.log("Created new comment");
        //             });
        //         }
        //     });
        // });
    });
}

module.exports = seedDB;