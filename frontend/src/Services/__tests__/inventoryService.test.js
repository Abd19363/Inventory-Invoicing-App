import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getItems,
  getItemById,
  addItems,
  uploadProductImage,
  uploadProductImages,
  updateItem,
  deleteItem,
} from '../inventoryService';

describe('inventoryService Unit & Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('getItems fetches and maps product backend schema to frontend model', async () => {
    const rawProducts = [
      {
        id: 1,
        name: 'Laptop',
        description: 'Gaming Laptop',
        category: 'Electronics',
        quantity: 5,
        purchase_price: 1000,
        retail_price: 1500,
        discount: 10,
        sale_price: 1350,
        supplier_id: 2,
        thumbnail_url: 'http://cdn.com/thumb.jpg',
        full_image_url: '/products/1/images/11',
      },
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => rawProducts,
    });

    const products = await getItems();

    expect(products.length).toBe(1);
    expect(products[0].name).toBe('Laptop');
    expect(products[0].thumbnailUrl).toBe('http://cdn.com/thumb.jpg');
    expect(products[0].fullImageUrl).toBe('http://127.0.0.1:8000/products/1/images/11');
  });

  it('getItems returns empty array on network error', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    const products = await getItems();
    expect(products).toEqual([]);
  });

  it('getItemById fetches product by ID and handles error when missing ID', async () => {
    const mockProduct = { id: 1, name: 'Item 1', quantity: 2 };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockProduct,
    });

    const item = await getItemById(1);
    expect(item.id).toBe(1);

    await expect(getItemById(null)).rejects.toThrow('Product ID is required.');
  });

  it('addItems validates numerical fields', async () => {
    await expect(addItems({ quantity: 'abc' })).rejects.toThrow('Quantity must be a valid number.');
    await expect(addItems({ quantity: 1, purchasePrice: 'abc' })).rejects.toThrow('Purchase price must be a valid number.');
    await expect(addItems({ quantity: 1, purchasePrice: 10, retailPrice: 'abc' })).rejects.toThrow('Retail price must be a valid number.');
    await expect(addItems({ quantity: 1, purchasePrice: 10, retailPrice: 20, discount: 'abc' })).rejects.toThrow('Discount must be a valid number.');
    await expect(addItems({ quantity: 1, purchasePrice: 10, retailPrice: 20, discount: 0, salePrice: 'abc' })).rejects.toThrow('Sale price must be a valid number.');
  });

  it('addItems constructs FormData and sends POST request', async () => {
    const mockCreated = {
      id: 100,
      name: 'New Product',
      quantity: 10,
      purchase_price: 50,
      retail_price: 80,
      discount: 0,
      sale_price: 80,
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockCreated,
    });

    const newItem = {
      name: 'New Product',
      category: 'Gadgets',
      description: 'Desc',
      quantity: 10,
      purchasePrice: 50,
      retailPrice: 80,
      discount: 0,
      salePrice: 80,
      supplierId: 5,
    };

    const result = await addItems(newItem);

    expect(fetch).toHaveBeenCalledWith(
      'http://127.0.0.1:8000/products',
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData),
      })
    );
    expect(result.id).toBe(100);
    expect(result.name).toBe('New Product');
  });

  it('uploadProductImage validates file type and size before sending', async () => {
    await expect(uploadProductImage(null, new File([], 'a.jpg'))).rejects.toThrow(
      'Product ID is required for image upload.'
    );

    await expect(uploadProductImage(1, null)).rejects.toThrow('Please select an image.');

    const invalidFile = new File(['dummy'], 'test.txt', { type: 'text/plain' });
    await expect(uploadProductImage(1, invalidFile)).rejects.toThrow(
      'Only JPEG, PNG and WebP images are allowed.'
    );

    const oversizedFile = new File([new ArrayBuffer(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
    await expect(uploadProductImage(1, oversizedFile)).rejects.toThrow(
      'Image size must not exceed 5 MB.'
    );
  });

  it('uploadProductImages helper returns null if file is missing', async () => {
    const res = await uploadProductImages(1, null);
    expect(res).toBeNull();
  });

  it('updateItem sends PUT request with updated data and handles validation', async () => {
    await expect(updateItem(null, {})).rejects.toThrow('Product ID is required.');

    const mockUpdated = {
      id: 5,
      name: 'Updated Name',
      quantity: 20,
      purchase_price: 100,
      retail_price: 200,
      discount: 10,
      sale_price: 180,
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockUpdated,
    });

    const result = await updateItem(5, {
      name: 'Updated Name',
      quantity: 20,
      purchasePrice: 100,
      retailPrice: 200,
      discount: 10,
      salePrice: 180,
    });

    expect(result.id).toBe(5);
    expect(result.name).toBe('Updated Name');
  });

  it('deleteItem sends DELETE request for a given product ID', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
    });

    const result = await deleteItem(10);
    expect(result).toBe(true);

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ detail: 'Cannot delete product' }),
    });

    await expect(deleteItem(10)).rejects.toThrow('Cannot delete product');
  });
});
