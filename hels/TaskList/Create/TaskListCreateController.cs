using Application.Repositories;
using Domain.DTOs.TaskList;
using Microsoft.AspNetCore.Mvc;

namespace Api.TaskList.Create
{
    public static class TaskListCreateController
    {
        public static async Task<IResult> Handle([FromBody]string tasks, string taskListName, TaskListCreateValidator validator, HttpContext httpContext, ITaskListRepository contextRepository)
        {
            var dto = new TaskListCreateRequestDto
            {
                Name = taskListName,
                Tasks = tasks,
                UserId = httpContext.GetUser(),
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
