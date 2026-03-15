using FMS.ServiceLayer.DTO.ErrorDto;
using System.Net;
using System.Text.Json;

namespace FMS.Middleware
{
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionMiddleware> _logger;
        private readonly IHostEnvironment _env;

        public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger, IHostEnvironment env)
        {
            _next = next;
            _logger = logger;
            _env = env;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context); // Đi tiếp tới Controller/Service
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Một lỗi không mong muốn đã xảy ra: {Message}", ex.Message);

                context.Response.ContentType = "application/json";
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

                var response = new ErrorResponse
                {
                    StatusCode = context.Response.StatusCode,
                    Message = "Lỗi hệ thống. Vui lòng liên hệ Admin.",
                    Details = _env.IsDevelopment() ? ex.StackTrace?.ToString() : null
                };

                var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
                var json = JsonSerializer.Serialize(response, options);

                await context.Response.WriteAsync(json);
            }
        }
    }
}
