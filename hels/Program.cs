using Api.TaskList.Composers;

namespace Api
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
            var app = builder.BuildApplication();
            
            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            // Controllers
            var route = app.MapGroup("/");
            route.TaskListControllerBuilder();
            
            app.Run();
        }
    }
}
