import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getInvoices,
  getInvoiceById,
  saveInvoice,
  updateInvoice,
  markInvoiceAsPaid,
  getInvoicePdfUrl,
  viewInvoicePdf,
  deleteInvoice,
} from '../invoicesService';

describe('invoicesService Unit & Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('getInvoices fetches and normalizes backend invoice array', async () => {
    const rawInvoices = [
      {
        id: 1,
        customer_name: 'Jane Doe',
        customer_email: 'jane@example.com',
        total_amount: 360,
        status: 'unpaid',
        created_at: '2026-08-30T10:00:00Z',
        items: [
          {
            id: 1,
            product_id: 10,
            product_name: 'Monitor',
            quantity: 2,
            unit_price: 180,
            subtotal: 360,
          },
        ],
      },
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => rawInvoices,
    });

    const invoices = await getInvoices();

    expect(invoices.length).toBe(1);
    expect(invoices[0].customerName).toBe('Jane Doe');
    expect(invoices[0].total).toBe(360);
    expect(invoices[0].items.length).toBe(1);
    expect(invoices[0].items[0].name).toBe('Monitor');
    expect(invoices[0].items[0].subtotal).toBe(360);
  });

  it('getInvoices returns empty array on network failure', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Fetch failed'));
    const invoices = await getInvoices();
    expect(invoices).toEqual([]);
  });

  it('getInvoiceById fetches single normalized invoice', async () => {
    const rawInvoice = {
      id: 2,
      customer_name: 'Alice',
      total_amount: 150,
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => rawInvoice,
    });

    const inv = await getInvoiceById(2);
    expect(inv.id).toBe(2);
    expect(inv.customerName).toBe('Alice');
  });

  it('saveInvoice constructs payload and saves new invoice', async () => {
    const mockCreated = {
      id: 5,
      customer_name: 'John Smith',
      customer_email: 'john@example.com',
      total_amount: 200,
      status: 'unpaid',
      created_at: '2026-08-30T12:00:00Z',
      items: [
        {
          id: 1,
          product_id: 2,
          quantity: 1,
          unit_price: 200,
          subtotal: 200,
        },
      ],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockCreated,
    });

    const newInvoice = {
      customerName: 'John Smith',
      customerEmail: 'john@example.com',
      status: 'unpaid',
      items: [
        {
          productId: 2,
          invoiceQuantity: 1,
        },
      ],
    };

    const saved = await saveInvoice(newInvoice);

    expect(fetch).toHaveBeenCalledWith(
      'http://127.0.0.1:8000/invoices',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          customer_name: 'John Smith',
          customer_email: 'john@example.com',
          status: 'unpaid',
          items: [{ product_id: 2, quantity: 1 }],
        }),
      })
    );

    expect(saved.id).toBe(5);
    expect(saved.customerName).toBe('John Smith');
  });

  it('updateInvoice updates invoice data', async () => {
    const mockUpdated = {
      id: 5,
      customer_name: 'John Updated',
      status: 'paid',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockUpdated,
    });

    const res = await updateInvoice(5, { customerName: 'John Updated', status: 'paid' });

    expect(res.customerName).toBe('John Updated');
    expect(res.status).toBe('paid');
  });

  it('markInvoiceAsPaid sends status update', async () => {
    const mockPaid = {
      id: 5,
      customer_name: 'John Smith',
      status: 'paid',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockPaid,
    });

    const result = await markInvoiceAsPaid(5);

    expect(result.status).toBe('paid');
  });

  it('deleteInvoice handles failure status gracefully', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ detail: 'Invoice not found' }),
    });

    await expect(deleteInvoice(999)).rejects.toThrow('Invoice not found');
  });

  it('deleteInvoice sends DELETE request to server', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
    });

    const success = await deleteInvoice(5);

    expect(fetch).toHaveBeenCalledWith(
      'http://127.0.0.1:8000/invoices/5',
      expect.objectContaining({
        method: 'DELETE',
      })
    );
    expect(success).toBe(true);
  });

  it('getInvoicePdfUrl and viewInvoicePdf work correctly', () => {
    const pdfUrl = getInvoicePdfUrl(5);
    expect(pdfUrl).toBe('http://127.0.0.1:8000/invoices/5/pdf');

    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    viewInvoicePdf(5);
    expect(openSpy).toHaveBeenCalledWith('http://127.0.0.1:8000/invoices/5/pdf', '_blank');
  });
});
