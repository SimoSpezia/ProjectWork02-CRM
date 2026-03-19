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

        // Api che restituisce tutte le mail.
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

        // Api che restituisce una mail tramite id.
        [HttpGet]
        [Route("{id}")]
        public IActionResult GetSingle([FromRoute] int id)
        {
            var mail = _ctx.MailAddresses.SingleOrDefault(m => m.MailAddressId == id);

            if (mail == null)
            {
                return BadRequest($"MailAddress with id {id} not found");

            }
            return Ok(_mapper.MapBaseEntitytoDto(mail));
        }

        // Api che filtra le mail per categoria e tipo opzionale.
        [HttpGet]
        [Route("by-category/{categoryId}")]
        public IActionResult GetByCategory([FromRoute] int categoryId, [FromQuery] int? Id)
        {
            var query = _ctx.MailAddresses
                .Include(m => m.Contact)
                    .ThenInclude(c => c.Categories)
                .Include(m => m.MailAddressType)
                .Where(m => m.Contact != null
                            && m.Contact.Categories != null
                            && m.Contact.Categories.Any(cat => cat.CategoryId == categoryId));

            if (Id.HasValue)
            {
                query = query.Where(m => m.MailAddressType != null && m.MailAddressType.MailAddressTypeId == Id.Value);
            }

            var result = query
                .ToList()
                .ConvertAll(_mapper.MapEntityToMailAddressDetailsDto);

            if (!result.Any())
                return NoContent();

            return Ok(result);
        }

        // Api che filtra le mail per azienda e tipo opzionale.
        [HttpGet]
        [Route("by-company/{companyId}")]
        public IActionResult GetByCompany([FromRoute] int companyId, [FromQuery] int? Id)
        {
            var query = _ctx.MailAddresses
                        .Include(m => m.Contact)
                        .ThenInclude(c => c.Company)
                        .Include(m => m.MailAddressType)
                        .Where(m => m.Contact != null
                            && m.Contact.Company != null
                            && m.Contact.Company.CompanyId == companyId);

            if (Id.HasValue)
            {
                query = query.Where(m => m.MailAddressType != null && m.MailAddressType.MailAddressTypeId == Id.Value);
            }

            var result = query
                .ToList()
                .ConvertAll(_mapper.MapEntityToMailAddressDetailsDto);

            if (!result.Any())
                return NoContent();

            return Ok(result);
        }

        // Api che restituisce le mail per tipo di indirizzo.
        [HttpGet]
        [Route("by-type/{Id}")]
        public IActionResult GetByMailAddressType([FromRoute] int Id)
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

        // Api che crea una mail per un contatto specifico.
        [HttpPost]
        [Route("{Id}")]
        public IActionResult Create([FromRoute] int Id, [FromBody] MailAddressDto mailAddress)
        {
            var contact = _ctx.Contacts.SingleOrDefault(c => c.ContactId == Id);

            if (contact == null)
            {
                return NotFound($"Contact with id {Id} not found");
            }

            mailAddress.MailAddressId = 0;

            var entity = _mapper.MapDtoToEntity(mailAddress);
            entity.Contact = contact;

            if (mailAddress.MailAddressTypeId.HasValue)
            {
                var mailAddressType = _ctx.MailAddressTypes.SingleOrDefault(t => t.MailAddressTypeId == mailAddress.MailAddressTypeId.Value);
                if (mailAddressType == null)
                {
                    return BadRequest($"MailAddressType with id {mailAddress.MailAddressTypeId.Value} not found");
                }

                entity.MailAddressType = mailAddressType;
            }
            else
            {
                entity.MailAddressType = null;
            }

            _ctx.MailAddresses.Add(entity);

            if (_ctx.SaveChanges() > 0)
            {
                return CreatedAtAction(nameof(GetSingle), new { id = entity.MailAddressId }, _mapper.MapBaseEntitytoDto(entity));
            }

            return BadRequest();
        }

        // Api che aggiorna una mail esistente.
        [HttpPut]
        [Route("{id}")]
        public IActionResult Update([FromRoute] int id, [FromBody] MailAddressDto Dto)
        {
            var mail = _ctx.MailAddresses
                .Include(m => m.MailAddressType)
                .SingleOrDefault(m => m.MailAddressId == id);

            if (mail == null)
            {
                return NotFound();
            }
            if (!string.IsNullOrEmpty(Dto.Mail))
                mail.Mail = Dto.Mail;

            if (Dto.MailAddressTypeId.HasValue)
            {
                var mailAddressType = _ctx.MailAddressTypes.SingleOrDefault(t => t.MailAddressTypeId == Dto.MailAddressTypeId.Value);
                if (mailAddressType == null)
                {
                    return BadRequest($"MailAddressType with id {Dto.MailAddressTypeId.Value} not found");
                }

                mail.MailAddressType = mailAddressType;
            }
            else
            {
                mail.MailAddressType = null;
            }

            _ctx.SaveChanges();

            var result = _mapper.MapBaseEntitytoDto(mail);

            return Ok(result);
        }

        // Api che elimina una mail tramite id.
        [HttpDelete]
        [Route("{id}")]
        public IActionResult Delete([FromRoute] int id)
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
                return UnprocessableEntity("Unable to delete the mail.");
        }
    }
}
