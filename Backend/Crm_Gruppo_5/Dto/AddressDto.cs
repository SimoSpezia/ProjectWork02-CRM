using CrmGruppo5.Data;
using System.ComponentModel.DataAnnotations;

namespace Crm_Gruppo_5.Dto
{
    public class AddressDto
    {
        public int AddressId { get; set; }
        public string? Country { get; set; }
        public string? Region { get; set; }
        public string? Province { get; set; }
        public  string? City { get; set; }
        public string? Street { get; set; }
        public string? StreetNumber { get; set; }
        public string? zip { get; set; }
        public int? CompanyId { get; set; }
        public int? ContactId { get; set; }

    }
}
