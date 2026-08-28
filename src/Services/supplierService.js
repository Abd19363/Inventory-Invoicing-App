import { apiFetch } from "./api";

// ==========================================
// GET ALL SUPPLIERS
// ==========================================

export async function getSuppliers() {
  return apiFetch("/suppliers");
}

// ==========================================
// GET SUPPLIER BY ID
// ==========================================

export async function getSupplierById(id) {
  return apiFetch(`/suppliers/${id}`);
}

// ==========================================
// CREATE SUPPLIER
// ==========================================

export async function addSupplier(supplier) {
  const data = {
    name: supplier.name,
    email: supplier.email || null,
    phone: supplier.phone || null,
    address: supplier.address || null,
  };

  return apiFetch("/suppliers", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ==========================================
// UPDATE SUPPLIER
// ==========================================

export async function updateSupplier(id, supplier) {
  const data = {
    name: supplier.name,
    email: supplier.email || null,
    phone: supplier.phone || null,
    address: supplier.address || null,
  };

  return apiFetch(`/suppliers/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// ==========================================
// DELETE SUPPLIER
// ==========================================

export async function deleteSupplier(id) {
  await apiFetch(`/suppliers/${id}`, {
    method: "DELETE",
  });

  return true;
}