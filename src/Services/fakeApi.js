// Simulate network delay
const delay = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

export async function fakeApi(callback) {

    await delay(1000);

  // Simulate random network error 
  if (Math.random() < 0.01) {
    throw new Error("Network Error! Please try again.");
  }

  // Execute the operation (CRUD)
  return callback();
}