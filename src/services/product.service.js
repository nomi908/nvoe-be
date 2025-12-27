// services/product.service.js
import { supabase } from "../config/supabase.js";

// ----------------------
// CREATE PRODUCT SERVICE
// ----------------------
export const createProductService = async (productData) => {
  const { name, description, price, user_id, category_id, subcategory_id, status, points_awarded, images } = productData;

  if (!name || !description || !price || !user_id || !category_id) {
    throw { code: 400, message: "All required fields are required" };
  }

  // Insert product
  const { data: product, error: productError } = await supabase
    .from("products")
    .insert({
      user_id,
      name,
      description,
      price,
      category_id,
      subcategory_id: subcategory_id || null,
      status,
      points_awarded,
      images,
    })
    .select()
    .single();

  if (productError) {
    console.error("Product insert error:", productError);
    throw { code: 500, message: "Failed to create product" };
  }

  // Insert images if any
  if (images && images.length > 0) {
    for (const url of images) {
      const { error: imgError } = await supabase
        .from("product_images_list")
        .insert({
          product_id: product.id,
          image_url: url,
        });
      if (imgError) console.error("Failed to insert image URL:", imgError);
    }
  }

  return { message: "Product created successfully", product };
};

// ----------------------
// GET ALL PRODUCTS SERVICE
// ----------------------
export const getAllProductsService = async (page = 1, limit = 10) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // 1) Fetch paginated rows
  const { data, error, count } = await supabase
    .from("products")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw { code: 500, message: "Failed to fetch products" };

  return {
    products: data,
    total: count,
  };
};


// ----------------------
// GET SINGLE PRODUCT SERVICE
// ----------------------
export const getProductService = async (id) => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) throw { code: 404, message: "Product not found" };
  return data;
};

// ----------------------
// UPDATE PRODUCT SERVICE
// ----------------------
export const updateProductService = async (id, updates) => {
  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Supabase update error:", error);
    throw { code: 500, message: "Failed to update product" };}
  return data;
};

// ----------------------
// DELETE PRODUCT SERVICE
// ----------------------
export const deleteProductService = async (id) => {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) throw { code: 500, message: "Failed to delete product" };
  return;
};

// ----------------------
// VERIFY PRODUCT SERVICE (ADMIN)
// ----------------------
export const verifyProductService = async (adminId, productId) => {
  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .single();

  if (error || !product) throw { code: 404, message: "Product not found" };
  if (product.status === "approved") throw { code: 400, message: "Product already approved" };

  // Approve product
  const { error: updateError } = await supabase
    .from("products")
    .update({ status: "approved" })
    .eq("id", productId);

  if (updateError) throw { code: 500, message: "Failed to approve product" };

  // Award points if not already awarded
  if (!product.points_awarded) {
    const { error: pointsError } = await supabase
      .from("users")
      .update({ points: supabase.raw("points + 100") })
      .eq("id", product.user_id);

    if (pointsError) throw { code: 500, message: "Failed to award points" };

    await supabase
      .from("products")
      .update({ points_awarded: true })
      .eq("id", productId);
  }

  return { message: "Product approved and points awarded if applicable" };
};
