using Crm_Gruppo_5.Dto;
using Microsoft.AspNetCore.Mvc;

namespace Crm_Gruppo_5.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AddressController(Data.ContactDbContext ctx, ILogger<AddressController> logger, Mapper mapper) : ControllerBase
    {

        private readonly Data.ContactDbContext _ctx = ctx;
        private readonly ILogger<AddressController> _logger = logger;
        private readonly Mapper _mapper = mapper;

        [HttpGet]
        [Route("all")]
        public IActionResult GetAll()
        {
            try
            {
                var result = _ctx.Addresses.ToList().ConvertAll(_mapper.MapBaseEntityToDto);
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
        public IActionResult GetSingle([FromRoute] int id)
        {
            var address = _ctx.Addresses.SingleOrDefault(a => a.AddressId == id);

            if (address == null)
            {
                return NotFound($"Address with id {id} not found");
            }

            return Ok(_mapper.MapBaseEntityToDto(address));
        }

        [HttpPost]
        public IActionResult Create(AddressDto address)
        {
            address.AddressId = 0;

            var entity = _mapper.MapDtoToEntity(address);

            _ctx.Addresses.Add(entity);

            if (_ctx.SaveChanges() > 0)
            {
                return CreatedAtAction(nameof(GetSingle), new { id = entity.AddressId }, _mapper.MapBaseEntityToDto(entity));
            }

            return BadRequest();
        }

        [HttpPut]
        [Route("{id}")]
        public IActionResult Update([FromRoute] int id, [FromBody] AddressDto Dto)
        {
            var address = _ctx.Addresses.SingleOrDefault(a => a.AddressId == id);

            if (address == null)
            {
                return NotFound();
            }

            if (!string.IsNullOrEmpty(Dto.Country))
                address.Country = Dto.Country;
            if (!string.IsNullOrEmpty(Dto.Region))
                address.Region = Dto.Region;
            if (!string.IsNullOrEmpty(Dto.Province))
                address.Province = Dto.Province;
            if (!string.IsNullOrEmpty(Dto.City))
                address.City = Dto.City;
            if (!string.IsNullOrEmpty(Dto.Street))
                address.Street = Dto.Street;
            if (!string.IsNullOrEmpty(Dto.StreetNumber))
                address.StreetNumber = Dto.StreetNumber;
            if (!string.IsNullOrEmpty(Dto.Zip))
                address.Zip = Dto.Zip;
            if (Dto.CompanyId.HasValue)
                address.CompanyId = Dto.CompanyId;
            if (Dto.ContactId.HasValue)
                address.ContactId = Dto.ContactId;

            _ctx.SaveChanges();

            var result = _mapper.MapBaseEntityToDto(address);

            return Ok(result);
        }

        [HttpDelete("{id}")]
        public IActionResult Delete([FromRoute] int id)
        {
            var address = _ctx.Addresses.SingleOrDefault(a => a.AddressId == id);

            if (address == null)
            {
                return NotFound();
            }

            _ctx.Addresses.Remove(address);

            if (_ctx.SaveChanges() > 0)
                return NoContent();
            else
                return UnprocessableEntity("Unable to delete the address.");
        }
    }
}
