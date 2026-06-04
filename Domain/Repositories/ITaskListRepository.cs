using Application.DTOs;
using Domain.DTOs.TaskList;
using Domain.Entities;

namespace Application.Repositories
{
    public interface ITaskListRepository
    {
        Task<Result<TaskListResponseDto>> GetAsync(TaskListGetRequestDto taskListDto);

        Task<Result> CreateAsync(TaskListCreateRequestDto taskListDto);

        Task<Result> UpdateAsync(TaskListUpdateRequestDto taskListDto);

        Task<Result> DeleteAsync(TaskListDeleteRequestDto taskListDto);

        Task<Result<IEnumerable<TaskList>>> GetByUserAsync(
            string userId,
            int page,
            int pageSize);

        Task<Result<IEnumerable<TaskList>>> GetAllAsync(
            int page,
            int pageSize);
    }
}
