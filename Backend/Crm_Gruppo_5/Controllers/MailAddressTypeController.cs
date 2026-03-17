using Crm_Gruppo_5.Dto;
using Microsoft.AspNetCore.Mvc;

namespace Crm_Gruppo_5.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MailAddressTypeController(Data.ContactDbContext ctx, ILogger<MailAddressTypeController> logger, Mapper mapper) : ControllerBase
    {
        private readonly Data.ContactDbContext _ctx = ctx;
        private readonly ILogger<MailAddressTypeController> _logger = logger;
        private readonly Mapper _mapper = mapper;

        [HttpGet]
        [Route("all")]
        public IActionResult GetAll()
        {
            try
            {
                var result = _ctx.MailAddressTypes.ToList().ConvertAll(_mapper.MapBaseEntitytoDto);
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
            var mail = _ctx.MailAddressTypes.SingleOrDefault(m => m.MailAddressTypeId == id);

            if (mail == null)
            {
                return BadRequest($"MailAddressType with id {id} not found");

            }
            return Ok(_mapper.MapBaseEntitytoDto(mail));
        }

        [HttpPost]
        public IActionResult Create(MailAddressTypeDto mailAddressType)
        {
            mailAddressType.MailAddressTypeId = 0;

            var entity = _mapper.MapDtoToEntity(mailAddressType);

            _ctx.MailAddressTypes.Add(entity);

            if (_ctx.SaveChanges() > 0)
            {
                return CreatedAtAction(nameof(GetSingle), new { id = entity.MailAddressTypeId }, _mapper.MapBaseEntitytoDto(entity));
            }

            return BadRequest();
        }

        [HttpPut]
        [Route("{id}")]
        public IActionResult Update([FromRoute] int id, [FromBody] MailAddressTypeDto Dto)
        {
            var mailType = _ctx.MailAddressTypes.SingleOrDefault(m => m.MailAddressTypeId == id);

            if (mailType == null)
            {
                return NotFound();
            }
            if (!string.IsNullOrEmpty(Dto.Description))
                mailType.Description = Dto.Description;
            mailType.Priority = Dto.Priority;

            _ctx.SaveChanges();

            var result = _mapper.MapBaseEntitytoDto(mailType);

            return Ok(result);
        }

        [HttpDelete("{id}")]
        public IActionResult Delete([FromRoute] int id)
        {
            var mailType = _ctx.MailAddressTypes.SingleOrDefault(m => m.MailAddressTypeId == id);

            if (mailType == null)
            {
                return NotFound();
            }

            _ctx.MailAddressTypes.Remove(mailType);

            if (_ctx.SaveChanges() > 0)
                return NoContent();
            else
                return UnprocessableEntity("Unable to delete the mail address type.");
        }

    }
}
