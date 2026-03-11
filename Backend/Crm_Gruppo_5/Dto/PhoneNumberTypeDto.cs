using System.ComponentModel.DataAnnotations;

namespace Crm_Gruppo_5.Dto
{
    public class PhoneNumberTypeDto
    {
        public int PhoneNumberTypeId { get; set; }
        [MinLength(2)]
        public required string Description { get; set; }
    }
}
