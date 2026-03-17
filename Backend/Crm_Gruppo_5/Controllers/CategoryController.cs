using Crm_Gruppo_5.Dto;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Crm_Gruppo_5.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryController(Data.ContactDbContext ctx, ILogger<CategoryController> logger, Mapper mapper) : ControllerBase
    {
        private readonly Data.ContactDbContext _ctx = ctx;
        private readonly ILogger<CategoryController> _logger = logger;
        private readonly Mapper _mapper = mapper;

        [HttpGet]
        [Route("all")]
        public IActionResult GetAll()
        {
            try
            {
                var result = _ctx.Categories
                    .ToList()
                    .ConvertAll(_mapper.MapBaseEntitytoDto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message, ex);
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet]
        [Route("{id}")]
        public IActionResult GetSingle([FromRoute] int id)
        {
            var category = _ctx.Categories
                          .SingleOrDefault(c => c.CategoryId == id);

            if (category == null)
            {
                return NotFound($"Category with id {id} not found");
            }

            return Ok(_mapper.MapBaseEntitytoDto(category));
        }

        [HttpGet]
        [Route("WithContacts/{id}")]
        public IActionResult GetContacts([FromRoute] int id)
        {
            var category = _ctx.Categories
                          .Include(c => c.Contacts)
                          .ThenInclude(c => c.Company)
                          .SingleOrDefault(c => c.CategoryId == id);
            if (category == null)
            {
                return NotFound($"Category with id {id} not found");
            }
            var result = category.Contacts
                                 .ToList()
                                 .ConvertAll(_mapper.MapEntityToContactDetailsDto);
            var finalResult = result.Where(c => c.Company != null).GroupBy(c => c.Company!.CompanyId);
            return Ok(finalResult);
        }


        [HttpPost]
        public IActionResult Create(CategoryDto category)
        {
            category.CategoryId = 0;

            var entity = _mapper.MapDtoToEntity(category);

            _ctx.Categories.Add(entity);

            if (_ctx.SaveChanges() > 0)
            {
                return CreatedAtAction(nameof(GetSingle), new { id = entity.CategoryId }, _mapper.MapBaseEntitytoDto(entity));
            }

            return BadRequest();
        }

        [HttpPut]
        [Route("{id}")]
        public IActionResult Update([FromRoute] int id, [FromBody] CategoryDto dto)
        {
            var category = _ctx.Categories.SingleOrDefault(c => c.CategoryId == id);

            if (category == null)
            {
                return NotFound();
            }

            if (!string.IsNullOrEmpty(dto.Description))
                category.Description = dto.Description;

            _ctx.SaveChanges();

            var result = _mapper.MapBaseEntitytoDto(category);

            return Ok(result);
        }

        [HttpDelete("{id}")]
        public IActionResult Delete([FromRoute] int id)
        {
            var category = _ctx.Categories.SingleOrDefault(c => c.CategoryId == id);

            if (category == null)
            {
                return NotFound();
            }

            _ctx.Categories.Remove(category);

            if (_ctx.SaveChanges() > 0)
                return NoContent();
            else
                return UnprocessableEntity("Unable to delete the category.");
        }
    }
}
