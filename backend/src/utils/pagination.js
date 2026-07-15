export const parsePagination = (
  query,
  { defaultPage = 1, defaultLimit = 10, maxLimit = 100 } = {}
) => {
  const pageNumber = Math.max(parseInt(query.page, 10) || defaultPage, 1)
  const limitNumber = Math.min(
    Math.max(parseInt(query.limit, 10) || defaultLimit, 1),
    maxLimit
  )

  return { pageNumber, limitNumber }
}

export const buildPaginationMeta = (pageNumber, limitNumber, total) => {
  const totalPages = Math.max(Math.ceil(total / limitNumber), 1)

  return {
    page: pageNumber,
    limit: limitNumber,
    total,
    totalPages,
    hasNextPage: pageNumber < totalPages,
    hasPrevPage: pageNumber > 1
  }
}
