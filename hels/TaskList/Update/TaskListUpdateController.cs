using Application.Repositories;
using Domain.DTOs.TaskList;
using Microsoft.AspNetCore.Mvc;

namespace Api.TaskList.Update
{
    public static class TaskListUpdateController
    {
        public static async Task<IResult> Handle([FromBody]string newTasks, string taskListId, string newTaskListName, TaskListUpdateValidator validator, HttpContext httpContext, ITaskListRepository contextRepository)
        {
            var dto = new TaskListUpdateRequestDto
            {
                TaskListId = taskListId,
                UserId = httpContext.GetUser(),
                NewName = newTaskListName,
                NewTasks = newTasks
            };
            var validationResult = await validator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                return Results.BadRequest(validationResult.Errors.FirstOrDefault()?.ErrorMessage);
            }

            var result = await contextRepository.UpdateAsync(dto);
            return result.IsError ? Results.BadRequest(result.ErrorMsg) : Results.Ok();
        }
    }
}
