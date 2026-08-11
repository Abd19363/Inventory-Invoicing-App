"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getInvoiceById } from "@/Services/invoicesService";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";

export default function InvoiceDetails() {

    useAuth();
    const router = useRouter();

    const params = useParams();

    const {
        data: invoice,
        isLoading,
        isError
    } = useQuery({
        queryKey: ["invoice", params.id],
        queryFn: () => getInvoiceById(params.id)
    });

    if (isLoading) {
        return (
            <div className="p-8 text-center">
                Loading invoice...
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-8 text-center text-red-500">
                Failed to load invoice.
            </div>
        );
    }

    if (!invoice) {
        return (
            <div className="p-8 text-center">
                Invoice not found.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 p-8">

            <div className="max-w-4xl mx-auto bg-slate-800 rounded-xl p-8 text-white">

                <h1 className="text-3xl font-bold mb-6">
                    Invoice Details
                </h1>

                <div className="grid grid-cols-2 gap-4 mb-8">

                    <div>
                        <p className="text-gray-400">
                            Invoice ID
                        </p>

                        <p className="font-semibold">
                            {invoice.id}
                        </p>
                    </div>

                    <div>
                        <p className="text-gray-400">
                            Customer Name
                        </p>

                        <p className="font-semibold">
                            {invoice.customerName}
                        </p>
                    </div>

                    <div>
                        <p className="text-gray-400">
                            Date
                        </p>

                        <p className="font-semibold">
                            {invoice.date}
                        </p>
                    </div>

                    <div>
                        <p className="text-gray-400">
                            Grand Total
                        </p>

                        <p className="font-semibold">
                            Rs. {Number(invoice.total || 0).toLocaleString()}
                        </p>
                    </div>

                </div>

                <h2 className="text-xl font-bold mb-4">
                    Products
                </h2>

                <table className="w-full border-collapse">

                    <thead>
                        <tr className="border-b border-slate-600">
                            <th className="text-left p-3">
                                Product
                            </th>

                            <th className="text-left p-3">
                                Quantity
                            </th>

                            <th className="text-left p-3">
                                Price
                            </th>

                            <th className="text-left p-3">
                                Total
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {invoice.items.map((item) => (

                            <tr
                                key={item.id}
                                className="border-b border-slate-700"
                            >

                                <td className="p-3">
                                    {item.name}
                                </td>

                                <td className="p-3">
                                    {item.invoiceQuantity}
                                </td>

                                <td className="p-3">
                                    Rs. {Number(item.salePrice || 0).toLocaleString()}
                                </td>

                                <td className="p-3">
                                    {(
                                        Number(item.invoiceQuantity || 0) *
                                        Number(item.salePrice || 0)
                                    ).toLocaleString()}
                                </td>

                            </tr>

                        ))}
                    </tbody>

                </table>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6 text-center">

                    <button
                        type="button"
                        onClick={() => router.push("/Invoices")}
                        className="bg-gray-600 hover:bg-gray-100 hover:text-black text-white rounded px-4 py-2"
                    >
                        Go to Invoice
                    </button>

                    <span className="text-xl font-bold">
                        Grand Total: Rs.{" "}
                        {Number(invoice.total || 0).toLocaleString()}
                    </span>

                </div>

            </div>

        </div>
    );
}