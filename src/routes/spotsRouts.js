'use strict'

const express = require('express');
const router = express.Router();
const multer = require("multer");
const multerConfig = require("./config/multer");

const Post = require("./app/model/Spot");

router.get("/posts", async (req, res) => {
  const posts = await Post.find();

  return res.json(posts);
});

router.post("/posts", multer(multerConfig).single("file"), async (req, res) => {
  const { originalname: name, size, key, location: url = "" } = req.file;

  const post = await Post.create({
    name,
    size,
    key,
    url
  });

  return res.json(post);
});

router.delete("/posts/:id", async (req, res) => {
  const post = await Post.findById(req.params.id);

  await post.remove();

  return res.send();
});

module.exports = router;
