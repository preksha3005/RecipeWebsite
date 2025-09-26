import express from "express";
import mongoose from "mongoose";
import cors from "cors";
// import bcrypt from "bcrypt";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import User from "./models/User.js";
import Recipe from "./models/Recipe.js";
import { userInfo } from "os";

dotenv.config();
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  cors({
    origin: "https://recipefrontend-vgrt.onrender.com",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(cookieParser()); // middleware function in Express.js that enables the parsing of cookies in incoming requests.
// mongoose.connect("mongodb://localhost:27017/travel").then(() => {
//     console.log("MongoDB connected successfully!");
//   })

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully!");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    // Exit process with failure code if database connection fails
    process.exit(1);
  });

app.post("/sign", async (req, res) => {
  const { name, email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    return res.json({ message: "User already exists with that email." });
  } else {
    const hashp = await bcrypt.hash(password, 10);
    await User.create({ name: name, email: email, password: hashp });
    return res.json({ status: true, message: "Account created" });
  }
});

app.post("/loginapp", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.json({ message: "User does not exist" });
  } else {
    const pass = await bcrypt.compare(password, user.password);
    if (!pass) {
      return res.json({ message: "Wrong password" });
    } else {
      const token = jwt.sign(
        { id: user._id, name: user.name },
        process.env.KEY,
        {
          expiresIn: "1h",
        }
      );
      res.cookie("token", token, {
        httpOnly: true,
        secure: true, // Always set to true for production HTTPS
        sameSite: "None", // 'None' is required for cross-site cookies
        maxAge: 3600000,
      });

      return res.json({ status: true, message: "Login successful" });
    }
  }
});

app.post("/forgotpass", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.json({ message: "User not found" });
  else {
    const token = jwt.sign({ id: user._id, name: user.name }, process.env.KEY, {
      expiresIn: "5m",
    });
    var transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL,
        pass: process.env.PASS,
      },
    });
    var mailOptions = {
      from: process.env.MAIL,
      to: email,
      subject: "Reset Password",
      text: `Click on the link to reset your password:  http://localhost:3000/resetpass/${token}`,
    };
    transport.sendMail(mailOptions, (err, info) => {
      if (err) {
        return res.json({ message: "Error sending mail" });
      } else {
        return res.json({ status: true, message: "Email sent" });
      }
    });
  }
});

app.post("/resetpass/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  try {
    const decode = await jwt.verify(token, process.env.KEY);
    console.log("Token verified:", decode);
    const id = decode.id;
    const hash = await bcrypt.hash(password, 8);
    const user = await User.findByIdAndUpdate(id, { password: hash });
    return res.json({ status: true, message: "Updated" });
  } catch {
    return res.json({ message: "Invalid token" });
  }
});

const verifyuser = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json({ message: "No token" });
  }
  const decode = await jwt.verify(token, process.env.KEY);
  req.user = { id: decode.id, name: decode.name };
  console.log("Verified user:", req.user);
  next();
};

app.get("/profile", verifyuser, async (req, res) => {
  try {
    const userId = req.user.id;
    res.json(userId);
  } catch (err) {
    console.error(err);
  }
});

app.get("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ status: true, message: "Logged out" });
});

app.get("/initial", verifyuser, (req, res) => {
  console.log("req.user:", req.user);
  try {
    const userN = req.user.name[0];
    const initial = userN;
    res.json({ initial });
  } catch (err) {
    console.error("Error:", err);
    res.json({ message: "Error" });
  }
});

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer + Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "recipes",
    allowed_formats: ["jpg", "png", "jpeg", ".webp"],
  },
});

const upload = multer({ storage });

// Upload Recipe Route (Fixed)
app.post(
  "/uploadrecipes",
  verifyuser,
  (req, res, next) => {
    upload.single("image")(req, res, function (err) {
      if (err) {
        console.error("Multer error:", err);
        return res
          .status(400)
          .json({ message: "Image upload failed", error: err.message });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });

      const { title, description, ingredients, steps, tags } = req.body;

      if (!title || !description || !ingredients || !steps) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const imageUrl = req.file?.path || "";

      const newRecipe = new Recipe({
        author: req.user.id,
        title,
        description,
        ingredients: ingredients.split(",").map((i) => i.trim()),
        steps: steps.split(",").map((s) => s.trim()),
        tags: tags ? tags.split(",").map((t) => t.trim()) : [],
        imageUrl,
      });

      await newRecipe.save();

      console.log("Recipe saved successfully:", newRecipe);
      return res.status(201).json({ status: true, recipe: newRecipe });
    } catch (err) {
      console.error("Error in /uploadrecipes:", err);
      return res.status(500).json({
        message: err.message || "Server error",
        stack: err.stack,
      });
    }
  }
);

