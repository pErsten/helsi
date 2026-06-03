namespace Api
{
    public static class WebUtils
    {
        public static string? GetUser(this HttpContext context)
        {
            if (context.Request.Headers.TryGetValue("X-User-Id", out var userId)
                && !string.IsNullOrEmpty(userId))
            {
                return userId;
            }
            return null;
        }
    }
}
