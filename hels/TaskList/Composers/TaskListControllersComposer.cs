using Api.TaskList.Create;
using Api.TaskList.Delete;
using Api.TaskList.Get;
using Api.TaskList.Update;

namespace Api.TaskList.Composers
{
    public static class TaskListControllersComposer
    {

        public static IEndpointRouteBuilder TaskListControllerBuilder(this IEndpointRouteBuilder builder)
        {
            var group = builder.MapGroup("TaskList");

            group.MapPut("/get", TaskListGetController.Handle);
            group.MapPut("/create", TaskListCreateController.Handle);
            group.MapPatch("/update", TaskListUpdateController.Handle);
            group.MapDelete("/delete", TaskListDeleteController.Handle);


            return builder;
        }
    }
}
