
import { useMemo } from "react";

export default function TotalPrice({ quantity, priceperquantity }) {

    const totalPrice = useMemo(() => {
        return Number(quantity || 0) * Number(priceperquantity || 0);
    }, [quantity, priceperquantity]);

    return (
        <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-700 text-center">
                Total Price
            </label>

            <div className="w-full border border-gray-300 hover:border-4 hover:border-blue-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-black transition-all duration-300 ease-in-out hover:translate-x-2 text-center">
                {totalPrice}
            </div>
        </div>
    );
}