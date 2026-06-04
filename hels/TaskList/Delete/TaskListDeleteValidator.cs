using Domain.DTOs.TaskList;
using FluentValidation;
using MongoDB.Bson;

namespace Api.TaskList.Delete
{
    public class TaskListDeleteValidator : AbstractValidator<TaskListDeleteRequestDto>
    {
        private static readonly string TaskListIdIsRequired = "TaskList id is required";
        private static readonly string TaskListOwnerIdMustBeSet = "TaskList owner id must be set";
        private static readonly string TaskListIdMustBeInCorrectFormat = "TaskList id must be in correct format";
        public TaskListDeleteValidator()
        {
            RuleFor(x => x.TaskListId)
                .NotEmpty().WithMessage(TaskListIdIsRequired)
                .Must(x => ObjectId.TryParse(x, out _)).WithMessage(TaskListIdMustBeInCorrectFormat);
            RuleFor(x => x.OwnerId)
                .NotEmpty().WithMessage(TaskListOwnerIdMustBeSet);
        }
    }
}
