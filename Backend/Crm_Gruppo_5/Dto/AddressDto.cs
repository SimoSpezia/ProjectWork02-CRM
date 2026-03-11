using CrmGruppo5.Data;
using System.ComponentModel.DataAnnotations;

namespace Crm_Gruppo_5.Dto
{
    public class AddressDto
    {
        public int AddressId { get; set; }
        [MinLength(2)]
        public required string Country { get; set; }
        public string? Region { get; set; }
        public string? Province { get; set; }
        [MinLength(2)]
        public required string City { get; set; }
        [MinLength(2)]
        public required string Street { get; set; }
        [MinLength(1)]
        public required string StreetNumber { get; set; }

    }
}
