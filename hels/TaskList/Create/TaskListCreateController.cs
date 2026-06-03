namespace Api.TaskList.TaskListCreate
{
    public static class TaskListCreateController
    {
        public static async Task<IResult> Handle(string taskListName, TaskListCreateValidator validator, HttpContext httpContext)
        {
            var dto = new TaskListCreateRequestDto
            {
                Name = taskListName,
                OwnerId = httpContext.GetUser(),
            };
            var validationResult = await validator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                return Results.BadRequest(validationResult.Errors.FirstOrDefault()?.ErrorMessage);
            }
            return Results.Ok();
        }
    }
}
