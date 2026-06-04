using Domain;
using Domain.DTOs.TaskList;
using FluentValidation;

namespace Api.TaskList.Create
{
    public class TaskListCreateValidator : AbstractValidator<TaskListCreateRequestDto>
    {
        private static readonly string TaskListNameIsRequired = "TaskList name is required";
        private static readonly string TaskListNameLengthOutOfBounds = $"TaskList name must be between {Constants.MinTaskListNameLength} and {Constants.MaxTaskListNameLength} symbols";
        private static readonly string TaskListOwnerIdMustBeSet = "TaskList owner id must be set";
        private static readonly string TaskListBodyIsRequired = "TaskList body is required";
        public TaskListCreateValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage(TaskListNameIsRequired)
                .Length(Constants.MinTaskListNameLength, Constants.MaxTaskListNameLength).WithMessage(TaskListNameLengthOutOfBounds);
            RuleFor(x => x.UserId)
                .NotEmpty().WithMessage(TaskListOwnerIdMustBeSet);
            RuleFor(x => x.Tasks)
                .NotEmpty().WithMessage(TaskListBodyIsRequired);
        }
    }
}
