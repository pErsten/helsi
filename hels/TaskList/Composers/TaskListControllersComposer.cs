using Api.TaskList.TaskListCreate;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Api.TaskList.Composers
{
    public static class TaskListControllersComposer
    {

        public static IEndpointRouteBuilder TaskListControllerBuilder(this IEndpointRouteBuilder builder)
        {
            var group = builder.MapGroup("TaskList");

            group.MapPut("/create", TaskListCreateController.Handle);
            //group.MapPatch("/update", Update);
            //group.MapDelete("/delete", Delete);


            return builder;
        }
    }
}
