using Domain.DTOs.TaskListShares;
using Domain.Repositories;

namespace Api.TaskListShares.Get
{
    public class TaskListSharesGetController
    {
        public static async Task<IResult> Handle(string taskListId, TaskListSharesGetValidator validator, HttpContext httpContext, ITaskListShareRepository contextRepository)
        {
            var dto = new TaskListSharesGetRequestDto
            {
                TaskListId = taskListId,
                UserId = httpContext.GetUser()
            };
            var validationResult = await validator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                return Results.BadRequest(validationResult.Errors.FirstOrDefault()?.ErrorMessage);
            }

            var result = await contextRepository.GetAsync(dto);
            if (result.TryGetData(out var taskListShares))
            {
                return Results.Ok(taskListShares);
            }
            return Results.BadRequest(result.ErrorMsg);
        }
    }
}
