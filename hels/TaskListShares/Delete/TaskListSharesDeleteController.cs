using Domain.DTOs.TaskListShares;
using Domain.Repositories;

namespace Api.TaskListShares.Delete
{
    public class TaskListSharesDeleteController
    {
        public static async Task<IResult> Handle(string taskListId, string sharedUserId, TaskListSharesDeleteValidator validator, HttpContext httpContext, ITaskListShareRepository contextRepository)
        {
            var dto = new TaskListSharesDeleteRequestDto
            {
                TaskListId = taskListId,
                CallerUserId = httpContext.GetUser(),
                SharedUserId = sharedUserId
            };
            var validationResult = await validator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                return Results.BadRequest(validationResult.Errors.FirstOrDefault()?.ErrorMessage);
            }

            var result = await contextRepository.DeleteAsync(dto);
            return result.IsError ? Results.BadRequest(result.ErrorMsg) : Results.Ok();
        }
    }
}
