using Domain.DTOs.TaskList;
using FluentValidation;
using MongoDB.Bson;

namespace Api.TaskList.Update
{
    public class TaskListUpdateValidator : AbstractValidator<TaskListUpdateRequestDto>
    {
        private static readonly string TaskListIdIsRequired = "TaskList id is required";
        private static readonly string TaskListNameIsRequired = "TaskList name is required";
        private static readonly string TaskListBodyIsRequired = "TaskList body is required";
        private static readonly string TaskListOwnerIdMustBeSet = "TaskList owner id must be set";
        private static readonly string TaskListIdMustBeInCorrectFormat = "TaskList id must be in correct format";
        public TaskListUpdateValidator()
        {
            RuleFor(x => x.TaskListId)
                .NotEmpty().WithMessage(TaskListIdIsRequired)
                .Must(x => ObjectId.TryParse(x, out _)).WithMessage(TaskListIdMustBeInCorrectFormat);
            RuleFor(x => x.OwnerId)
                .NotEmpty().WithMessage(TaskListOwnerIdMustBeSet);
            RuleFor(x => x.NewName)
                .NotEmpty().WithMessage(TaskListNameIsRequired);
            RuleFor(x => x.NewTasks)
                .NotEmpty().WithMessage(TaskListBodyIsRequired);
        }
    }
}
