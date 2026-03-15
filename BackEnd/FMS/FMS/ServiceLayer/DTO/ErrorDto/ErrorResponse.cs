namespace FMS.ServiceLayer.DTO.ErrorDto
{
    public class ErrorResponse
    {
        public int StatusCode { get; set; }
        public string Message { get; set; }
        public string? Details { get; set; } // Chỉ hiện khi ở môi trường Development
    }
}
