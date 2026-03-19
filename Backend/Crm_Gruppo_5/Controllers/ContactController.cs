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

        // Api che restituisce tutti i contatti non eliminati.
        [HttpGet]
        [Route("all")]
        public IActionResult GetAll()
        {

            try
            {
                var result = _ctx.Contacts
                    .Where(c => !c.IsDeleted)
                    .Include(c => c.Company)
                    .Include(c=>c.Address)
                    .Include(c=>c.ContactType)
                    .ToList()
                    .ConvertAll(_mapper.MapEntitytoSimpleDto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message, ex);
                return StatusCode(500, ex.Message);
            }
        }

        // Api che restituisce un contatto tramite id.
        [HttpGet]
        [Route("{id}")]
        public IActionResult GetSingle([FromRoute] int id)
        {
            var contact = _ctx.Contacts
                          .Include(c => c.Address)
                          .SingleOrDefault(c => c.ContactId == id && !c.IsDeleted);

            if (contact == null)
            {
                return NotFound($"Contact with id {id} not found");
            }

            return Ok(_mapper.MapEntitytoSimpleDto(contact));
        }

        // Api che restituisce il dettaglio completo di un contatto.
        [HttpGet]
        [Route("{id}/WithDetails")]
        public IActionResult GetSingleWithDetails([FromRoute] int id)
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
                         .SingleOrDefault(c => c.ContactId == id && !c.IsDeleted);

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

        // Api che crea un contatto associandolo a un'azienda.
        [HttpPost]
        [Route("withCompany/{id}")]
        public IActionResult CreateWithCompany([FromRoute] int id, [FromBody] ContactDto contact)
        {
            var company = _ctx.Companies.SingleOrDefault(c => c.CompanyId == id);

            if (company == null)
            {
                return NotFound($"Company with id {id} not found");
            }

            contact.ContactId = 0;

            var result = _mapper.MapDtoToEntity(contact);
            result.Company = company;

            _ctx.Contacts.Add(result);

            if (_ctx.SaveChanges() > 0)
            {
                return CreatedAtAction(nameof(GetSingle), new { id = result.ContactId }, _mapper.MapBaseEntitytoDto(result));
            }

            return BadRequest();
        }

        // Api che crea un nuovo contatto.
        [HttpPost]
        public IActionResult Create(ContactDto contact)
        {
            contact.ContactId = 0;
            if(string.IsNullOrWhiteSpace(contact.Name) || string.IsNullOrWhiteSpace(contact.Surname))
            {
                return BadRequest("Name and Surname are required fields.");
            }

            var result = _mapper.MapDtoToEntity(contact);

            _ctx.Contacts.Add(result);

            if (_ctx.SaveChanges() > 0)
            {
                return CreatedAtAction(nameof(GetSingle), new { id = result.ContactId }, _mapper.MapBaseEntitytoDto(result));
            }

            return BadRequest();
        }


        // Api che aggiorna i dati di un contatto.
        [HttpPut]
        [Route("{id}")]
        public IActionResult Update([FromRoute] int id, [FromBody] ContactDto Dto)
        {
            var contact = _ctx.Contacts.SingleOrDefault(c => c.ContactId == id && !c.IsDeleted);

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
            if (Dto.Birthday != default(DateOnly))
                contact.Birthday = Dto.Birthday;
            if (!string.IsNullOrEmpty(Dto.Note))
                contact.Note = Dto.Note;

            _ctx.SaveChanges();

            var result = _mapper.MapBaseEntitytoDto(contact);

            return Ok(result);
        }

        // Api che esegue la cancellazione logica di un contatto.
        [HttpPatch]
        [Route("SoftDelete/{id}")]
        public IActionResult SoftDelete([FromRoute] int id)
        {
            var contact = _ctx.Contacts
                .Include(c => c.Categories)
                .SingleOrDefault(c => c.ContactId == id && !c.IsDeleted);

            if (contact == null)
            {
                return NotFound($"Contact with id {id} not found");
            }

            contact.IsDeleted = true;

            if (_ctx.SaveChanges() > 0)
                return NoContent();
            else
                return UnprocessableEntity("Unable to soft delete the contact.");
        }

        // Api che esegue la cancellazione fisica di un contatto.
        [HttpDelete("HardDelete/{id}")]
        public IActionResult HardDelete([FromRoute] int id)
        {
            var contact = _ctx.Contacts
                .Include(c => c.Categories)
                .SingleOrDefault(c => c.ContactId == id && !c.IsDeleted);

            if (contact == null)
            {
                return NotFound();
            }

            if (contact.Categories != null && contact.Categories.Count > 0)
            {
                return Conflict($"Cannot delete contact with id {id} because it is associated with a category!");
            }

            _ctx.Contacts.Remove(contact);

            if (_ctx.SaveChanges() > 0)
                return NoContent();
            else
                return UnprocessableEntity("Unable to delete the contact.");
        }

        //API per gestione relazione tra Category e Contact (Groups nel DB)

        // Api che restituisce le categorie associate a un contatto.
        [HttpGet]
        [Route("CategoryByContact/{id}")]
        public IActionResult GetCategory([FromRoute] int id)
        {
            var contact = _ctx.Contacts
                         .Include(c => c.Categories)
                         .SingleOrDefault(c => c.ContactId == id && !c.IsDeleted);

            if (contact == null)
            {
                return NotFound($"Contact with id {id} not found");
            }

            var categories = contact.Categories != null
                ? contact.Categories.ConvertAll(_mapper.MapBaseEntitytoDto)
                : new List<CategoryDto>();

            var result = new GroupContactDto
            {
                ContactId = contact.ContactId,
                Categories = categories
            };

            return Ok(result);
        }

        // Api che collega una categoria a un contatto.
        [HttpPost]
        [Route("{id}/Category/{categoryId}")]
        public IActionResult AddCategoryToContact([FromRoute] int id, [FromRoute] int categoryId)
        {
            var contact = _ctx.Contacts
                .Include(c => c.Categories)
                .SingleOrDefault(c => c.ContactId == id && !c.IsDeleted);

            if (contact == null)
            {
                return NotFound($"Contact with id {id} not found");
            }

            var category = _ctx.Categories.SingleOrDefault(c => c.CategoryId == categoryId);
            if (category == null)
            {
                return NotFound($"Category with id {categoryId} not found");
            }

            contact.Categories ??= new List<Category>();

            if (contact.Categories.Any(c => c.CategoryId == categoryId))
            {
                return Conflict($"Category with id {categoryId} is already linked to contact {id}");
            }

            contact.Categories.Add(category);
            _ctx.SaveChanges();

            var result = new GroupContactDto
            {
                ContactId = contact.ContactId,
                Categories = contact.Categories.ConvertAll(_mapper.MapBaseEntitytoDto)
            };
            return Ok(result);
        }

        // Api che rimuove il collegamento tra categoria e contatto.
        [HttpDelete]
        [Route("{id}/Category/{categoryId}")]
        public IActionResult RemoveCategoryFromContact([FromRoute] int id, [FromRoute] int categoryId)
        {
            var contact = _ctx.Contacts
                .Include(c => c.Categories)
                .SingleOrDefault(c => c.ContactId == id && !c.IsDeleted);

            if (contact == null)
            {
                return NotFound($"Contact with id {id} not found");
            }

            if (contact.Categories == null)
            {
                return NotFound($"Category with id {categoryId} is not linked to contact {id}");
            }

            var category = contact.Categories.SingleOrDefault(c => c.CategoryId == categoryId);
            if (category == null)
            {
                return NotFound($"Category with id {categoryId} is not linked to contact {id}");
            }

            contact.Categories.Remove(category);
            _ctx.SaveChanges();

            var result = new GroupContactDto
            {
                ContactId = contact.ContactId,
                Categories = contact.Categories.ConvertAll(_mapper.MapBaseEntitytoDto)
            };

            return Ok(result);
        }

    }
}