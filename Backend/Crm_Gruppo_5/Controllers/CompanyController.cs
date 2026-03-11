using Crm_Gruppo_5.Dto;
using CrmGruppo5.Data;
using Microsoft.AspNetCore.Mvc;
using static Azure.Core.HttpHeader;

namespace Crm_Gruppo_5.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CompanyController(Data.ContactDbContext ctx, ILogger<CompanyController> logger, Mapper mapper) : ControllerBase
    {
        private readonly Data.ContactDbContext _ctx = ctx;
        private readonly ILogger<CompanyController> logger = logger;
        private readonly Mapper _mapper = mapper;


        [HttpGet]
        public IActionResult GetAll()
        {
            var result = _ctx.Companies.ToList().ConvertAll(_mapper.MapBaseEntitytoDto);
            return Ok(result);
        }

        [HttpGet]
        [Route("{id}")]
        [HttpGet("{id}")]
        public IActionResult GetSingle(int id)
        {
            var company =  _ctx.Companies.SingleOrDefault(c=>c.CompanyId == id);

            if (company == null)
            {
                logger.LogWarning("Company with id {Id} not found", id);
                return NotFound();
            }

            var companyDto = _mapper.Map<CompanyDto>(company);

            return Ok(companyDto);
        }
        [HttpPost]
        public IActionResult Create([FromBody] CompanyDto companyDto)
        {
            var company = _mapper.Map<Company>(companyDto);

            _ctx.Companies.Add(company);
             _ctx.SaveChangesAsync();

            var result = _mapper.Map<CompanyDto>(company);

            return CreatedAtAction(nameof(GetSingle), new { id = company.CompanyId }, result);
        }
        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] CompanyDto companyDto)
        {
            var company = _ctx.Companies.SingleOrDefault(c => c.CompanyId == id);

            if (company == null)
            {
                logger.LogWarning("Company with id {Id} not found", id);
                return NotFound();
            }

            _mapper.Map(companyDto, company);

             _ctx.SaveChangesAsync();

            var result = _mapper.Map<CompanyDto>(company);

            return Ok(result);
        }
        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var company =  _ctx.Companies.SingleOrDefault(c => c.CompanyId == id);

            if (company == null)
            {
                logger.LogWarning("Company with id {Id} not found", id);
                return NotFound();
            }

            _ctx.Companies.Remove(company);
             _ctx.SaveChangesAsync();

            logger.LogInformation("Company with id {Id} deleted", id);
            return NoContent();
        }
    }
}
