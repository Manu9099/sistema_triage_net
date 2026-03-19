using Microsoft.EntityFrameworkCore;
using sistema_triage.Domain.Models;

namespace sistema_triage.Infrastructure.Extensions;

public static class QueryableExtensions
{
    public static async Task<PaginatedResult<T>> ToPaginatedAsync<T>(
        this IQueryable<T> query, int page, int pageSize)
    {
        var total = await query.CountAsync();
        var data = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PaginatedResult<T>
        {
            Data = data,
            TotalItems = total,
            Page = page,
            PageSize = pageSize
        };
    }
}