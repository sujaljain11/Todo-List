//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require ("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const password = encodeURIComponent("hHJwj1EAMu64cOlT");
// mongoose.connect("mongodb+srv://admin_todolist:" + password + "@ToDoList.iwcwkms.mongodb.net/todolistDB", { useNewUrlParser: true });
mongoose.connect("mongodb+srv://admin_todolist:" + password + "@todolist.xrvpf8e.mongodb.net", { useNewUrlParser: true });

const itemSchema = new mongoose.Schema({
  name: String,
  priority: Number
});

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});

const Item = mongoose.model("Item",itemSchema);
const List = mongoose.model("List", listSchema);


const item1 = new Item({
  name: "Welcome to your todolist!",
  priority: 2
});
const item2 = new Item({
  name: "Hit the + to add an item",
  priority: 1
});
const item3 = new Item({
  name: "<--- Hit this to delete an item",
  priority: 0
});
const defaultItems = [item1,item2,item3];

app.get("/", function (req, res) {
  Item.find({})
    .sort({ priority: -1 }) 
    .then((foundItems) => {
      if (foundItems.length === 0) {
        Item.insertMany(defaultItems)
          .then(() => {})
          .catch((err) => {
            console.log(err);
          });
        res.redirect("/");
      }
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    })
    .catch((err) => {
      console.log(err);
    });
});

  
  

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const priority = req.body.priority;

  
  Item.findOne({ name: itemName })
    .then((existingItem) => {
      if (existingItem) {
        console.log("Item with the same name already exists.");
        
      } else {
        const listName = req.body.list;
        const item = new Item({
          name: itemName,
          priority: priority,
          list: listName,
        });

        if (listName === "Today") {
          item.save();
          res.redirect("/");
        } else {
          List.findOne({ name: listName })
            .then((foundList) => {
              foundList.items.push(item);
              foundList.save();
              res.redirect("/" + listName);
            })
            .catch((err) => {
              console.log(err);
            });
        }
      }
    })
    .catch((err) => {
      console.log(err);
    });
});



app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  
  if(listName === "Today"){
  Item.findByIdAndRemove(checkedItemId)
    .then(() => {
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
    });
  }
  else{
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}})
      .then(() => {
        res.redirect("/" + listName);
      })
      .catch(err => {
        console.log(err);
      });
    
  }
});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  
  List.findOne({ name: customListName })
    .then((foundList) => {
      if (foundList) {
        
        res.render("list", { listTitle: customListName, newListItems: foundList.items });
      } else {
        
        const list = new List({
          name: customListName,
          items: defaultItems,
        });

        list.save()
          .then(() => {
            res.redirect("/" + customListName);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
