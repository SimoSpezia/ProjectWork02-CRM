using Crm_Gruppo_5.Dto;
using CrmGruppo5.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;

namespace Crm_Gruppo_5.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CompanyController(Data.ContactDbContext ctx, ILogger<CompanyController> logger, Mapper mapper) : ControllerBase
    {
        private readonly Data.ContactDbContext _ctx = ctx;
        private readonly ILogger<CompanyController> _logger = logger;
        private readonly Mapper _mapper = mapper;


        [HttpGet]
        [Route("all")]
        public IActionResult GetAll()
        {
            try
            {
                var result = _ctx.Companies.Include(c => c.Address).ToList().ConvertAll(_mapper.MapEntitytoSimpleDto);
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
            var company =  _ctx.Companies.Include(c => c.Address)
                               .SingleOrDefault(c => c.CompanyId == id); 

            if (company == null)
            {
                return BadRequest($"Company with id {id} not found");
               
            }
            return Ok(_mapper.MapEntitytoSimpleDto(company));
        }

        [HttpGet]
        [Route("{id}/contact")]
        public IActionResult GetContacts(int id)
        {
            var company = _ctx.Companies.Include(c => c.Contacts)
                               .SingleOrDefault(c => c.CompanyId == id);
            if (company == null)
            {
                return BadRequest($"Company with id {id} not found");
            }
            if (company.Contacts == null || !company.Contacts.Any())
            {
                return NoContent();
            }
            var contactsDto = company.Contacts.Select(c => _mapper.MapBaseEntitytoDto(c)).ToList();
            return Ok(contactsDto);
        }

        [HttpGet]
        [Route("/NumberContacts")]
        public IActionResult GetNumberContacts()
        {
            var companiesDto = _ctx.Companies
                    .Where(c => c.Contacts != null && c.Contacts.Any())
                    .Select(c => new CompanyDto
                    {
                        CompanyId = c.CompanyId,
                        Denomination = c.Denomination,
                        Website = c.Website,
                        VatNumber = c.VatNumber,
                        Size = c.Size,
                        Note = c.Note,
                        CountContacts = c.Contacts.Count()
                    });
            if (companiesDto.Any())
            {
                return Ok(companiesDto);

            }
            else return NoContent();
        }

        [HttpPost]
        public IActionResult Create(CompanySimpleDto company)
        {
            company.CompanyId = 0;
            _ctx.Companies.Add(_mapper.MapDtoToEntity(company));
            if (_ctx.SaveChanges() > 0)
            {
                return Ok();
            }
            return BadRequest();
        }
        [HttpPut]
        [Route("{id}")]
        public IActionResult Update([FromRoute]int id, [FromBody] CompanySimpleDto Dto)
        {
            var company = _ctx.Companies.Include(c => c.Address).SingleOrDefault(c => c.CompanyId == id);
            if (company == null)
            {
                return BadRequest();
            }

            company.Denomination = Dto.Denomination;
            company.Website = Dto.Website;
            company.VatNumber = Dto.VatNumber;
            company.Size = Dto.Size;
            company.Note = Dto.Note;
            company.Address.Country = Dto.Address.Country;
            company.Address.Region = Dto.Address.Region;
            company.Address.Province = Dto.Address.Province;
            company.Address.City = Dto.Address.City;
            company.Address.Street = Dto.Address.Street;
            company.Address.StreetNumber = Dto.Address.StreetNumber;
            company.Address.zip = Dto.Address.zip;
            if (_ctx.SaveChanges() >0)
                return NoContent();
            else
                return UnprocessableEntity();
        }
        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var company = _ctx.Companies.Include(c => c.Contacts).SingleOrDefault(c => c.CompanyId == id);

            if (company == null)
            {
                return BadRequest();
            }

            if (company.Contacts != null && company.Contacts.Any())
            {
                return Conflict("Violazione vincolo FK!");
            }
            else
            {
                _ctx.Companies.Remove(company);
                _ctx.SaveChanges();
                return NoContent();
            }
           
        }
    }
}
