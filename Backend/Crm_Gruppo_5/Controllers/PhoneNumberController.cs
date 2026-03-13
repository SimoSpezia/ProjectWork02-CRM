using Crm_Gruppo_5.Dto;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Crm_Gruppo_5.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PhoneNumberController(Data.ContactDbContext ctx, ILogger<PhoneNumberController> logger, Mapper mapper) : ControllerBase
    {

            private readonly Data.ContactDbContext _ctx = ctx;
            private readonly ILogger<PhoneNumberController> _logger = logger;
            private readonly Mapper _mapper = mapper;
    
            [HttpGet]
            [Route("all")]
            public IActionResult GetAll()
            {
                try
                {
                    var result = _ctx.PhoneNumbers.ToList().ConvertAll(_mapper.MapBaseEntitytoDto);
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
            var phoneNumber = _ctx.PhoneNumbers.SingleOrDefault(p => p.PhoneNumberId == id);
            if(phoneNumber == null)
            {
                return NoContent();
            }

            return Ok(_mapper.MapBaseEntitytoDto(phoneNumber));
        }


        [HttpPut]
        [Route("{id}")]
        public IActionResult Update([FromRoute] int id, [FromBody] PhoneNumberDto Dto)
        {
            var phoneNumber = _ctx.PhoneNumbers.SingleOrDefault(c => c.PhoneNumberId == id);

            if (phoneNumber == null)
            {
                return NotFound();
            }
            if (!string.IsNullOrEmpty(Dto.Number))
                phoneNumber.Number = Dto.Number;
            if (!string.IsNullOrEmpty(Dto.Prefix))
                phoneNumber.Prefix = Dto.Prefix;
            if (!string.IsNullOrEmpty(Dto.Nationality))
                phoneNumber.Nationality = Dto.Nationality;
            _ctx.SaveChanges();

            var result = _mapper.MapBaseEntitytoDto(phoneNumber);

            return Ok(result);
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var phoneNumber = _ctx.PhoneNumbers.SingleOrDefault(c => c.PhoneNumberId == id);

            if (phoneNumber == null)
            {
                return NotFound();
            }

            _ctx.PhoneNumbers.Remove(phoneNumber);

            if (_ctx.SaveChanges() > 0)
                return NoContent();
            else
                return UnprocessableEntity("Impossibile eliminare il numero di telefono.");
        }

        
    }
}
