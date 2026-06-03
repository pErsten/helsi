using Application.DTOs;
using Domain.Entities;

namespace Application.Repositories
{
    internal interface ITaskListRepository
    {
        Task<Result<TaskList>> GetAsync(string taskId);

        Task<Result> CreateAsync(CreateTaskListDto taskList);

        Task<Result> UpdateAsync(UpdateTaskListDto taskList);

        Task<Result> DeleteAsync(string taskId);

        Task<Result<IEnumerable<TaskList>>> GetByUserAsync(
            string userId,
            int page,
            int pageSize);

        Task<Result<IEnumerable<TaskList>>> GetAllAsync(
            int page,
            int pageSize);
    }
}
