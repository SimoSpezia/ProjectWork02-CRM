using Crm_Gruppo_5.Dto;
using Microsoft.AspNetCore.Mvc;

namespace Crm_Gruppo_5.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PhoneNumberTypeController(Data.ContactDbContext ctx, ILogger<PhoneNumberTypeController> logger, Mapper mapper) : ControllerBase
    {
        private readonly Data.ContactDbContext _ctx = ctx;
        private readonly ILogger<PhoneNumberTypeController> _logger = logger;
        private readonly Mapper _mapper = mapper;

        [HttpGet]
        [Route("all")]
        public IActionResult GetAll()
        {
            try
            {
                var result = _ctx.PhoneNumberTypes.ToList().ConvertAll(_mapper.MapBaseEntitytoDto);
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
            var phoneType = _ctx.PhoneNumberTypes.SingleOrDefault(p => p.PhoneNumberTypeId == id);

            if (phoneType == null)
            {
                return NotFound($"PhoneNumberType with id {id} not found");

            }
            return Ok(_mapper.MapBaseEntitytoDto(phoneType));
        }

        [HttpPost]
        public IActionResult Create(PhoneNumberTypeDto phoneNumberType)
        {
            phoneNumberType.PhoneNumberTypeId = 0;

            var entity = _mapper.MapDtoToEntity(phoneNumberType);

            _ctx.PhoneNumberTypes.Add(entity);

            if (_ctx.SaveChanges() > 0)
            {
                return CreatedAtAction(nameof(GetSingle), new { id = entity.PhoneNumberTypeId }, _mapper.MapBaseEntitytoDto(entity));
            }

            return BadRequest();
        }

        [HttpPut]
        [Route("{id}")]
        public IActionResult Update([FromRoute] int id, [FromBody] PhoneNumberTypeDto Dto)
        {
            var phoneType = _ctx.PhoneNumberTypes.SingleOrDefault(p => p.PhoneNumberTypeId == id);

            if (phoneType == null)
            {
                return NotFound();
            }
            if (!string.IsNullOrEmpty(Dto.Description))
                phoneType.Description = Dto.Description;
            if (Dto.Priority != 0)
                phoneType.Priority = Dto.Priority;

            _ctx.SaveChanges();

            var result = _mapper.MapBaseEntitytoDto(phoneType);

            return Ok(result);
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var phoneType = _ctx.PhoneNumberTypes.SingleOrDefault(p => p.PhoneNumberTypeId == id);

            if (phoneType == null)
            {
                return NotFound();
            }

            _ctx.PhoneNumberTypes.Remove(phoneType);

            if (_ctx.SaveChanges() > 0)
                return NoContent();
            else
                return UnprocessableEntity("Unable to delete the phone number type.");
        }
    }
}
