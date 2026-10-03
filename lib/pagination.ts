export function calculateOffset(
  page: number,
  limit: number
) {
  return (page - 1) * limit;
}