using CrmGruppo5.Data;
using System.ComponentModel.DataAnnotations;

namespace Crm_Gruppo_5.Dto
{
    public class CompanyDto
    {
        public int CompanyId { get; set; }
        [MaxLength(ValidationLengths.DefaultString)]
        public required string Denomination { get; set; }
        [MaxLength(ValidationLengths.Url)]
        public string? Website { get; set; }
        [MinLength(11)]
        public required string VatNumber { get; set; }
        [MaxLength(ValidationLengths.DefaultString)]
        public string? Size { get; set; }
        [MaxLength(ValidationLengths.LongText)]
        public string? Note { get; set; }
        public int? CountContacts { get; set; }
    }
}
