
    const express = require("express");
    const bodyParser = require("body-parser");
    const _ = require("lodash");
    const mongoose = require("mongoose");

    const app = express();



    mongoose.connect("mongodb+srv://admin-anupama:natsu123@cluster0.swofm.mongodb.net/todolistDB?retryWrites=true&w=majority", {useNewUrlParser: true});

    //schema
    const itemsSchema = {
      name: String
    };

    const listSchema = {
      name: String,
      items: [itemsSchema]
    };

    // model
    const Item = mongoose.model("Item",itemsSchema);
    const List = mongoose.model("List",listSchema);

    app.set('view engine', 'ejs');

    app.use(express.static("public"));

    app.use(bodyParser.urlencoded({extended:true}));

    const item1 = new Item({
      name : "welcome to your todolist "
    });
    const item2 = new Item({
      name : "hit + button to add "
    });
    const item3 = new Item({
      name : "<-- hit this to delete "
    });

    const defaultItems = [item1,item2,item3];




    app.get("/",function (req,res) {

        Item.find({},function(err,foundItems){
          if(foundItems.length==0){
            Item.insertMany(defaultItems,function(err){
              if(err){
                console.log("error");
              }
              else console.log("success");
            });
            res.redirect("/");
          }
            else
            res.render("list",{ kindofday: "Today", newListItems: foundItems});
        });

    });



    app.get("/:customListName",function (req,res) {
     const customListName = _.capitalize(req.params.customListName);

        List.findOne({name:customListName}, function(err, foundList){
          if(!err){
            if(!foundList){
              console.log("doest exists!");
               const list = new List({
                name: customListName,
                items : defaultItems
              });
              list.save(function(){
                  res.redirect("/"+customListName);
              });

            }
            else{
              res.render("list",{ kindofday: foundList.name, newListItems: foundList.items});
            }
          }
        });


    });


    app.post("/",function(req,res){

      let itemName = req.body.newItem;
      const listName = req.body.list;

      const item = new Item({
        name: itemName
      });

      if(listName === "Today"){
       item.save();
       res.redirect("/");
      }
      else{
        List.findOne({name: listName},function(err,foundList){
          foundList.items.push(item);
          foundList.save();
          res.redirect("/"+listName);
        });
      }
    });

    app.post("/delete",function(req,res){
       const checkedItemId = req.body.checkbox;
       const listName = req.body.listName;

       if(listName==="Today"){
         Item.deleteOne({_id: checkedItemId}, function(err){
          if (!err) {
            console.log("Deleted Checked Item");
            res.redirect("/");
         }
       });
     }
       else {

         List.findOneAndUpdate({name: listName},{$pull:{items: {_id : checkedItemId}}}, function(err){
           if(!err){
             res.redirect("/"+listName);
           }
         });

       }
  });


    app.get("/about", function(req,res){
      res.render("about");
    });


    app.listen(8080,function(){
      console.log("server on 8080");
    });
