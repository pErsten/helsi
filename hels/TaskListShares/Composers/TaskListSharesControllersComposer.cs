using Api.TaskListShares.Create;
using Api.TaskListShares.Delete;
using Api.TaskListShares.Get;

namespace Api.TaskListShares.Composers
{
    public static class TaskListSharesControllersComposer
    {
        public static IEndpointRouteBuilder TaskListSharesControllerBuilder(this IEndpointRouteBuilder builder)
        {
            var group = builder.MapGroup("TaskListShares");

            group.MapPut("/create", TaskListSharesCreateController.Handle);
            group.MapDelete("/delete", TaskListSharesDeleteController.Handle);
            group.MapGet("/get", TaskListSharesGetController.Handle);

            return builder;
        }
    }
}
