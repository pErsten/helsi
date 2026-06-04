using Application.Repositories;
using Domain.DTOs.TaskList;

namespace Api.TaskList.Delete
{
    public class TaskListDeleteController
    {
        public static async Task<IResult> Handle(string taskListId, TaskListDeleteValidator validator, HttpContext httpContext, ITaskListRepository contextRepository)
        {
            var dto = new TaskListDeleteRequestDto
            {
                TaskListId = taskListId,
                OwnerId = httpContext.GetUser(),
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
