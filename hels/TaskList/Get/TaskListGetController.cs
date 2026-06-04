using Application.Repositories;
using Domain.DTOs.TaskList;

namespace Api.TaskList.Get
{
    public static class TaskListGetController
    {
        public static async Task<IResult> Handle(string taskListId, TaskListGetValidator validator, HttpContext httpContext, ITaskListRepository contextRepository)
        {
            var dto = new TaskListGetRequestDto
            {
                TaskListId = taskListId,
                UserId = httpContext.GetUser(),
            };
            var validationResult = await validator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                return Results.BadRequest(validationResult.Errors.FirstOrDefault()?.ErrorMessage);
            }

            var result = await contextRepository.GetAsync(dto);
            if (result.TryGetData(out var taskList))
            {
                return Results.Ok(taskList);
            }
            return Results.BadRequest(result.ErrorMsg);
        }
    }
}
