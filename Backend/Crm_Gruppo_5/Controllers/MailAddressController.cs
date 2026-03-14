using Crm_Gruppo_5.Dto;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Crm_Gruppo_5.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MailAddressController(Data.ContactDbContext ctx, ILogger<MailAddressController> logger, Mapper mapper) : ControllerBase
    {

        private readonly Data.ContactDbContext _ctx = ctx;
        private readonly ILogger<MailAddressController> _logger = logger;
        private readonly Mapper _mapper = mapper;

        [HttpGet]
        [Route("all")]
        public IActionResult GetAll()
        {
            try
            {
                var result = _ctx.MailAddresses.ToList().ConvertAll(_mapper.MapBaseEntitytoDto);
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
            var mail = _ctx.MailAddresses.SingleOrDefault(m => m.MailAddressId == id);

            if (mail == null)
            {
                return BadRequest($"MailAddress with id {id} not found");

            }
            return Ok(_mapper.MapBaseEntitytoDto(mail));
        }
            
        [HttpGet]
        [Route("by-category/{categoryId}")]
        public IActionResult GetByCategory(int categoryId, [FromQuery] int? Id)
        {
            var query = _ctx.PhoneNumbers
                .Include(p => p.Contact)
                    .ThenInclude(c => c.Categories)
                .Include(p => p.PhoneNumberType)
                .Where(p => p.Contact != null
                            && p.Contact.Categories != null
                            && p.Contact.Categories.Any(cat => cat.CategoryId == categoryId));

            if (Id.HasValue)
            {
                query = query.Where(p => p.PhoneNumberType != null && p.PhoneNumberType.PhoneNumberTypeId == Id.Value);
            }

            var result = query
                .ToList()
                .ConvertAll(_mapper.MapEntityToPhoneNumberDetailsDto);

            if (!result.Any())
                return NoContent();

            return Ok(result);
        }

        [HttpGet]
        [Route("by-company/{companyId}")]
        public IActionResult GetByCompany(int companyId, [FromQuery] int? Id)
        {
            var query = _ctx.PhoneNumbers
                        .Include(p => p.Contact)
                        .ThenInclude(c => c.Company)
                        .Include(p => p.PhoneNumberType)
                        .Where(p => p.Contact != null
                            && p.Contact.Company != null
                            && p.Contact.Company.CompanyId == companyId);

            if (Id.HasValue)
            {
                query = query.Where(p => p.PhoneNumberType != null && p.PhoneNumberType.PhoneNumberTypeId == Id.Value);
            }

            var result = query
                .ToList()
                .ConvertAll(_mapper.MapEntityToPhoneNumberDetailsDto);

            if (!result.Any())
                return NoContent();

            return Ok(result);
        }

        [HttpGet]
        [Route("by-type/{Id}")]
        public IActionResult GetByMailAddressType(int Id)
        {
            var result = _ctx.MailAddresses
                .Include(m => m.MailAddressType)
                .Where(m => m.MailAddressType != null && m.MailAddressType.MailAddressTypeId == Id)
                .ToList()
                .ConvertAll(_mapper.MapEntityToMailAddressDetailsDto);

            if (!result.Any())
                return NoContent();

            return Ok(result);
        }

        [HttpPut]
        [Route("{id}")]
        public IActionResult Update([FromRoute] int id, [FromBody] MailAddressDto Dto)
        {
            var mail = _ctx.MailAddresses.SingleOrDefault(m => m.MailAddressId == id);

            if (mail == null)
            {
                return NotFound();
            }
            if (!string.IsNullOrEmpty(Dto.Mail))
                mail.Mail = Dto.Mail;
            _ctx.SaveChanges();

            var result = _mapper.MapBaseEntitytoDto(mail);

            return Ok(result);
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var mail = _ctx.MailAddresses.SingleOrDefault(m => m.MailAddressId == id);

            if (mail == null)
            {
                return NotFound();
            }

            _ctx.MailAddresses.Remove(mail);

            if (_ctx.SaveChanges() > 0)
                return NoContent();
            else
                return UnprocessableEntity("Impossibile eliminare la mail.");
        }
    }
}
