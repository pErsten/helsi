using Domain.DTOs.TaskList;
using FluentValidation;
using MongoDB.Bson;

namespace Api.TaskList.Get
{
    public class TaskListGetValidator : AbstractValidator<TaskListGetRequestDto>
    {
        private static readonly string TaskListIdIsRequired = "TaskList id is required";
        private static readonly string TaskListUserIdMustBeSet = "TaskList user id must be set";
        private static readonly string TaskListIdMustBeInCorrectFormat = "TaskList id must be in correct format";
        public TaskListGetValidator()
        {
            RuleFor(x => x.TaskListId)
                .NotEmpty().WithMessage(TaskListIdIsRequired)
                .Must(x => ObjectId.TryParse(x, out _)).WithMessage(TaskListIdMustBeInCorrectFormat);
            RuleFor(x => x.UserId)
                .NotEmpty().WithMessage(TaskListUserIdMustBeSet);
        }
    }
}