app.get("/myrecipes", verifyuser, async (req, res) => {
  try {
    const userId = req.user.id; // coming from verifyuser middleware

    const recipes = await Recipe.find({ author: userId })
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(recipes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

//edit recipe
app.put(
  "/editrecipe/:id",
  verifyuser,
  upload.single("image"),
  async (req, res) => {
    try {
      const recipeId = req.params.id;
      const userId = req.user.id;

      // 1️⃣ Check if recipe exists
      const recipe = await Recipe.findById(recipeId);
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }

      // 2️⃣ Check if user is authorized
      if (recipe.author.toString() !== userId.toString()) {
        return res
          .status(403)
          .json({ message: "Not authorized to edit this recipe" });
      }

      const { title, description, ingredients, steps, tags } = req.body;

      // 3️⃣ Update fields if provided
      if (title) recipe.title = title;
      if (description) recipe.description = description;
      if (ingredients) recipe.ingredients = ingredients.split(",").map(i => i.trim());
      if (steps) recipe.steps = steps.split(",").map(s => s.trim());
      if (tags) recipe.tags = tags.split(",").map(t => t.trim());

      // 4️⃣ Update image if provided
      if (req.file) {
        recipe.imageUrl = req.file.path;
      }

      // 5️⃣ Save changes
      await recipe.save();

      res.json({
        status: true,
        message: "Recipe updated successfully",
        recipe,
      });
    } catch (err) {
      // 6️⃣ Detailed error handling
      console.error("Error in /editrecipe/:id:", err);

      let errorMessage = "Server error";

      if (err instanceof multer.MulterError) {
        errorMessage = `Multer Error: ${err.message}`;
      } else if (err.name === "MongoError") {
        errorMessage = `Database Error: ${err.message}`;
      } else if (err.message) {
        errorMessage = err.message;
      }

      res.status(500).json({ message: errorMessage, stack: err.stack });
    }
  }
);

//delete recipe
app.delete("/deleterecipe/:id", verifyuser, async (req, res) => {
  try {
    const recipeId = req.params.id;
    const userId = req.user.id;

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    if (recipe.author.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this recipe" });
    }

    await Recipe.findByIdAndDelete(recipeId);

    res.json({ status: true, message: "Recipe deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// View full recipe details
app.get("/viewrecipe/:id", verifyuser, async (req, res) => {
  try {
    const recipeId = req.params.id;
    const userid = req.user.id;

    const recipe = await Recipe.findById(recipeId).populate(
      "author",
      "name email"
    ); // optional → show who posted
    // .populate("comments.user", "name"); // optional → show commenter names

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.json({
      id: recipe._id,
      title: recipe.title,
      description: recipe.description,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      tags: recipe.tags,
      imageUrl: recipe.imageUrl,
      author: recipe.author,
      likesCount: recipe.likes.length,
      likedByUser: recipe.likes
        .map((u) => u.toString())
        .includes(userid.toString()),
      // comments: recipe.comments.map(c => ({
      //   user: c.user?.name || "Anonymous",
      //   text: c.text,
      //   createdAt: c.createdAt,
      // })),
      createdAt: recipe.createdAt,
    });
  } catch (err) {
    console.error("Error fetching recipe:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/allrecipes", verifyuser, async (req, res) => {
  try {
    const recipes = await Recipe.find()
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    const userid = req.user.id;

    const formatted = recipes.map((r) => ({
      id: r._id,
      author: r.author?.name || "Unknown",
      title: r.title,
      description: r.description.substring(0, 100) + "...",
      imageUrl: r.imageUrl,
      tags: r.tags,
      likesCount: r.likes?.length || 0,
      likedByUser: r.likes.map((u) => u.toString()).includes(userid.toString()),
      // commentsCount: r.comments?.length || 0,
      createdAt: r.createdAt,
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/likerecipe/:id", verifyuser, async (req, res) => {
  try {
    const recipeid = req.params.id;
    const userid = req.user.id;

    let liked;
    const recipe = await Recipe.findById(recipeid);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    if (recipe.likes.includes(userid)) {
      // Already liked
      recipe.likes = recipe.likes.filter(
        (id) => id.toString() != userid.toString()
      );
      liked = false;
    } else {
      recipe.likes.push(userid);
      liked = true;
    }

    await recipe.save();

    res.json({
      message: liked ? "Liked" : "Unliked",
      likedByUser: liked,
      likesCount: recipe.likes.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// app.post("/comment/:id",verifyuser,async(req,res)=>{
//   try{
//   const {text} = req.body;
//   const recipeId = req.params.id;
//   const recipe = await Recipe.findById(recipeId);

//   recipe.comments.push({
//     user: req.user._id,
//     text
//   })
//   await recipe.populate("comments.user" , "name");
//   await recipe.save();

//   res.json({ comments: recipe.comments });
// }
// catch(err){
//   res.status(500).json({ message: "Server error" });
// }
// })

app.post("/search", verifyuser, async (req, res) => {
  try {
    const { ingredients, tags } = req.body;
    let filter = {};
    if (ingredients && ingredients.length > 0) {
      const ingred = ingredients.split(",").map((i) => i.trim());
      filter.ingredients = { $in: ingred.map((i) => new RegExp(i, "i")) };
    }

    if (tags && tags.length > 0) {
      const tag = tags.split(",").map((t) => t.trim().toLowerCase());
      filter.tags = { $in: tag };
    }

    const recipes = await Recipe.find(filter)
      .populate("author", "name")
      .sort({ createdAt: -1 });
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname, "../client/build")));
//   app.get("*", (req, res) =>
//     res.sendFile(path.resolve(__dirname, "../client/build", "index.html"))
//   );
// }

app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running at ${process.env.PORT}`);
});
