using Crm_Gruppo_5.Dto;
using Microsoft.AspNetCore.Mvc;

namespace Crm_Gruppo_5.Controllers
{


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
            public IActionResult GetAll()
            {
                try
                {
                    var result = _ctx.Contacts;
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
                var contact = _ctx.Contacts.SingleOrDefault(c => c.ContactId == id);

                if (contact == null)
                {
                    return BadRequest($"Contact with id {id} not found");
                }

                return Ok(_mapper.MapBaseEntitytoDto(contact));
            }

            [HttpPost]
            public IActionResult Create(ContactDto contact)
            {
                contact.ContactId = 0;

                _ctx.Contacts.Add(contact);

                if (_ctx.SaveChanges() > 0)
                {
                    return Ok();
                }

                return BadRequest();
            }

            [HttpPut]
            [Route("{id}")]
            public IActionResult Update([FromRoute] int id, [FromBody] ContactSimpleDto Dto)
            {
                var contact = _ctx.Contacts.SingleOrDefault(c => c.ContactId == id);

                if (contact == null)
                {
                    return BadRequest();
                }

                contact.StartDate = Dto.StartDate;
                contact.EndDate = Dto.EndDate;
                contact.CompanyId = Dto.CompanyId;

                _ctx.SaveChangesAsync();

                var result = _mapper.MapBaseEntitytoDto(contact);

                return Ok(result);
            }

            [HttpDelete("{id}")]
            public IActionResult Delete(int id)
            {
                var contact = _ctx.Contacts.SingleOrDefault(c => c.ContactId == id);

                if (contact == null)
                {
                    return BadRequest();
                }

                _ctx.Contacts.Remove(contact);

                if (_ctx.SaveChanges() == 1)
                    return NoContent();
                else
                    return UnprocessableEntity();
            }
        }
    }
}

