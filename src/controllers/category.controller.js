import { createCategoryService, getMainCategoriesService, 
  updateCategoryService, getSubcategoriesService, getMainWithSubcategoriesService  } from "../services/category.service.js";


// Admin only
export const createCategoryController = async (req, res) => {
  try {
    const { name, parentId } = req.body;
    const category = await createCategoryService(name, parentId);
    res.status(201).json({ message: "Category created", category });
  } catch (err) {
    res.status(err.code || 500).json({ message: err.message });
  }
};

// Public route
// export const getCategoriesController = async (req, res) => {
//   try {
//     const categories = await getCategoriesService();
//     res.status(200).json(categories);
//   } catch (err) {
//     res.status(err.code || 500).json({ message: err.message });
//   }
// };


//get main categories
export const getMainCategoriesController = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;

    const result = await getMainCategoriesService(page, perPage);

    res.status(200).json(result);
  } catch (err) {
    res.status(err.code || 500).json({ message: err.message });
  }
};

//get sub categories
export const getSubcategoriesController = async (req, res) => {
  try {
    const { parentId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;

    const result = await getSubcategoriesService(parentId, page, perPage);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.code || 500).json({ message: err.message });
  }
};


//get sub-categoires against parent category
// export const getMainWithSubcategoriesController = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const perPage = parseInt(req.query.perPage) || 10;

//     const result = await getMainWithSubcategoriesService(page, perPage);
//     res.status(200).json(result);
//   } catch (err) {
//     res.status(err.code || 500).json({ message: err.message });
//   }
// };
export const getMainWithSubcategoriesController = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await getMainWithSubcategoriesService(page, limit);

    res.status(200).json(result);
  } catch (err) {
    res.status(err.code || 500).json({ message: err.message });
  }
};




//admin can update only
export const updateCategoryController = async (req, res) => {
  try {
    const { id } = req.params; // category ID from URL
    const { name, parentId } = req.body;

    // Build updates object
    const updates = {};
    if (name) updates.name = name;
    if (parentId !== undefined) updates.parent_id = parentId; // allow null to make main category

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No fields provided to update" });
    }

    // Call service to update
    const updatedCategory = await updateCategoryService(id, updates);

    res.status(200).json({
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (err) {
    console.error("Error updating category:", err);
    res.status(err.code || 500).json({ message: err.message || "Failed to update category" });
  }
};