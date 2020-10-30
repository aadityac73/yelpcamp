var YelpCamp       = require("../models/campground"),
    Comment        = require("../models/comments");

var middleware = {};

middleware.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "You need to be logged in to do that");
    res.redirect("/login");
}

middleware.checkCapmgroundOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        YelpCamp.findById(req.params.id, function(err, foundCamp){
            if(err || !foundCamp) {
                req.flash("error", "Campground not found!");
                res.redirect("back");
            } else {
                if(foundCamp.author.id.equals(req.user._id)){
                    next();
                } else {
                    req.flash("error", "You do not have permission to do that");
                    res.redirect("back");
                }
            }
        });
    }
    else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
}

middleware.checkCommentOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, comment){
            if(err || !comment){
                req.flash("error", "Comment not found!!");
                res.redirect("back");
            } else{
                if(comment.author.id.equals(req.user._id)){
                    next();
                } else{
                    req.flash("error", "You do not have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
}

module.exports = middleware;