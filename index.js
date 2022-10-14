const express = require("express");
const multer = require("multer");
const upload = multer();
const app = express();
app.use(express.static("./views"));
app.set("view engine", "ejs");
app.set("views", "./views");

const AWS = require("aws-sdk");
const config = new AWS.Config({
  accessKeyId: "",
  secretAccessKey: "",
  region: "ap-southeast-1",
});
AWS.config = config;
const docClient = new AWS.DynamoDB.DocumentClient();
const TableName = "Paper";
app.get("/add", (req, res) => {
  return res.render("add");
});
app.get("/", (req, res) => {
  const params = {
    TableName,
  };
  docClient.scan(params, (err, data) => {
    if (err) {
      return res.send(err);
    }
    return res.render("index", { papers: data.Items });
  });
});

app.post("/", upload.fields([]), (req, res) => {
  const params = {
    TableName,
    Item: {
      id: "" + Math.floor(Math.random() * 10000),
      ...req.body,
    },
  };
  docClient.put(params, (err, data) => {
    if (err) return res.send(err);
    return res.redirect("/");
  });
});
app.post("/delete", upload.fields([]), (req, res) => {
  const listPaper = Object.keys(req.body);
  if (listPaper.length === 0) {
    return res.redirect("/");
  }
  const onDeleteItem = (index) => {
    const params = {
      TableName,
      Key: {
        id: listPaper[index],
      },
    };
    docClient.delete(params, (err, data) => {
      if (err) return res.send(error);
      if (index > 0) {
        onDeleteItem(index - 1);
      } else {
        return res.redirect("/");
      }
    });
  };

  onDeleteItem(listPaper.length - 1);
});
const port = 3000;

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
