const express = require('express');
const router = express.Router();
const User = require('../models/users');
const multer = require('multer');
const fs = require('fs');
//image upload
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '_' + Date.now() + '.jpg')
    }
});
var upload = multer({
    storage: storage
}).single('image');

// post details from form to database
router.post('/add', upload, (req, resp) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: req.file.filename,
    });
    user.save((err) => {
        if (err) {
            resp.json({ message: err.message, type: 'danger' });
        } else {
            req.session.message = {
                type: 'success',
                intro: 'Success!',
                message: 'User added successfully'
            }
        }
        resp.redirect("/");
    });
});
//ROUTE TO GET ALL USERS
router.get("", (req, resp) => {
    User.find({}, (err, users) => {
        if (err) {
            resp.json({
                message: err.message,
            });
        } else {
            resp.render('index', {
                title: "Home Page",
                users: users,
            });
        }
    });
});

router.get('/add', (request, response) => {
    response.render('add_user', { title: "Add User" })
});

//edit an user route
router.get('/edit/:id', (req, resp) => {
    let id = req.params.id;
    User.findById(id, (err, user) => {
        if (err) {
            resp.redirect('/');
        } else {
            resp.render('edit_user', {
                title: "Edit User",
                user: user
            });
        }
    });
});

//update an user route
router.post('/update/:id', upload, (req, resp) => {
    let id = req.params.id;
    let new_image = "";
    if (req.file) {
        new_image = req.file.filename;
        try {
            fs.unlinkSync("./uploads/" + req.body.old_image);
        }
        catch (err) {
            console.log(err);
        }
    } else {
        new_image = req.body.old_image;
    }
    User.findByIdAndUpdate(id, {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: new_image,
    }, (err) => {
        if (err) {
            resp.json({ message: err.message, type: 'danger' });
        } else {
            req.session.message = {
                type: 'success',
                message: 'User updated successfully!',
            }
            resp.redirect('/');
        }
    });
});

//delete an user route
router.get('/delete/:id', (req, resp) => {
    let id = req.params.id;
    User.findByIdAndRemove(id, (err, result) => {
        if (result.image != '') {
            try {
                fs.unlinkSync('./uploads/' + result.image);
            } catch (err) {
                console.log(err)
            }
        }
        if (err) {
            resp.json({ message: err.message })
        } else {
            req.session.message = {
                type: "info",
                message: "User deleted Successfullly",
            }
            resp.redirect('/')
        }
    }) 
})


module.exports = router;
