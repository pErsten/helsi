using Domain.Entities;

namespace Application.Repositories
{
    internal interface ITaskListShareRepository
    {
        Task<Result> CreateAsync(string userId, string taskId);
        Task<Result> DeleteAsync(string userId, string taskId);
        Task<Result<IEnumerable<TaskListShare>>> GetAsync(string taskId);
    }
}
