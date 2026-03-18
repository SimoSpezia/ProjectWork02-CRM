using CrmGruppo5.Data;
using System.ComponentModel.DataAnnotations;

namespace Crm_Gruppo_5.Dto
{
    public class AddressDto
    {
        public int AddressId { get; set; }
        [MaxLength(ValidationLengths.DefaultString)]
        public string? Country { get; set; }
        [MaxLength(ValidationLengths.DefaultString)]
        public string? Region { get; set; }
        [MaxLength(ValidationLengths.DefaultString)]
        public string? Province { get; set; }
        [MaxLength(ValidationLengths.DefaultString)]
        public  string? City { get; set; }
        [MaxLength(ValidationLengths.DefaultString)]
        public string? Street { get; set; }
        [MaxLength(ValidationLengths.DefaultString)]
        public string? StreetNumber { get; set; }
        [MaxLength(ValidationLengths.DefaultString)]
        public string? Zip { get; set; }
        public int? CompanyId { get; set; }
        public int? ContactId { get; set; }

    }
}
