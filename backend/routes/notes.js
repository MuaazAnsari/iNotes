const express = require("express");
const router = express.Router();
const fetchUser = require('../middleware/fetchUser');
const Notes = require('../models/Notes');
const { body, validationResult } = require("express-validator");

// ROUTE 1 : fetch all notes of the user using GET : /api/notes/fetchallnotes  "login required"
router.get('/fetchallnotes', fetchUser, async (req,res,next) =>{
    try {
        const notes = await Notes.find({user : req.user.id});
        res.json(notes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Internal Server error!");
      } 
});

// ROUTE 2 : Add notes using  POST : /api/notes/addnotes  "login required"
router.post('/addnotes',[
    body("title", "title should be atleast 3 characters").isLength({ min: 3 }),
    body("description", "Description must be at least 5 characters long").isLength({min : 5}),
  ] , fetchUser, async (req,res,next) =>{

    // If there are errors, return them
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    try {
        const {title, description, tag} = req.body;

        // create a new notes object
        const notes = await new Notes({title, description, tag, user: req.user.id});

        const savedNotes = await notes.save();
        res.json(savedNotes);

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Internal Server error!");
    } 
});

// ROUTE 3 : Update an existing notes using  PUT : /api/notes/updatenotes  "login required"
router.put('/updatenotes/:id', fetchUser, async (req,res,next) =>{

    try {
        const {title, description, tag} = req.body;

        const newNote = {};
        // if title or description or tag exists, update that as newNote object
        if(title) {newNote.title = title};
        if(description) {newNote.description = description};
        if(tag) {newNote.tag = tag};

        // Find the note to be updated and update it
        let note = await Notes.findById(req.params.id);

        //if note doesnt exists
        if(!note){
            return res.status(404).send("Oops , Notes Not Found!");
        }

        // verify wether its the same user
        if(note.user.toString() !== req.user.id){
            return res.status(401).send("Unauthorised Access");
        }

        // update the note

        note = await Notes.findByIdAndUpdate(req.params.id, {$set : newNote}, {new:true});

        res.json(note);

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Internal Server error!");
    } 
});


module.exports = router;
