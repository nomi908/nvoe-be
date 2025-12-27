import { supabase } from "../config/supabase.js";


// Create category or subcategory
export const createCategoryService = async (name, parentId = null) => {
  if (!name) throw { code: 400, message: "Category name is required" };

  const { data, error } = await supabase
    .from("categories")
    .insert([{ name, parent_id: parentId }])
    .select()
    .single();

  if (error) throw { code: 500, message: "Failed to create category" };
  return data;
};


// // Get all categories with subcategories nested
// export const getCategoriesService = async () => {
//   const { data: categories, error } = await supabase
//     .from("categories")
//     .select("*");

//   if (error) throw { code: 500, message: "Failed to fetch categories" };

//   // Group subcategories under their parent categories
//   const mainCategories = categories
//     .filter(cat => cat.parent_id === null) // main categories
//     .map(parent => {
//       return {
//         id: parent.id,
//         name: parent.name,
//         created_at: parent.created_at,
//         subcategories: categories
//           .filter(sub => sub.parent_id === parent.id)
//           .map(sub => ({
//             id: sub.id,
//             name: sub.name,
//             created_at: sub.created_at
//           }))
//       };
//     });

//   return mainCategories;
// };


//get categories main
export const getMainCategoriesService = async (page = 1, perPage = 10) => {
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data, error, count } = await supabase
    .from("categories")
    .select("*", { count: "exact" })
    .is("parent_id", null)
    .order("name", { ascending: true })
    .range(from, to);

  if (error) throw { code: 500, message: "Failed to fetch main categories" };

  return { data, total: count, page, perPage };
};


// Fetch subcategories for a given parent
export const getSubcategoriesService = async (parentId, page = 1, perPage = 10) => {
  if (!parentId) throw { code: 400, message: "Parent ID is required" };

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data, error, count } = await supabase
    .from("categories")
    .select("*", { count: "exact" })
    .eq("parent_id", parentId)
    .order("name", { ascending: true })
    .range(from, to);

  if (error) throw { code: 500, message: "Failed to fetch subcategories" };

  return { data, total: count, page, perPage };
};


//fetching subcategories against the one category
// Fetch all main categories with their subcategories
// export const getMainWithSubcategoriesService = async (page = 1, perPage = 10) => {
//   const from = (page - 1) * perPage;
//   const to = from + perPage - 1;

//   // Fetch all categories (with count for pagination)
//   const { data: categories, error, count } = await supabase
//     .from("categories")
//     .select("*", { count: "exact" })
//     .order("name", { ascending: true })
//     .range(from, to);

//   if (error) throw { code: 500, message: "Failed to fetch categories" };

//   // Group subcategories under their main categories
//   const mainCategories = categories
//     .filter(cat => cat.parent_id === null) // main categories
//     .map(parent => {
//       return {
//         id: parent.id,
//         name: parent.name,
//         created_at: parent.created_at,
//         subcategories: categories
//           .filter(sub => sub.parent_id === parent.id)
//           .map(sub => ({
//             id: sub.id,
//             name: sub.name,
//             created_at: sub.created_at
//           }))
//       };
//     });

//   return { data: mainCategories, total: count, page, perPage };
// };
export const getMainWithSubcategoriesService = async (page = 1, limit = 10) => {

  // Fetch ALL categories
  const { data: categories, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw { code: 500, message: "Failed to fetch categories" };

  // Extract all main categories
  const mainCategories = categories.filter(cat => cat.parent_id === null);

  // Pagination
  const total = mainCategories.length;
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedMain = mainCategories.slice(start, end);

  // Attach matching subcategories
  const result = paginatedMain.map(main => ({
    id: main.id,
    name: main.name,
    created_at: main.created_at,
    subcategories: categories.filter(sub => sub.parent_id === main.id)
  }));

  return {
    categories: result,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  };
};




//update categroy
export const updateCategoryService = async (id, updates) => {
  if (!id) throw { code: 400, message: "Category ID is required" };
  if (!updates || Object.keys(updates).length === 0) 
    throw { code: 400, message: "No fields provided to update" };

  const { data, error } = await supabase
    .from("categories")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw { code: 500, message: "Failed to update category" };
  return data;
};