"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import TotalPrice from "@/app/components/TotalPrice"

const validationSchema = Yup.object({
  name: Yup.string().required("Product name is required"),
  category: Yup.string().required("Category is required"),
  quantity: Yup.number()
    .required("Quantity is required")
    .positive("Quantity must be positive")
    .integer("Quantity must be an integer"),
  priceperquantity: Yup.number()
    .required("Price must be Positive"),

});



export default function InventoryForm({
  initialValues,
  onSubmit,

}) {
  
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ values }) => {
        return (
          <Form className="max-w-lg mx-auto mt-10 bg-teal-100 shadow-lg rounded-lg p-8">

            <h2 className="text-3xl font-bold text-center text-blue-700 mb-8">
              Product Details
            </h2>

            {/* Product Name */}
            <div className="mb-5">
              <label className="block mb-2 font-semibold text-gray-700 text-center">
                Product Name
              </label>

              <Field
                type="text"
                name="name"
                placeholder="Enter product name"
                className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-black transition-all duration-300 ease-in-out hover:translate-x-2 hover:border-4 hover:border-blue-300  text-center"
              />

              <ErrorMessage
                name="name"
                component="div"
                className="text-red-600 text-sm mt-1"
              />
            </div>

            {/* Category */}
            <div className="mb-5">
              <label className="block mb-2 font-semibold text-gray-700 text-center">
                Category
              </label>

              <Field
                type="text"
                name="category"
                placeholder="Enter category"
                className="w-full border border-gray-300 hover:border-4 hover:border-blue-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-black transition-all duration-300 ease-in-out hover:translate-x-2 text-center"

              />

              <ErrorMessage
                name="category"
                component="div"
                className="text-red-600 text-sm mt-1"
              />
            </div>

            {/* Quantity */}
            <div className="mb-5">
              <label className="block mb-2 font-semibold text-gray-700 text-center">
                Quantity
              </label>

              <Field
                type="number"
                name="quantity"
                placeholder="Enter quantity"
                className="w-full border border-gray-300 hover:border-4 hover:border-blue-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-black transition-all duration-300 ease-in-out hover:translate-x-2 text-center"
              />

              <ErrorMessage
                name="quantity"
                component="div"
                className="text-red-600 text-sm mt-1"
              />
            </div>

            {/* Price Per Quantity */}
            <div className="mb-5">
              <label className="block mb-2 font-semibold text-gray-700 text-center">
                Price Per Quantity
              </label>

              <Field
                type="number"
                name="priceperquantity"
                placeholder="Enter price per quantity"
                className="w-full border border-gray-300 hover:border-4 hover:border-blue-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-black transition-all duration-300 ease-in-out hover:translate-x-2 text-center"
              />

              <ErrorMessage
                name="priceperquantity"
                component="div"
                className="text-red-600 text-sm mt-1"
              />
            </div>

            <TotalPrice
              quantity={values.quantity}
              priceperquantity={values.priceperquantity}
            />

            <button
              type="submit"
              className="w-full bg-blue-400 text-white py-3 rounded-md font-semibold hover:bg-blue-800 transition duration-300"
            >
              Add Product
            </button>

          </Form>

        );







      }}



    </Formik>
  );
}