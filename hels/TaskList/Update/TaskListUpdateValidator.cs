using Domain;
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
        private static readonly string TaskListUserIdMustBeSet = "TaskList user id must be set";
        private static readonly string TaskListIdMustBeInCorrectFormat = "TaskList id must be in correct format";
        private static readonly string TaskListNameLengthOutOfBounds = $"TaskList name must be between {Constants.MinTaskListNameLength} and {Constants.MaxTaskListNameLength} symbols";
        public TaskListUpdateValidator()
        {
            RuleFor(x => x.TaskListId)
                .NotEmpty().WithMessage(TaskListIdIsRequired)
                .Must(x => ObjectId.TryParse(x, out _)).WithMessage(TaskListIdMustBeInCorrectFormat);
            RuleFor(x => x.UserId)
                .NotEmpty().WithMessage(TaskListUserIdMustBeSet);
            RuleFor(x => x.NewName)
                .NotEmpty().WithMessage(TaskListNameIsRequired)
                .Length(Constants.MinTaskListNameLength, Constants.MaxTaskListNameLength).WithMessage(TaskListNameLengthOutOfBounds);
            RuleFor(x => x.NewTasks)
                .NotEmpty().WithMessage(TaskListBodyIsRequired);
        }
    }
}
