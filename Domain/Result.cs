namespace Application
{
    // Results pattern
    public class Result(string? ErrorMsg = null)
    {
        public bool IsError => string.IsNullOrEmpty(ErrorMsg);
    }

    public class Result<T>
    {
        public Result(T data)
        {
            Data = data;
        }

        public Result(string errorMsg)
        {
            ErrorMsg = errorMsg;
        }

        public string ErrorMsg { get; set; }
        private T? Data { get; set; }
        public bool IsError => string.IsNullOrEmpty(ErrorMsg);

        public bool TryGetData(out T? data)
        {
            data = IsError ? default : Data;
            return IsError;
        }
    }
}
