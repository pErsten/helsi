using Domain;
using FluentValidation;

namespace Api.TaskList.TaskListCreate
{
    public class TaskListCreateValidator : AbstractValidator<TaskListCreateRequestDto>
    {
        private static readonly string TaskListNameIsRequired = "TaskList name is required";
        private static readonly string TaskListNameLengthOutOfBounds = $"TaskList name must be between {Constants.MinTaskListNameLength} and {Constants.MaxTaskListNameLength} symbols";
        private static readonly string TaskListOwnerIdMustBeSet = "TaskList owner id must be set";
        private static readonly string TaskListOwnerIdMustBeGuid = "TaskList owner id must be GUID";
        public TaskListCreateValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage(TaskListNameIsRequired)
                .Length(Constants.MinTaskListNameLength, Constants.MaxTaskListNameLength).WithMessage(TaskListNameLengthOutOfBounds);
            RuleFor(x => x.OwnerId)
                .NotEmpty().WithMessage(TaskListOwnerIdMustBeSet)
                .Must(x => Guid.TryParse(x, out _)).WithMessage(TaskListOwnerIdMustBeGuid);
        }
    }
}
