using Crm_Gruppo_5.Dto;
using CrmGruppo5.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Crm_Gruppo_5.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ContactController(Data.ContactDbContext ctx, ILogger<ContactController> logger, Mapper mapper) : ControllerBase
    {
        private readonly Data.ContactDbContext _ctx = ctx;
        private readonly ILogger<ContactController> _logger = logger;
        private readonly Mapper _mapper = mapper;

        [HttpGet]
        [Route("all")]
        public IActionResult GetAll()
        {
            try
            {
                var result = _ctx.Contacts.ToList().ConvertAll(_mapper.MapBaseEntitytoDto);
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
            var contact = _ctx.Contacts
                          .SingleOrDefault(c => c.ContactId == id);

            if (contact == null)
            {
                return NotFound($"Contact with id {id} not found");
            }

            return Ok(_mapper.MapBaseEntitytoDto(contact));
        }

        [HttpGet]
        [Route("{id}/WithDetails")]
        public IActionResult GetSingleWithDetails(int id)
        {
            var result = _ctx.Contacts
                         .Include(c => c.MailAddresses)
                         .ThenInclude(m => m.MailAddressType)
                         .Include(c => c.PhoneNumbers)
                         .ThenInclude(p => p.PhoneNumberType)
                         .Include(c => c.Company)
                         .Include(c => c.Categories)
                         .Include(c => c.Address)
                         .Include(c => c.ContactType)
                         .SingleOrDefault(c => c.ContactId == id);

            if (result == null)
            {
                return NotFound($"Contact with id {id} not found");
            }

            if (result.PhoneNumbers != null)
            {
                result.PhoneNumbers = result.PhoneNumbers
                    .OrderBy(p => p.PhoneNumberType != null ? p.PhoneNumberType.Priority : int.MaxValue)
                    .ToList();
            }

            var resultDto = _mapper.MapEntityToContactDetailsDto(result);

            if (resultDto.Categories != null && resultDto.Categories.Count > 0)
            {
                resultDto.CategoriesAsString = string.Join(", ", resultDto.Categories.Select(c => c.Description));
            }

            resultDto.Categories = null;
            return Ok(resultDto);
        }



        [HttpPost]
        public IActionResult Create(ContactDto contact)
        {
            contact.ContactId = 0;

            var result = _mapper.MapDtoToEntity(contact);

            _ctx.Contacts.Add(result);

            if (_ctx.SaveChanges() > 0)
            {
                return CreatedAtAction(nameof(GetSingle), new { id = result.ContactId }, _mapper.MapBaseEntitytoDto(result));
            }

            return BadRequest();
        }

        [HttpPut]
        [Route("{id}")]
        public IActionResult Update([FromRoute] int id, [FromBody] ContactDto Dto)
        {
            var contact = _ctx.Contacts.SingleOrDefault(c => c.ContactId == id);

            if (contact == null)
            {
                return NotFound();
            }

            if (!string.IsNullOrEmpty(Dto.Name))
                contact.Name = Dto.Name;
            if (!string.IsNullOrEmpty(Dto.Surname))
                contact.Surname = Dto.Surname;
            if (!string.IsNullOrEmpty(Dto.Title))
                contact.Title = Dto.Title;
            if (!string.IsNullOrEmpty(Dto.WorkRole))
                contact.WorkRole = Dto.WorkRole;
            if (!string.IsNullOrEmpty(Dto.Gender))
                contact.Gender = Dto.Gender;
            if (Dto.Birthday != default(DateTime))
                contact.Birthday = Dto.Birthday;
            if (!string.IsNullOrEmpty(Dto.Note))
                contact.Note = Dto.Note;
            if (Dto.DateAdded != default(DateTime))
                contact.DateAdded = Dto.DateAdded;

            _ctx.SaveChanges();

            var result = _mapper.MapBaseEntitytoDto(contact);

            return Ok(result);
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var contact = _ctx.Contacts.SingleOrDefault(c => c.ContactId == id);

            if (contact == null)
            {
                return NotFound();
            }

            _ctx.Contacts.Remove(contact);

            if (_ctx.SaveChanges() > 0)
                return NoContent();
            else
                return UnprocessableEntity("Impossibile eliminare il contatto.");
        }
    }
}