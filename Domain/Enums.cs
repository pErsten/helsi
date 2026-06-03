namespace Domain
{
    // Soft deletion style
    public enum TaskListShareStatus
    {
        None = 0,
        Active = 1,
        Deleted = 2,
        // Suspended = 3, - if there's a potential for a logic concerning temporary cancel of access instead of deletion
    }

    public enum TaskListStatus
    {
        None = 0,
        Active = 1,
        Deleted = 2,
    }
}
