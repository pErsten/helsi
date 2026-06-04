using Application.DTOs;
using Domain.DTOs;
using Domain.DTOs.TaskList;

namespace Domain.Repositories
{
    public interface ITaskListRepository
    {
        Task<Result<TaskListResponseDto>> GetAsync(TaskListGetRequestDto taskListDto);

        Task<Result> CreateAsync(TaskListCreateRequestDto taskListDto);

        Task<Result> UpdateAsync(TaskListUpdateRequestDto taskListDto);

        Task<Result> DeleteAsync(TaskListDeleteRequestDto taskListDto);

        Task<Result<IEnumerable<TaskListByUserDto>>> GetByUserAsync(TaskListGetAllByUserRequestDto dto);
    }
}
