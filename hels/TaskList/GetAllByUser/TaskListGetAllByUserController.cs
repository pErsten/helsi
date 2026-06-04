using Domain.DTOs.TaskList;
using Domain.Repositories;

namespace Api.TaskList.GetAllByUser
{
    public class TaskListGetAllByUserController
    {
        public static async Task<IResult> Handle(int page, int pageSize, TaskListGetAllByUserValidator validator, HttpContext httpContext, ITaskListRepository contextRepository)
        {
            var dto = new TaskListGetAllByUserRequestDto
            {
                UserId = httpContext.GetUser(),
                Page = page,
                PageSize = pageSize
            };
            var validationResult = await validator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                return Results.BadRequest(validationResult.Errors.FirstOrDefault()?.ErrorMessage);
            }

            var result = await contextRepository.GetByUserAsync(dto);
            if (result.TryGetData(out var taskLists))
            {
                return Results.Ok(taskLists);
            }
            return Results.BadRequest(result.ErrorMsg);
        }
    }
}
