namespace Domain
{
    // Soft deletion style
    public enum TaskListShareStatus : byte
    {
        None = 0,
        Owner = 1,
        Shared = 2,
        Deleted = 3,
        // Suspended = 3, - if there's a potential for a logic concerning temporary cancel of access instead of deletion
    }

    public enum TaskListStatus : byte
    {
        None = 0,
        Active = 1,
        Deleted = 2,
    }
}
