using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace Crm_Gruppo_5.Dto
{
    public class MailAddressTypeDto
    {
        public int MailAddressTypeId { get; set; }
        public required string Description { get; set; }
        [DefaultValue(0)]
        public required int Priority { get; set; }
    }
}
