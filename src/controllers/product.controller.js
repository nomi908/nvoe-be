// controllers/product.controller.js
import {
  createProductService,
  getAllProductsService,
  getProductService,
  updateProductService,
  deleteProductService,
  verifyProductService
} from "../services/product.service.js";
import { supabase } from "../config/supabase.js";

// CREATE PRODUCT (Safe points-first flow)
export const createProductController = async (req, res) => {
  try {
    const { name, description, price, categoryId, subcategoryId } = req.body;
    const userId = req.user?.id; // UUID
    const files = req.files || [];

    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!name || !description || !price || !categoryId)
      return res.status(400).json({ message: "All required fields must be filled" });

    // 1️⃣ Check user points
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.points < 100) {
      return res.status(400).json({ message: "Not enough points to add product" });
    }

    // 2️⃣ Upload images
    const imageUrls = [];
    for (const file of files) {
      const ext = file.originalname.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(fileName, file.buffer, { contentType: file.mimetype });

      if (uploadError) {
        return res.status(500).json({ message: "Image upload failed" });
      }

      const { data: urlData } = supabase.storage.from("products").getPublicUrl(fileName);
      imageUrls.push(urlData.publicUrl);
    }

    // 3️⃣ Create product in DB
    const productData = {
      user_id: userId,
      name,
      description,
      price,
      category_id: categoryId,
      subcategory_id: subcategoryId || null,
      transaction_id: null, // points used, no Stripe
      status: "approved",   // auto-approved
      images: imageUrls,
    };

    const product = await createProductService(productData);

    // 4️⃣ Deduct 100 points AFTER product creation
    const { error: deductError } = await supabase
      .from("users")
      .update({ points: user.points - 100 })
      .eq("id", userId);

    if (deductError) {
      console.error("Points deduction failed after product creation:", deductError);
    }

    return res.status(201).json({
      message: "Product created successfully (100 points deducted)",
      product,
    });

  } catch (err) {
    console.error(err);
    return res.status(err.code || 500).json({ message: err.message || "Internal Server Error" });
  }
};

// GET ALL PRODUCTS (WITH PAGINATION)
export const getAllProductsController = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const { products, total } = await getAllProductsService(page, limit);

    return res.status(200).json({
      products,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    return res.status(err.code || 500).json({ message: err.message });
  }
};


// GET SINGLE PRODUCT
export const getProductController = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await getProductService(id);
    return res.status(200).json(product);
  } catch (err) {
    return res.status(err.code || 500).json({ message: err.message });
  }
};

// UPDATE PRODUCT
export const updateProductController = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, categoryId, subcategoryId } = req.body;
    const files = req.files || [];

    // Prepare updates object for text fields
    const updates = {
      ...(name && { name }),
      ...(description && { description }),
      ...(price && { price }),
      ...(categoryId && { category_id: categoryId }),
      ...(subcategoryId && { subcategory_id: subcategoryId }),
    };

    // ====== THIS IS WHERE YOU UPDATE THE IMAGES ======
    if (files.length > 0) {
      const imageUrls = [];

      for (const file of files) {
        const ext = file.originalname.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("products")
          .upload(fileName, file.buffer, { contentType: file.mimetype });

        if (uploadError) return res.status(500).json({ message: "Image upload failed" });

        const { data: urlData } = supabase.storage.from("products").getPublicUrl(fileName);
        imageUrls.push(urlData.publicUrl);
      }

      // Option 1: Replace existing images
      // updates.images = imageUrls;

      // Option 2: Append new images
      const currentProduct = await getProductService(id);
      updates.images = [...(currentProduct.images || []), ...imageUrls];
    }
    // ===================================================

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No fields or images to update" });
    }

    const updated = await updateProductService(id, updates);

    return res.status(200).json({
      message: "Product updated successfully",
      product: updated,
    });
  } catch (err) {
    console.error("Supabase update error:", err);
    return res.status(err.code || 500).json({ message: err.message || "Failed to update product" });
  }
};



// DELETE PRODUCT
export const deleteProductController = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteProductService(id);
    return res.status(200).json({ message: "Product deleted" });
  } catch (err) {
    return res.status(err.code || 500).json({ message: err.message });
  }
};

// VERIFY PRODUCT (ADMIN)
export const verifyProductController = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user?.id;
    if (!adminId) return res.status(401).json({ message: "Unauthorized" });

    const result = await verifyProductService(adminId, id);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.code || 500).json({ message: err.message });
  }
};
