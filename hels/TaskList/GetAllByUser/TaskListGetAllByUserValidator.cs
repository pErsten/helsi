using Domain;
using Domain.DTOs.TaskList;
using FluentValidation;

namespace Api.TaskList.GetAllByUser
{
    public class TaskListGetAllByUserValidator : AbstractValidator<TaskListGetAllByUserRequestDto>
    {
        private static readonly string TaskListPageMustBeGreaterThanZero = "TaskList page must be greater than 0";
        private static readonly string TaskListUserIdMustBeSet = "TaskList user id must be set";
        private static readonly string TaskListPageSizeOutOfBounds = $"TaskList page size must be between {Constants.MinTaskListPageSize} and {Constants.MaxTaskListPageSize}";
        public TaskListGetAllByUserValidator()
        {
            RuleFor(x => x.UserId)
                .NotEmpty().WithMessage(TaskListUserIdMustBeSet);
            RuleFor(x => x.Page)
                .GreaterThanOrEqualTo(0).WithMessage(TaskListPageMustBeGreaterThanZero);
            RuleFor(x => x.PageSize)
                .InclusiveBetween(Constants.MinTaskListPageSize, Constants.MaxTaskListPageSize).WithMessage(TaskListPageSizeOutOfBounds);
        }
    }
}
