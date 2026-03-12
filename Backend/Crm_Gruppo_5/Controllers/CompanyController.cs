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
        public IActionResult GetAll()
        {
            try
            {
                var result = _ctx.Companies.ToList().ConvertAll(_mapper.MapBaseEntitytoDto);
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
            var company =  _ctx.Companies.SingleOrDefault(c=>c.CompanyId == id);

            if (company == null)
            {
                return BadRequest($"Company with id {id} not found");
               
            }
            return Ok(_mapper.MapBaseEntitytoDto(company));
        }

        [HttpPost]
        public IActionResult Create(CompanyDto company)
        {
            company.CompanyId = 0;
            _ctx.Companies.Add(company);
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
            var company = _ctx.Companies.SingleOrDefault(c => c.CompanyId == id);

            if (company == null)
            {
                return BadRequest();
            }

            company.Denomination= Dto.Denomination;
            company.AddressId=Dto.AddressId;
            company.Address = _mapper.MapDtoToEntity(Dto.Address);
             _ctx.SaveChangesAsync();

            var result = _mapper.MapBaseEntitytoDto(company);

            return Ok(result);
        }
        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var company = _ctx.Companies.SingleOrDefault(c => c.CompanyId == id);

            if (company == null)
            {
                return BadRequest();
            }
            _ctx.Companies.Remove(company);
            if (_ctx.SaveChanges() == 1)
                return NoContent();
            else
                return UnprocessableEntity();
        }
    }
}
