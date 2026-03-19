using Crm_Gruppo_5.Dto;
using CrmGruppo5.Data;
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

        // Api che restituisce tutti i numeri di telefono.
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

        // Api che restituisce un numero di telefono tramite id.
        [HttpGet]
        [Route("{id}")]
        public IActionResult GetSingle([FromRoute] int id)
        {
            var phoneNumber = _ctx.PhoneNumbers.SingleOrDefault(p => p.PhoneNumberId == id);
            if (phoneNumber == null)
            {
                return NoContent();
            }

            return Ok(_mapper.MapBaseEntitytoDto(phoneNumber));
        }

        // Api che filtra i numeri per categoria e tipo opzionale.
        [HttpGet]
        [Route("by-category/{categoryId}")]
        public IActionResult GetByCategory([FromRoute] int categoryId, [FromQuery] int? Id)
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

        // Api che filtra i numeri per azienda e tipo opzionale.
        [HttpGet]
        [Route("by-company/{companyId}")]
        public IActionResult GetByCompany([FromRoute] int companyId, [FromQuery] int? Id)
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

        // Api che restituisce i numeri per tipo di telefono.
        [HttpGet]
        [Route("by-type/{Id}")]
        public IActionResult GetByPhoneNumberType([FromRoute] int Id)
        {
            var result = _ctx.PhoneNumbers
                .Include(p => p.PhoneNumberType)
                .Where(p => p.PhoneNumberType != null && p.PhoneNumberType.PhoneNumberTypeId == Id)
                .ToList()
                .ConvertAll(_mapper.MapEntityToPhoneNumberDetailsDto);

            if (!result.Any())
                return NoContent();

            return Ok(result);
        }

        // Api che crea un numero per un contatto specifico.
        [HttpPost]
        [Route("{Id}")]
        public IActionResult Create([FromRoute] int Id, PhoneNumberDto phoneNumber)
        {
            var contact = _ctx.Contacts.SingleOrDefault(c => c.ContactId == Id);
            if (contact == null)
            {
                return NotFound($"Contact with id {Id} not found");
            }
            phoneNumber.PhoneNumberId = 0;

            var entity = _mapper.MapDtoToEntity(phoneNumber);
            entity.Contact = contact;

            if (phoneNumber.PhoneNumberTypeId.HasValue)
            {
                var phoneNumberType = _ctx.PhoneNumberTypes.SingleOrDefault(t => t.PhoneNumberTypeId == phoneNumber.PhoneNumberTypeId.Value);
                if (phoneNumberType == null)
                {
                    return BadRequest($"PhoneNumberType with id {phoneNumber.PhoneNumberTypeId.Value} not found");
                }

                entity.PhoneNumberType = phoneNumberType;
            }
            else
            {
                entity.PhoneNumberType = null;
            }

            _ctx.PhoneNumbers.Add(entity);

            if (_ctx.SaveChanges() > 0)
            {
                return CreatedAtAction(nameof(GetSingle), new { id = entity.PhoneNumberId }, _mapper.MapBaseEntitytoDto(entity));
            }

            return BadRequest();
        }

        // Api che aggiorna un numero di telefono.
        [HttpPut]
        [Route("{id}")]
        public IActionResult Update([FromRoute] int id, [FromBody] PhoneNumberDto Dto)
        {
            var phoneNumber = _ctx.PhoneNumbers
                .Include(c => c.PhoneNumberType)
                .SingleOrDefault(c => c.PhoneNumberId == id);

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

            if (Dto.PhoneNumberTypeId.HasValue)
            {
                var phoneNumberType = _ctx.PhoneNumberTypes.SingleOrDefault(t => t.PhoneNumberTypeId == Dto.PhoneNumberTypeId.Value);
                if (phoneNumberType == null)
                {
                    return BadRequest($"PhoneNumberType with id {Dto.PhoneNumberTypeId.Value} not found");
                }

                phoneNumber.PhoneNumberType = phoneNumberType;
            }
            else
            {
                phoneNumber.PhoneNumberType = null;
            }

            _ctx.SaveChanges();

            var result = _mapper.MapBaseEntitytoDto(phoneNumber);

            return Ok(result);
        }

        // Api che elimina un numero di telefono.
        [HttpDelete("{id}")]
        public IActionResult Delete([FromRoute] int id)
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
                return UnprocessableEntity("Unable to delete the phone number.");
        }


    }
}