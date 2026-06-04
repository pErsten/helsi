using Domain.DTOs;
using Domain.DTOs.TaskListShares;

namespace Domain.Repositories
{
    public interface ITaskListShareRepository
    {
        Task<Result> CreateAsync(TaskListSharesCreateRequestDto dto);
        Task<Result> DeleteAsync(TaskListSharesDeleteRequestDto dto);
        Task<Result<IEnumerable<TaskListAllSharesDto>>> GetAsync(TaskListSharesGetRequestDto dto);
    }
}
