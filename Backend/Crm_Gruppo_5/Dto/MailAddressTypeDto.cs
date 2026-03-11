using System.ComponentModel.DataAnnotations;

namespace Crm_Gruppo_5.Dto
{
    public class MailAddressTypeDto
    {
        public int MailAddressTypeId { get; set; }
        [MinLength(2)]
        public required string Description { get; set; }
        public required int Priority { get; set; }
    }
}
