const UserPhotoPost = require("../model/UserPhoto");
const jwt = require('jsonwebtoken');

exports.getPhoto = async (req, res) => {
  const posts = await UserPhotoPost.find();

  return res.json(posts);
};

exports.post = async (req, res) => {
  const { originalname: name, size, key, location: url = "" } = req.file;
  const {
    token
} = req.body;

  const decoded = jwt.decode(token, {
      complete: true
  });
  
  const idUser = decoded.payload["id"];
  
  await UserPhotoPost.deleteOne({idUser:idUser});

  const post = await UserPhotoPost.create({
    idUser,
    name,
    size,
    key,
    url
  });

  return res.json(post);
};

exports.delete = async (req, res) => {
  const post = await UserPhotoPost.findById(req.params.id);

  await post.remove();

  return res.send();
};
