export function greet(name) {
  return `Hello, ${name}!`;
}

// Async/await example
export async function fetchData(url) {
  const response = await fetch(url);
  return response.json();
}