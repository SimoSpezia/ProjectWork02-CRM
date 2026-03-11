using CrmGruppo5.Data;
using System.ComponentModel.DataAnnotations;

namespace Crm_Gruppo_5.Dto
{
    public class CompanyDto
    {
        public int CompanyId { get; set; }
        [MinLength(2)]
        public required string Denomination { get; set; }
        public int? AddressId { get; set; }
        public string? Website { get; set; }
        [MinLength(11)]
        public required string VatNumber { get; set; }
        public string? Size { get; set; }
        public string? Note { get; set; }
    }
}
