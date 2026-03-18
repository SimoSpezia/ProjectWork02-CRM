using System.ComponentModel.DataAnnotations;

namespace Crm_Gruppo_5.Dto
{
    public class CategoryDto
    {
        public int CategoryId { get; set; }
        [MaxLength(ValidationLengths.LongText)]
        public required string Description { get; set; }
    }
}
