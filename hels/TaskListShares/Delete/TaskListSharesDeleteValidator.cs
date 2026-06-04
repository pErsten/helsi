using Domain.DTOs.TaskListShares;
using FluentValidation;
using MongoDB.Bson;

namespace Api.TaskListShares.Delete
{
    public class TaskListSharesDeleteValidator : AbstractValidator<TaskListSharesDeleteRequestDto>
    {
        private static readonly string TaskListIdIsRequired = "TaskList id is required";
        private static readonly string TaskListUserIdMustBeSet = "TaskList user id must be set";
        private static readonly string TaskListIdMustBeInCorrectFormat = "TaskList id must be in correct format";
        public TaskListSharesDeleteValidator()
        {
            RuleFor(x => x.TaskListId)
                .NotEmpty().WithMessage(TaskListIdIsRequired)
                .Must(x => ObjectId.TryParse(x, out _)).WithMessage(TaskListIdMustBeInCorrectFormat);
            RuleFor(x => x.CallerUserId)
                .NotEmpty().WithMessage(TaskListUserIdMustBeSet);
            RuleFor(x => x.SharedUserId)
                .NotEmpty().WithMessage(TaskListUserIdMustBeSet);
        }
    }
}
