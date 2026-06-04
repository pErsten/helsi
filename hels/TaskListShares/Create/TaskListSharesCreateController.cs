using Domain.DTOs.TaskListShares;
using Domain.Repositories;

namespace Api.TaskListShares.Create
{
    public class TaskListSharesCreateController
    {
        public static async Task<IResult> Handle(string taskListId, string sharedUserId, TaskListSharesCreateValidator validator, HttpContext httpContext, ITaskListShareRepository contextRepository)
        {
            var dto = new TaskListSharesCreateRequestDto
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

            var result = await contextRepository.CreateAsync(dto);
            return result.IsError ? Results.BadRequest(result.ErrorMsg) : Results.Ok();
        }
    }
}
