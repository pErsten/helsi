using Application.DTOs;
using Domain.Entities;

namespace Application.Repositories
{
    public interface ITaskListRepository
    {
        Task<Result<TaskListResponseDto>> GetAsync(TaskListRequestDto taskListRequestDto);

        Task<Result> CreateAsync(TaskListRequestDto taskListRequestDto);

        Task<Result> UpdateAsync(UpdateTaskListDto taskListDto);

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
