import express from "express";
import dotenv from "dotenv";
import connectDB from "../config/connectedDB.js";
import morgan from "morgan";
import produtmodel from '../models/productmodel.js';
import formidable from "formidable";
import fs from 'fs';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("Protected route ha na a meri jan");
});

app.post("/createProduct", (req, res) => {
  const form = formidable({
    multiples: false,
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024,        // 5MB limit
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Formidable error:", err);
      return res.status(400).send({ error: "Form parsing error" });
    }

    console.log("⚙️  PARSED FIELDS:", fields);
    console.log("⚙️  PARSED FILES:", files);

    try {
      // unwrap arrays
      const name        = Array.isArray(fields.name)        ? fields.name[0]        : fields.name;
      const description = Array.isArray(fields.description) ? fields.description[0] : fields.description;
      const price       = Array.isArray(fields.price)       ? fields.price[0]       : fields.price;
      const cutprice    = Array.isArray(fields.cutprice)    ? fields.cutprice[0]    : fields.cutprice;
      const link        = Array.isArray(fields.link)        ? fields.link[0]        : fields.link;
      const persent        = Array.isArray(fields.persent)        ? fields.persent[0]        : fields.persent;
      
      const upload      = files.photo;

      // basic validation
      if (!name)        return res.status(400).send({ error: "Name is required" });
      if (!description) return res.status(400).send({ error: "Description is required" });
      if (!price)       return res.status(400).send({ error: "Price is required" });
      if (!link)       return res.status(400).send({ error: "link is required" });
      if (!persent)       return res.status(400).send({ error: " persent is required" });
   
      // make your document
      const product = new produtmodel({ name, description, price, cutprice,link,persent });

      let photoBuffer, contentType;
      if (upload) {
        // fallback to either property
        const photoPath = upload.filepath || upload.path;
        contentType     = upload.mimetype || upload.type;

        if (!photoPath) {
          console.warn("⚠️ Upload came through without a .filepath or .path!");
        } else {
          photoBuffer = fs.readFileSync(photoPath);
          product.photo.data        = photoBuffer;
          product.photo.contentType = contentType;
        }
      }

      const saved = await product.save();

      // build response, always include photo if we got one
      const responseData = {
        _id: saved._id,
        name: saved.name,
        description: saved.description,
        price: saved.price,
        cutprice: saved.cutprice,
        createdAt: saved.createdAt,
        updatedAt: saved.updatedAt,
        link:saved.link,
        persent:saved.persent
      };
      if (photoBuffer) {
        responseData.photo = {
          data: Array.from(photoBuffer),
          contentType,
        };
      }

      return res.status(201).send({
        success: true,
        message: "Product created successfully",
        data: responseData,
      });
    } catch (error) {
      console.error("Error saving product:", error);
      return res.status(500).send({
        success: false,
        message: "Error in creating product",
        error,
      });
    }
  });
});

app.delete("/delete-product/:id", async (req, res) => {
  const productId = req.params.id;

  try {
    const deletedProduct = await produtmodel.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, message: "Product deleted successfully", data: deletedProduct });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
  
});



app.listen(3000, () => {
  console.log("server is started");
});

export default app;
