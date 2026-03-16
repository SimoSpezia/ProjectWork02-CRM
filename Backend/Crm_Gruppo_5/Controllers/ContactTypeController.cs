using Crm_Gruppo_5.Dto;
using Microsoft.AspNetCore.Mvc;

namespace Crm_Gruppo_5.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ContactTypeController(Data.ContactDbContext ctx, ILogger<ContactTypeController> logger, Mapper mapper) : ControllerBase
    {
        private readonly Data.ContactDbContext _ctx = ctx;
        private readonly ILogger<ContactTypeController> _logger = logger;
        private readonly Mapper _mapper = mapper;

        [HttpGet]
        [Route("all")]
        public IActionResult GetAll()
        {
            try
            {
                var result = _ctx.ContactTypes
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
        public IActionResult GetSingle(int id)
        {
            var contactType = _ctx.ContactTypes
                          .SingleOrDefault(c => c.ContactTypeId == id);

            if (contactType == null)
            {
                return NotFound($"ContactType with id {id} not found");
            }

            return Ok(_mapper.MapBaseEntitytoDto(contactType));
        }

        [HttpPost]
        public IActionResult Create(ContactTypeDto contactType)
        {
            contactType.ContactTypeId = 0;

            var result = _mapper.MapDtoToEntity(contactType);

            _ctx.ContactTypes.Add(result);

            if (_ctx.SaveChanges() > 0)
            {
                return CreatedAtAction(nameof(GetSingle), new { id = result.ContactTypeId }, _mapper.MapBaseEntitytoDto(result));
            }
            return BadRequest();
        }

        [HttpPut]
        [Route("{id}")]
        public IActionResult Update([FromRoute] int id, [FromBody] ContactTypeDto Dto)
        {
            var contactType = _ctx.ContactTypes.SingleOrDefault(c => c.ContactTypeId == id);

            if (contactType == null)
            {
                return NotFound();
            }

            if (!string.IsNullOrEmpty(Dto.Description))
                contactType.Description = Dto.Description;
            _ctx.SaveChanges();
            var result = _mapper.MapBaseEntitytoDto(contactType);

            return Ok(result);
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var contactType = _ctx.ContactTypes.SingleOrDefault(c => c.ContactTypeId == id);

            if (contactType == null)
            {
                return NotFound();
            }

            _ctx.ContactTypes.Remove(contactType);

            if (_ctx.SaveChanges() > 0)
                return NoContent();
            else
                return UnprocessableEntity("Unable to delete the contact type.");
        }
    }
}
