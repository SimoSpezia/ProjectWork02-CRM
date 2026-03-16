using System.ComponentModel.DataAnnotations;

namespace Crm_Gruppo_5.Dto
{
    public class ContactTypeDto
    {
        public int ContactTypeId { get; set; }
        public required string Description { get; set; }
    }
}
