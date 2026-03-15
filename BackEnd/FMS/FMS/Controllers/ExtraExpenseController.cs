using FMS.Pagination;
using FMS.ServiceLayer.Interface;
using Microsoft.AspNetCore.Mvc;

namespace FMS.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExtraExpenseController : ControllerBase
    {
        private readonly IExtraExpenseService _extraExpenseService;
        public ExtraExpenseController(IExtraExpenseService extraExpenseService)
        {
            _extraExpenseService = extraExpenseService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] ExtraExpenseParams @params)
        {
            var items = await _extraExpenseService.GetAllAsync(@params);
            return Ok(items);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _extraExpenseService.GetByIdAsync(id);
            if (item == null) return NotFound();
            return Ok(item);
        }
        
        // Respond to preflight OPTIONS requests from browsers/proxies
        [HttpOptions]
        public IActionResult Options()
        {
            return Ok();
        }
        
        [HttpPost]
        [Route("")]
        public async Task<IActionResult> Create([FromBody] FMS.ServiceLayer.DTO.ExtraExpenseDto.CreateExtraExpenseDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var createdId = await _extraExpenseService.CreateExtraExpenseAsync(dto);
            // return the created resource id
            return CreatedAtAction(nameof(GetById), new { id = createdId }, new { id = createdId });
        }
    }
}


